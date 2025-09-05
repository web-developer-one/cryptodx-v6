
import { NextRequest, NextResponse } from 'next/server';
import Moralis from 'moralis';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

// Initialize Moralis outside of the handler to avoid re-initializing on every request.
if (MORALIS_API_KEY && !Moralis.Core.isStarted) {
    Moralis.start({ apiKey: MORALIS_API_KEY }).catch(e => console.error("Failed to start Moralis", e));
}

export async function GET(request: NextRequest) {
    if (!MORALIS_API_KEY) {
        console.error("MORALIS_API_KEY is not set.");
        return NextResponse.json({ error: 'Moralis API key is not configured.' }, { status: 500 });
    }
    
    if (!Moralis.Core.isStarted) {
        return NextResponse.json({ error: 'Moralis SDK not initialized. Please try again in a moment.' }, { status: 503 });
    }

    try {
        const response = await Moralis.EvmApi.marketData.getTopNFTCollectionsByMarketCap({});
        
        // The SDK returns a JSON representation of the result. We directly use its result property.
        // It's already an array of collection objects.
        return NextResponse.json(response.result);

    } catch (error: any) {
        console.error("Failed to fetch from Moralis NFT API:", error.message);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch NFT collections from Moralis.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
