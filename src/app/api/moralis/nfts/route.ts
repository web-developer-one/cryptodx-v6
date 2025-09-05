
import { NextRequest, NextResponse } from 'next/server';
import Moralis from 'moralis';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

export async function GET(request: NextRequest) {
    if (!MORALIS_API_KEY) {
        console.error("MORALIS_API_KEY is not set.");
        return NextResponse.json({ error: 'Moralis API key is not configured.' }, { status: 500 });
    }
    
    if (!Moralis.Core.isStarted) {
        await Moralis.start({ apiKey: MORALIS_API_KEY });
    }

    try {
        const response = await Moralis.EvmApi.marketData.getTopNFTCollectionsByMarketCap({});
        return NextResponse.json(response.raw.result);
    } catch (error: any) {
        console.error("Failed to fetch from Moralis NFT API:", error.message);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch NFT collections from Moralis.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
