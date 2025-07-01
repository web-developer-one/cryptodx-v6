
'use server';

import type { ChangellyCurrency, ChangellyRate, ChangellyFiatCurrency } from './types';

const API_KEY = 'f35acfbd-1e83-4ca3-9848-ceb3d71ae0c1';
const BASE_URL = 'https://dex-api.changelly.com';

const headers = {
  'X-API-Key': API_KEY,
};

export async function getDexCurrencies(): Promise<ChangellyCurrency[]> {
    try {
        const response = await fetch(`${BASE_URL}/v1/currencies`, {
            headers,
            next: { revalidate: 3600 } // Revalidate every hour
        });
        if (!response.ok) {
            console.error("Failed to fetch DEX currencies from Changelly:", await response.text());
            return [];
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching Changelly DEX currencies:", error);
        return [];
    }
}

export async function getFiatCurrencies(): Promise<ChangellyFiatCurrency[]> {
     try {
        const response = await fetch(`${BASE_URL}/v1/fiat-currencies`, {
            headers,
            next: { revalidate: 3600 } // Revalidate every hour
        });
        if (!response.ok) {
            console.error("Failed to fetch fiat currencies from Changelly:", await response.text());
            return [];
        }
        // The API returns an object of objects, so we convert it to an array
        const data = await response.json();
        return Object.values(data);
    } catch (error) {
        console.error("Error fetching Changelly fiat currencies:", error);
        return [];
    }
}


export async function getDexRate(from: string, to: string, amount: string): Promise<ChangellyRate | null> {
    if (!from || !to || !amount || parseFloat(amount) <= 0) return null;
    try {
        const response = await fetch(`${BASE_URL}/v1/rate/${from}/${to}?amount=${amount}`, {
            headers,
            // Use no-cache for rates as they are dynamic
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`Failed to fetch Changelly rate for ${from}->${to}:`, await response.text());
            return null;
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching Changelly rate for ${from}->${to}:`, error);
        return null;
    }
}
