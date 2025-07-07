
import {NextResponse} from 'next/server';
import {checkReputation} from '@/ai/flows/reputation-flow';

export async function POST(req: Request) {
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
