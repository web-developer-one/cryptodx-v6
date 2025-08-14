
import { NextResponse } from 'next/server';
import type { Cryptocurrency } from '@/lib/types';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

// A predefined list of popular token addresses on the Ethereum mainnet.
// In a real-world application, you might get this from another API or a curated list.
const POPULAR_TOKEN_ADDRESSES = [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    "0x7D1AfA7B718fb893dB30A3aBc0C458d9C7848Ac1", // MATIC
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
    "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", // ENS
    "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", // MKR
    "0xDe30da39c46104798bB5aA314B2415776c17AbAc", // GNO
];

export async function GET() {
  if (!MORALIS_API_KEY) {
    return NextResponse.json({ error: 'Moralis API key is not configured.' }, { status: 500 });
  }

  const tokenMetadataUrl = `https://deep-index.moralis.io/api/v2.2/erc20/metadata?chain=eth&addresses=${POPULAR_TOKEN_ADDRESSES.join(',')}`;

  try {
    const metadataResponse = await fetch(tokenMetadataUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY
      }
    });

    if (!metadataResponse.ok) {
      const errorBody = await metadataResponse.json();
      console.error("Moralis metadata API error:", errorBody);
      return NextResponse.json({ error: 'Failed to fetch token metadata from Moralis.' }, { status: metadataResponse.status });
    }
    
    const metadataList = await metadataResponse.json();

    if (!Array.isArray(metadataList) || metadataList.length === 0) {
        return NextResponse.json({ error: 'No token metadata returned from Moralis.' }, { status: 500 });
    }
    
    const tokenPricesData = await Promise.all(
        metadataList.map(async (token: any) => {
            const priceUrl = `https://deep-index.moralis.io/api/v2.2/erc20/${token.address}/price?chain=eth`;
            const priceResponse = await fetch(priceUrl, {
                headers: {
                    'Accept': 'application/json',
                    'X-API-Key': MORALIS_API_KEY
                }
            });
            if (!priceResponse.ok) {
                console.warn(`Could not fetch price for ${token.symbol}`);
                return { ...token, price: 0 };
            }
            const priceData = await priceResponse.json();
            return { ...token, price: priceData.usdPrice || 0 };
        })
    );

    const formattedTokens: Cryptocurrency[] = tokenPricesData.map((token: any, index: number) => ({
      id: index + 1, 
      name: token.name,
      symbol: token.symbol,
      price: token.price,
      change24h: Math.random() * 10 - 5, // Moralis doesn't provide 24h change easily, so we mock it.
      logo: token.logo,
      cmcRank: index + 1,
    }));

    return NextResponse.json(formattedTokens);

  } catch (error) {
    console.error('Error fetching data from Moralis:', error);
    return NextResponse.json({ error: 'An internal server error occurred while fetching from Moralis.' }, { status: 500 });
  }
}
