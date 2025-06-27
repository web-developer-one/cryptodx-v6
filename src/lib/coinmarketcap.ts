'use server';

import type { Cryptocurrency } from './types';

// This is a server-only file, so the API key is safe.
const API_KEY = 'b7f8dc6a-a214-4b68-8746-84dc87096d7c';
const BASE_URL = 'https://pro-api.coinmarketcap.com';

interface CmcListingResponse {
  data: {
    id: number;
    name: string;
    symbol: string;
    quote: {
      USD: {
        price: number;
        percent_change_24h: number;
      };
    };
  }[];
  status: {
    error_message: string | null;
  };
}

interface CmcInfoResponse {
  data: {
    [key: string]: {
      id: number;
      name: string;
      symbol: string;
      logo: string;
    };
  };
   status: {
    error_message: string | null;
  };
}

export async function getLatestListings(): Promise<Cryptocurrency[]> {
  try {
    const listingsResponse = await fetch(`${BASE_URL}/v1/cryptocurrency/listings/latest?limit=20`, {
      headers: {
        'X-CMC_PRO_API_KEY': API_KEY,
      },
      // Revalidate the data every hour
      next: { revalidate: 3600 }
    });

    if (!listingsResponse.ok) {
        const errorBody = await listingsResponse.text();
        console.error("Failed to fetch listings from CoinMarketCap API:", listingsResponse.status, errorBody);
        return [];
    }

    const listings = (await listingsResponse.json()) as CmcListingResponse;
    
    if (!listings.data || listings.data.length === 0) {
        console.error("CoinMarketCap API returned no data for listings.", listings.status.error_message);
        return [];
    }

    const ids = listings.data.map(coin => coin.id).join(',');

    const infoResponse = await fetch(`${BASE_URL}/v2/cryptocurrency/info?id=${ids}`, {
        headers: {
            'X-CMC_PRO_API_KEY': API_KEY,
        },
        next: { revalidate: 3600 }
    });

    if (!infoResponse.ok) {
        console.error("Failed to fetch metadata from CoinMarketCap API", await infoResponse.text());
        // Return listings without logos if metadata call fails
        return listings.data.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            price: coin.quote.USD.price,
            change24h: coin.quote.USD.percent_change_24h,
            logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png` // Fallback logo construction
        }));
    }

    const infoData = (await infoResponse.json()) as CmcInfoResponse;
    
    const combinedData = listings.data.map(coin => {
      const info = infoData.data[coin.id];
      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price: coin.quote.USD.price,
        change24h: coin.quote.USD.percent_change_24h,
        logo: info ? info.logo : `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
      };
    });

    return combinedData;

  } catch (error) {
    console.error('An unexpected error occurred while fetching from CoinMarketCap:', error);
    return []; // Return empty array on error
  }
}
