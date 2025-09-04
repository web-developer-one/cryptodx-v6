
import { NextRequest, NextResponse } from 'next/server';
import Moralis from 'moralis';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

export async function GET(request: NextRequest) {
    if (!MORALIS_API_KEY) {
        console.error("MORALIS_API_KEY is not set. Please set it in your environment variables.");
        return NextResponse.json({ error: 'Moralis API key is not configured.' }, { status: 500 });
    }

    // Ensure Moralis is started for every request in a serverless environment
    if (!Moralis.Core.isStarted) {
        await Moralis.start({ apiKey: MORALIS_API_KEY });
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain');
    
    if (!address || !chain) {
        return NextResponse.json({ error: 'Address and chain are required parameters.' }, { status: 400 });
    }

    try {
        const response = await Moralis.EvmApi.token.getWalletTokenBalances({
            address,
            chain,
        });

        // The 'result' property on the JSON response is what we want.
        return NextResponse.json(response.raw);
    } catch (error: any) {
        console.error("Failed to fetch from Moralis:", error);
        return NextResponse.json({ error: 'Failed to fetch token balances from Moralis.', details: error.message }, { status: 500 });
    }
}
