
import { NextRequest, NextResponse } from 'next/server';
import Moralis from 'moralis';
import { ethers } from 'ethers';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

// Define a unified type for our balance objects
type CombinedBalance = {
    token_address: string;
    symbol: string;
    name: string;
    logo?: string;
    thumbnail?: string;
    decimals: number;
    balance: string;
    possible_spam: boolean;
    usd_value: number;
};


export async function GET(request: NextRequest) {
    if (!MORALIS_API_KEY) {
        console.error("MORALIS_API_KEY is not set. Please set it in your environment variables.");
        return NextResponse.json({ error: 'Moralis API key is not configured.' }, { status: 500 });
    }
    
    // Ensure Moralis is started for each request in a serverless environment
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
        // Fetch both native balance and token balances in parallel
        const [nativeBalanceResponse, tokenBalancesResponse] = await Promise.all([
            Moralis.EvmApi.balance.getNativeBalance({ address, chain }),
            Moralis.EvmApi.token.getWalletTokenBalances({ address, chain })
        ]);
        
        const nativeBalance = nativeBalanceResponse.raw;
        const tokenBalances = tokenBalancesResponse.raw;

        const combinedBalances: CombinedBalance[] = tokenBalances.map((token: any) => ({
             ...token,
             usd_value: token.usd_value || 0, // Ensure usd_value exists
        }));

        // Add native balance to the list of tokens, ensuring it's formatted consistently
        if (nativeBalance && nativeBalance.balance && (nativeBalance as any).symbol) {
             const nativeValue = (nativeBalance as any).usd_price ? (Number(ethers.formatUnits(nativeBalance.balance, (nativeBalance as any).decimals || 18)) * (nativeBalance as any).usd_price) : 0;
             combinedBalances.unshift({
                token_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Standard placeholder for native currency
                symbol: (nativeBalance as any).symbol,
                name: (nativeBalance as any).name || (nativeBalance as any).symbol,
                logo: undefined, 
                thumbnail: undefined,
                decimals: (nativeBalance as any).decimals || 18,
                balance: nativeBalance.balance,
                possible_spam: false,
                usd_value: nativeValue,
            });
        }
       
        return NextResponse.json(combinedBalances);
    } catch (error: any) {
        console.error("Failed to fetch from Moralis:", error.message);
        // It's better to return the actual error message from Moralis if available
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch token balances from Moralis.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
