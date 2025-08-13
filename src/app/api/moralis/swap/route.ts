
import Moralis from 'moralis';
import { NextResponse } from 'next/server';
import { Aptos, EvmChain } from '@moralisweb3/common-evm-utils';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

export async function POST(req: Request) {
    if (!MORALIS_API_KEY) {
        return NextResponse.json({ error: "Moralis API key is not configured" }, { status: 500 });
    }

    try {
        if (!Moralis.Core.isStarted) {
            await Moralis.start({ apiKey: MORALIS_API_KEY });
        }
        
        const {
            chain,
            fromTokenAddress,
            toTokenAddress,
            amount,
            fromAddress,
        } = await req.json();

        if (!chain || !fromTokenAddress || !toTokenAddress || !amount || !fromAddress) {
            return NextResponse.json({ error: "Missing required parameters for swap quote." }, { status: 400 });
        }
        
        // This is a type guard to ensure the chain is a valid EvmChain enum member
        const chainKey = Object.keys(EvmChain).find(key => EvmChain[key as keyof typeof EvmChain].apiHex === chain) as keyof typeof EvmChain | undefined;
        
        if(!chainKey) {
            return NextResponse.json({ error: `Unsupported chain: ${chain}` }, { status: 400 });
        }
        
        const swapQuote = await Moralis.EvmApi.defi.getQuote({
            chain: EvmChain[chainKey],
            fromTokenAddress,
            toTokenAddress,
            amount,
            fromAddress,
        });
        
        return NextResponse.json(swapQuote);

    } catch (error: any) {
        console.error("Moralis swap quote error:", error);
        return NextResponse.json({ error: error.message || "Failed to get swap quote from Moralis" }, { status: 500 });
    }
}
