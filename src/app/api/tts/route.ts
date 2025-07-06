
import { NextResponse } from 'next/server';
import { textToSpeech } from '@/ai/flows/tts-flow';

export async function POST(req: Request) {
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
