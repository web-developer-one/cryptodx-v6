
'use client';

import { useState, useEffect } from 'react';
import type { LiquidityPool, SelectedCurrency, Cryptocurrency } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PoolsTable } from './pools-table';
import { useLanguage } from '@/hooks/use-language';
import { getLatestListings } from '@/lib/coinmarketcap';
import { ApiErrorCard } from './api-error-card';
import { Skeleton } from './ui/skeleton';

// In a real app, this would come from a currency conversion API
const supportedCurrencies: SelectedCurrency[] = [
    { symbol: 'USD', name: 'US Dollar', rate: 1 },
    { symbol: 'EUR', name: 'Euro', rate: 0.93 },
    { symbol: 'GBP', name: 'British Pound', rate: 0.79 },
    { symbol: 'JPY', name: 'Japanese Yen', rate: 157.2 },
    { symbol: 'AUD', name: 'Australian Dollar', rate: 1.51 },
    { symbol: 'CAD', name: 'Canadian Dollar', rate: 1.37 },
    { symbol: 'CHF', name: 'Swiss Franc', rate: 0.90 },
    { symbol: 'CNY', name: 'Chinese Yuan', rate: 7.25 },
    { symbol: 'INR', name: 'Indian Rupee', rate: 83.5 },
];

// Helper function to generate mock pool data
const generateMockPools = (cryptocurrencies: Cryptocurrency[]): LiquidityPool[] => {
    if (cryptocurrencies.length < 10) return [];

    const find = (symbol: string) => cryptocurrencies.find(c => c.symbol === symbol);
    
    const tokenPairs = [
        { s0: 'ETH', s1: 'USDC' },
        { s0: 'WBTC', s1: 'ETH' },
        { s0: 'SOL', s1: 'USDT' },
        { s0: 'MATIC', s1: 'USDC' },
        { s0: 'AVAX', s1: 'USDT' },
        { s0: 'LINK', s1: 'ETH' },
        { s0: 'UNI', s1: 'ETH' },
        { s0: 'DOGE', s1: 'USDT' },
    ];
    
    const networks = ['Ethereum', 'Solana', 'Polygon', 'Arbitrum'];

    return tokenPairs.map((pair, index) => {
        const token0 = find(pair.s0);
        const token1 = find(pair.s1);

        if (!token0 || !token1) return null;

        return {
            id: (index + 1).toString(),
            token0,
            token1,
            network: networks[index % networks.length],
            tvl: Math.random() * 50000000 + 10000000, // $10M - $60M
            volume24h: Math.random() * 5000000 + 1000000, // $1M - $6M
        };
    }).filter((p): p is LiquidityPool => p !== null);
};


export function PoolsClient() {
    const { t } = useLanguage();
    const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(supportedCurrencies[0]);
    const [pools, setPools] = useState<LiquidityPool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = t('PageTitles.pools');
    }, [t]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data, error } = await getLatestListings();
            if (error) {
                setError(error);
            } else {
                setPools(generateMockPools(data));
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleCurrencyChange = (symbol: string) => {
        const currency = supportedCurrencies.find(c => c.symbol === symbol);
        if (currency) {
            setSelectedCurrency(currency);
        }
    };
    
    if (isLoading) {
        return (
            <div className="my-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-10 w-72" />
                    <Skeleton className="h-10 w-56" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="w-full max-w-lg mt-6 mx-auto">
                <ApiErrorCard error={error} context="Cryptocurrency Data" />
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center my-6">
                <h1 className="text-3xl font-bold">{t('PoolsClient.title')}</h1>
                <div className="w-full max-w-[220px]">
                    <Select onValueChange={handleCurrencyChange} defaultValue={selectedCurrency.symbol}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('PoolsClient.selectCurrency')} />
                        </SelectTrigger>
                        <SelectContent>
                            {supportedCurrencies.map(currency => (
                                <SelectItem key={currency.symbol} value={currency.symbol}>
                                    <div className="flex items-center gap-2">
                                        <span>{currency.symbol} - {currency.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <PoolsTable pools={pools} currency={selectedCurrency} />
        </>
    );
}
