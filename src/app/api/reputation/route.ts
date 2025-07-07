
'use server';

import {NextResponse} from 'next/server';
import {checkReputation} from '@/ai/flows/reputation-flow';

const API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(req: Request) {
  // First, check if the API key is configured on the server.
  if (!API_KEY) {
    console.error('GOOGLE_API_KEY is not set for reputation check');
    // Return a specific, structured error if the key is missing.
    return NextResponse.json(
      { error: 'GOOGLE_API_KEY_MISSING', message: 'The AI API key is not configured on the server. Please set the GOOGLE_API_KEY environment variable.' },
      { status: 500 }
    );
  }

  try {
    const {tokenName} = await req.json();

    if (!tokenName) {
      return NextResponse.json({error: 'Token name is required'}, {status: 400});
    }

    // Call the Genkit flow and return the result.
    const result = await checkReputation({ tokenName });
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in reputation API route:', error);
    // Return a generic but structured error for other failures.
    return NextResponse.json(
      {error: 'AI_SERVICE_ERROR', message: error.message || 'The AI service failed to process the request.'},
      {status: 500}
    );
  }
}
