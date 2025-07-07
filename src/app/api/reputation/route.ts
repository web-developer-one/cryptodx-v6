
import { NextResponse } from 'next/server';
import { getReputationReport } from '@/ai/flows/reputation-flow';

export async function POST(req: Request) {
  try {
    const { tokenName, tokenSymbol, language } = await req.json();

    if (!tokenName || !tokenSymbol || !language) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const report = await getReputationReport({
      tokenName,
      tokenSymbol,
      language,
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error in reputation API route:', error);
    return NextResponse.json(
      { error: 'Failed to get reputation report.', details: error.message },
      { status: 500 }
    );
  }
}
