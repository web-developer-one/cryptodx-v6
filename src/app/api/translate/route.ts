import { NextResponse } from 'next/server';
import { translateTexts, type TranslateTextsInput } from '@/ai/flows/translate-text';

export async function POST(request: Request) {
  try {
    const body: TranslateTextsInput = await request.json();
    
    if (!body.texts || !body.targetLanguage) {
      return NextResponse.json({ error: 'Missing required fields: texts and targetLanguage' }, { status: 400 });
    }
    
    const result = await translateTexts(body);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Translation API route error:', error);
    // Provide a generic error message to the client
    return NextResponse.json({ error: 'An error occurred during translation.' }, { status: 500 });
  }
}
