'use server';

import {NextResponse} from 'next/server';
import {checkReputation} from '@/ai/flows/reputation-flow';

const API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    console.error('GOOGLE_API_KEY is not set for reputation check');
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

    const result = await checkReputation({ tokenName });
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in reputation API:', error);
    return NextResponse.json(
      {error: 'The AI service failed to process the request. Please try again.', details: error.message},
      {status: 500}
    );
  }
}
