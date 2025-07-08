
import {NextResponse} from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
} from '@google/generative-ai';

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
    const {history, message, language: appLanguage} = await req.json();

    if (!message) {
      return NextResponse.json(
        {error: 'Message is required'},
        {status: 400}
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // --- Start of language detection logic ---
    const languageDetectionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const detectionPrompt = `Identify the primary language of the following text. Respond with only the IETF BCP 47 language code (e.g., "en" for English, "es" for Spanish). Do not add any other words or explanation.
    
Text: "${message}"`;
    
    let detectedLanguage = appLanguage || 'en'; // Default to app's current language
    try {
        const result = await languageDetectionModel.generateContent(detectionPrompt);
        // Clean up response to get just the language code.
        const responseText = result.response.text().trim().replace(/['"`\.]/g, ''); 
        
        // Basic validation of the language code format (e.g., 'en', 'es-MX')
        if (/^[a-z]{2,3}(-[A-Z]{2,4})?$/i.test(responseText)) {
            detectedLanguage = responseText;
        } else {
             console.warn(`Language detection returned invalid format: '${responseText}'. Falling back to app language: ${detectedLanguage}`);
        }
    } catch (e) {
        console.error("Language detection call failed, falling back to app language.", e);
    }
    // --- End of language detection logic ---

    const systemInstruction = `You are a helpful assistant for CryptoDx, a cryptocurrency swap application. When answering questions, especially about factual topics, cryptocurrencies, or news, you must cite your sources. Provide direct URLs to reputable sources like news articles, official documentation, or blockchain explorers at the end of your response. Format them as a list under a 'Sources:' heading.

You MUST respond in the following language: ${detectedLanguage}.`;

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
