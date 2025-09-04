
import { NextRequest, NextResponse } from 'next/server';
import Moralis from 'moralis';
import { ethers } from 'ethers';
import { networkConfigs } from '@/hooks/use-wallet';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

type CombinedBalance = {
    token_address: string;
    symbol: string;
    name: string;
    logo?: string;
    thumbnail?: string;
    decimals: number;
    balance: string;
    possible_spam: boolean;
    usdValue: number;
};

export async function GET(request: NextRequest) {
    if (!MORALIS_API_KEY) {
        console.error("MORALIS_API_KEY is not set. Please set it in your environment variables.");
        return NextResponse.json({ error: 'Moralis API key is not configured.' }, { status: 500 });
    }
    
    if (!Moralis.Core.isStarted) {
        await Moralis.start({ apiKey: MORALIS_API_KEY });
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainId = searchParams.get('chain');
    
    if (!address || !chainId) {
        return NextResponse.json({ error: 'Address and chain are required parameters.' }, { status: 400 });
    }

    const selectedNetwork = networkConfigs[chainId];
    if (!selectedNetwork) {
         return NextResponse.json({ error: 'Unsupported chain specified.' }, { status: 400 });
    }

    try {
        const [nativeBalanceResponse, tokenBalancesResponse] = await Promise.all([
            Moralis.EvmApi.balance.getNativeBalance({ address, chain: chainId }),
            Moralis.EvmApi.token.getWalletTokenBalances({ address, chain: chainId })
        ]);
        
        const nativeBalanceData = nativeBalanceResponse?.raw;
        const tokenBalances = tokenBalancesResponse?.raw || [];
        
        const combinedBalances: CombinedBalance[] = [];

        // Add native balance first
        if (nativeBalanceData && nativeBalanceData.balance) {
             const nativeBalanceFormatted = ethers.formatUnits(nativeBalanceData.balance, selectedNetwork.nativeCurrency.decimals);
             combinedBalances.push({
                token_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                symbol: selectedNetwork.nativeCurrency.symbol,
                name: selectedNetwork.nativeCurrency.name,
                logo: selectedNetwork.logo, 
                thumbnail: selectedNetwork.logo,
                decimals: selectedNetwork.nativeCurrency.decimals,
                balance: nativeBalanceFormatted,
                possible_spam: false,
                usdValue: 0, // No reliable USD value for native from this endpoint
            });
        }
        
        // Add token balances
        tokenBalances
            .filter(token => !token.possible_spam && token.symbol !== 'MCAT' && token.symbol !== 'WBTC')
            .forEach(token => {
                combinedBalances.push({
                    token_address: token.token_address,
                    symbol: token.symbol,
                    name: token.name,
                    logo: token.logo,
                    thumbnail: token.thumbnail,
                    decimals: token.decimals,
                    balance: ethers.formatUnits(token.balance, token.decimals),
                    possible_spam: token.possible_spam,
                    usdValue: token.usd_price || 0,
                });
            });
       
        return NextResponse.json(combinedBalances);
    } catch (error: any) {
        console.error("Failed to fetch from Moralis:", error.message);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch token balances from Moralis.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
