
import { NextResponse } from 'next/server';
import { generateUpdate } from '@/ai/flows/generate-update-flow';

const API_KEY = process.env.GOOGLE_API_KEY;

export async function GET(req: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'The AI API key is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const result = await generateUpdate();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in live-update API:', error);
    return NextResponse.json(
      { error: 'Failed to generate update.', details: error.message },
      { status: 500 }
    );
  }
}
