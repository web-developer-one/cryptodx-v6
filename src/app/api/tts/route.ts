
import { NextResponse } from 'next/server';
import { textToSpeech } from '@/ai/flows/tts-flow';

const API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    console.error('GOOGLE_API_KEY is not set for TTS');
    return NextResponse.json(
      { error: 'The AI API key is not configured on the server. Please set the GOOGLE_API_KEY environment variable.' },
      { status: 500 }
    );
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for TTS.' },
        { status: 400 }
      );
    }
    
    const result = await textToSpeech(text);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in TTS API:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech.', details: error.message },
      { status: 500 }
    );
  }
}
