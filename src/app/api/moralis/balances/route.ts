
import { NextRequest, NextResponse } from 'next/server';
import Moralis from 'moralis';
import { ethers } from 'ethers';
import { networkConfigs } from '@/lib/network-configs';
import { getLatestListings } from '@/lib/coinmarketcap';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

type CombinedBalance = {
    token_address: string;
    symbol: string;
    name: string;
    logo?: string | null;
    thumbnail?: string | null;
    decimals: number;
    balance: string;
    possible_spam: boolean;
    usdValue: number;
};

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

    const selectedNetwork = networkConfigs[chainId];
    if (!selectedNetwork) {
         return NextResponse.json({ error: 'Unsupported chain specified.' }, { status: 400 });
    }

    try {
        // Step 1: Fetch balances from Moralis first.
        const [nativeBalanceResponse, tokenBalancesResponse] = await Promise.all([
            Moralis.EvmApi.balance.getNativeBalance({ address, chain: chainId }),
            Moralis.EvmApi.token.getWalletTokenBalances({ address, chain: chainId })
        ]);
        
        const nativeBalanceData = nativeBalanceResponse?.raw;
        const tokenBalancesData = tokenBalancesResponse?.raw || [];

        // Step 2: Fetch prices from CoinMarketCap *after* getting balances.
        const { data: cryptoData, error: cryptoError } = await getLatestListings();
        if (cryptoError) {
             console.warn("Could not fetch crypto prices for balance calculation. Values may be incomplete.", cryptoError);
             // We can still proceed without prices, values will just be 0.
        }

        const allBalances: CombinedBalance[] = [];

        // Process native balance (ETH, AVAX, etc.)
        if (nativeBalanceData && nativeBalanceData.balance) {
             const nativeBalanceFormatted = ethers.formatUnits(nativeBalanceData.balance, selectedNetwork.nativeCurrency.decimals);
             const nativeTokenInfo = cryptoData?.find(t => t.symbol === selectedNetwork.nativeCurrency.symbol);
             const nativeUsdValue = nativeTokenInfo ? parseFloat(nativeBalanceFormatted) * nativeTokenInfo.price : 0;
             
             allBalances.push({
                token_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                symbol: selectedNetwork.nativeCurrency.symbol,
                name: selectedNetwork.nativeCurrency.name,
                logo: selectedNetwork.logo || null,
                thumbnail: selectedNetwork.logo || null,
                decimals: selectedNetwork.nativeCurrency.decimals,
                balance: nativeBalanceFormatted,
                possible_spam: false,
                usdValue: nativeUsdValue,
            });
        }
        
        // Process ERC-20 token balances
        if (tokenBalancesData.length > 0) {
            tokenBalancesData.forEach(token => {
                if (token.possible_spam) return;

                const formattedBalance = ethers.formatUnits(token.balance, token.decimals);
                const tokenInfo = cryptoData?.find(t => t.symbol === token.symbol);
                const price = tokenInfo ? tokenInfo.price : 0;
                const usdValue = price ? parseFloat(formattedBalance) * price : 0;

                allBalances.push({
                    token_address: token.token_address,
                    symbol: token.symbol,
                    name: token.name,
                    logo: token.logo,
                    thumbnail: token.thumbnail,
                    decimals: token.decimals,
                    balance: formattedBalance,
                    possible_spam: token.possible_spam,
                    usdValue: usdValue,
                });
            });
        }
       
        // Sort by USD value descending
        allBalances.sort((a, b) => b.usdValue - a.usdValue);

        return NextResponse.json(allBalances);

    } catch (error: any) {
        console.error("Failed to fetch from Moralis:", error.message);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch token balances from Moralis.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
