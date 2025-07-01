'use server';

import type { ChangellyCurrency, ChangellyRate } from './types';
import crypto from 'crypto';

const API_KEY = process.env.CHANGELLY_API_KEY;
const API_SECRET = process.env.CHANGELLY_API_SECRET;
const API_URL = 'https://api.changelly.com/v2';

async function changellyRequest(method: string, params: any) {
    if (!API_KEY || !API_SECRET) {
        console.error("Changelly API Key or API Secret is not set in environment variables.");
        return { error: { message: "Server is not configured for Changelly API. Please check your .env file." } };
    }

    const message = {
        jsonrpc: "2.0",
        id: crypto.randomUUID(),
        method: method,
        params: params
    };

    try {
        const hmac = crypto.createHmac('sha512', API_SECRET);
        hmac.update(JSON.stringify(message));
        const signature = hmac.digest('hex');
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY,
                'sign': signature
            },
            body: JSON.stringify(message),
            // Revalidate fetched data based on method
            next: { revalidate: method.includes('getCurrencies') ? 3600 : 0 }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Changelly API request for method ${method} failed: ${response.status}`, errorText);
            return { error: { message: `API request failed: ${response.statusText}` } };
        }

        const data = await response.json();
        
        if (data.error) {
            console.error(`Changelly API error for method ${method}:`, data.error.message);
        }

        return data;

    } catch (error) {
        console.error(`Error during Changelly request for method ${method}:`, error);
        return { error: { message: "An unexpected error occurred during the request." } };
    }
}

// In-memory cache for currencies to avoid re-fetching on every request within a short period.
let allCurrenciesCache: ChangellyCurrency[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 3600 * 1000; // 1 hour

async function getAllChangellyCurrencies(): Promise<ChangellyCurrency[]> {
    const now = Date.now();
    if (allCurrenciesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        return allCurrenciesCache;
    }

    const result = await changellyRequest('getCurrenciesFull', {});

    if (result && result.result) {
        allCurrenciesCache = result.result;
        cacheTimestamp = now;
        return result.result;
    }
    return [];
}

export async function getDexCurrencies(): Promise<ChangellyCurrency[]> {
    const allCurrencies = await getAllChangellyCurrencies();
    return allCurrencies.filter(c => !c.is_fiat && c.enabled);
}

export async function getFiatCurrencies(): Promise<ChangellyCurrency[]> {
    const allCurrencies = await getAllChangellyCurrencies();
    return allCurrencies.filter(c => c.is_fiat && c.enabled);
}

export async function getDexRate(from: string, to: string, amount: string): Promise<ChangellyRate | null> {
    if (!from || !to || !amount || parseFloat(amount) <= 0) return null;
    const params = [{ from, to, amount }];
    try {
        const data = await changellyRequest('getExchangeAmount', params);

        if (data && data.result && data.result.length > 0 && data.result[0].amount) {
            const resultAmount = parseFloat(data.result[0].amount);
            // The components expect `rate` and `amount` to be the same total value.
            return { amount: resultAmount, rate: resultAmount };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching Changelly rate for ${from}->${to}:`, error);
        return null;
    }
}
