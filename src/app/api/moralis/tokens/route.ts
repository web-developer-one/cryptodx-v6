
import { NextResponse } from 'next/server';
import type { Cryptocurrency } from '@/lib/types';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

// This endpoint provides a more dynamic and relevant list for a swap interface.
const MORALIS_TOKEN_API_URL = 'https://deep-index.moralis.io/api/v2.2/market-data/erc20s/top-movers';

export async function GET() {
  if (!MORALIS_API_KEY) {
    return NextResponse.json({ error: 'Moralis API key is not configured.' }, { status: 500 });
  }

  try {
    const response = await fetch(MORALIS_TOKEN_API_URL, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY
      }
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Moralis top-movers API error:", errorBody);
      return NextResponse.json({ error: 'Failed to fetch token data from Moralis.' }, { status: response.status });
    }
    
    const data = await response.json();
    
    if (!data.market_data || data.market_data.length === 0) {
        return NextResponse.json({ error: 'No token data returned from Moralis.' }, { status: 500 });
    }

    const formattedTokens: Cryptocurrency[] = data.market_data.map((token: any) => ({
      id: token.market_cap_rank || token.rank,
      name: token.name,
      symbol: token.symbol.toUpperCase(),
      price: token.price_usd,
      change24h: token.price_change_24h,
      logo: token.logo,
      cmcRank: token.market_cap_rank,
      marketCap: token.market_cap,
      volume24h: token.volume_24h,
      circulatingSupply: token.circulating_supply,
    }));
    
    // Sort by rank as the API doesn't always guarantee it
    formattedTokens.sort((a,b) => (a.cmcRank || 9999) - (b.cmcRank || 9999));

    return NextResponse.json(formattedTokens);

  } catch (error) {
    console.error('Error fetching data from Moralis:', error);
    return NextResponse.json({ error: 'An internal server error occurred while fetching from Moralis.' }, { status: 500 });
  }
}
