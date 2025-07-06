
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

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
  });
  
  try {
    const {history, message} = await req.json();

    if (!message) {
      return NextResponse.json(
        {error: 'Message is required'},
        {status: 400}
      );
    }

    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: history as Content[],
    });

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({
      response: responseText,
      history: [...history, {role: 'user', parts: [{text: message}]}, {role: 'model', parts: [{text: responseText}]}]
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {error: 'Internal Server Error', details: error.message},
      {status: 500}
    );
  }
}
