
import {NextResponse} from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
} from '@google/generative-ai';
import { languages } from '@/lib/i18n';

const API_KEY = process.env.GOOGLE_API_KEY;

// NOTE: Moved initialization into the POST handler to handle missing API key gracefully.

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function POST(req: Request) {
  if (!API_KEY) {
    console.error('GOOGLE_API_KEY is not set');
    return NextResponse.json(
      { error: 'The AI API key is not configured on the server. Please set the GOOGLE_API_KEY environment variable.' },
      { status: 500 }
    );
  }
  
  try {
    const {history, message, language: appLanguage, enableMultilingual} = await req.json();

    if (!message) {
      return NextResponse.json(
        {error: 'Message is required'},
        {status: 400}
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // --- Start of refined language detection logic ---
    let detectedLanguageName = 'English'; // Default to English
    const fallbackLangCode = appLanguage || 'en';
    const fallbackLangName = languages.find(l => l.code === fallbackLangCode)?.englishName || 'English';

    if (enableMultilingual) {
        const languageDetectionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const detectionPrompt = `
          Analyze the following text and identify its primary language.
          Respond with ONLY the official English name of the language (e.g., "English", "Spanish", "French").
          Do not include any other words, punctuation, or explanation. Just the language name.

          Text: "${message}"
        `;
        
        try {
            const result = await languageDetectionModel.generateContent(detectionPrompt);
            const responseText = result.response.text().trim(); 

            // Check if the detected language name is one we support by looking up its English name
            const foundLanguage = languages.find(l => l.englishName.toLowerCase() === responseText.toLowerCase());

            if (foundLanguage) {
                detectedLanguageName = foundLanguage.englishName;
            } else {
                 console.warn(`Detected language '${responseText}' is not in the supported list or format. Falling back to app language: ${fallbackLangName}`);
                 detectedLanguageName = fallbackLangName;
            }
        } catch (e) {
            console.error("Language detection call failed, falling back to app language.", e);
            detectedLanguageName = fallbackLangName;
        }
    }
    // --- End of refined language detection logic ---

    // --- Start of heavily reinforced system instruction ---
    const systemInstruction = `
You are a multilingual assistant for the CryptoDx application. Your most important rule is to respond *only* in the language requested.
The required language for your response is: **${detectedLanguageName}**.

You MUST follow these rules:
1.  **ALWAYS respond in ${detectedLanguageName}**.
2.  Do not switch to English or any other language unless the user explicitly asks you to.
3.  If you cannot answer a question, you must still provide your refusal or explanation in ${detectedLanguageName}.
4.  All parts of your response, including greetings, closings, and citations, must be in ${detectedLanguageName}.
5.  This is a mandatory, non-negotiable instruction.

You are also a helpful assistant for CryptoDx. When answering questions about factual topics, cite your sources.
Provide direct URLs at the end of your response under a heading. This heading must be the ${detectedLanguageName} translation of the English word "Sources:".
    `;
    // --- End of heavily reinforced system instruction ---

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      systemInstruction,
    });

    // Sanitize the history to ensure it only contains the fields the API expects.
    // This prevents errors from extra fields added by the client-side (e.g., audioSrc).
    const sanitizedHistory = history.map((h: any) => ({
      role: h.role,
      parts: h.parts.map((p: any) => ({ text: p.text }))
    }));

    // The Google API requires history to start with a user role and alternate.
    // Our client-side history includes an initial greeting from the model, which we need to filter out.
    const startOfConversation = sanitizedHistory.findIndex((m: Content) => m.role === 'user');
    const validHistory = startOfConversation === -1 ? [] : sanitizedHistory.slice(startOfConversation);


    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: validHistory,
    });

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({
      response: responseText,
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    // Provide a more generic error to the client, but log the details on the server.
    return NextResponse.json(
      {error: 'The AI service failed to process the request. Please try again.'},
      {status: 500}
    );
  }
}
