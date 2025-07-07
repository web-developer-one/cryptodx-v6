
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
    const {history, message, language} = await req.json();

    if (!message) {
      return NextResponse.json(
        {error: 'Message is required'},
        {status: 400}
      );
    }

    const systemInstruction = `You are a helpful assistant for CryptoDx, a cryptocurrency swap application. When answering questions, especially about factual topics, cryptocurrencies, or news, you must cite your sources. Provide direct URLs to reputable sources like news articles, official documentation, or blockchain explorers at the end of your response. Format them as a list under a 'Sources:' heading.

You MUST respond in the following language: ${language || 'en'}.`;

    const genAI = new GoogleGenerativeAI(API_KEY);
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
