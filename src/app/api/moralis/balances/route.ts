
import { NextRequest, NextResponse } from 'next/server';
import Moralis from 'moralis';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

// This function is now simplified to only fetch raw balances from Moralis.
// Price enrichment will be handled on the client-side for better reliability.
export async function GET(request: NextRequest) {
    if (!MORALIS_API_KEY) {
        console.error("MORALIS_API_KEY is not set.");
        return NextResponse.json({ error: 'Moralis API key is not configured.' }, { status: 500 });
    }
    
    try {
        if (!Moralis.Core.isStarted) {
            await Moralis.start({ apiKey: MORALIS_API_KEY });
        }
    } catch (e) {
        console.error("Failed to start Moralis", e);
        return NextResponse.json({ error: 'Failed to initialize Moralis SDK.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainId = searchParams.get('chain');
    
    if (!address || !chainId) {
        return NextResponse.json({ error: 'Address and chain are required parameters.' }, { status: 400 });
    }

    try {
        const [nativeBalanceResponse, tokenBalancesResponse] = await Promise.all([
            Moralis.EvmApi.balance.getNativeBalance({ address, chain: chainId }),
            Moralis.EvmApi.token.getWalletTokenBalances({ address, chain: chainId })
        ]);

        return NextResponse.json({
            nativeBalance: nativeBalanceResponse?.raw,
            tokenBalances: tokenBalancesResponse?.raw || []
        });

    } catch (error: any) {
        console.error("Failed to fetch from Moralis:", error.message);
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred while fetching balances from Moralis.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
