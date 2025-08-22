
'use client';

import { useState, useEffect } from 'react';
import type { Cryptocurrency, Transaction, SelectedCurrency, TransactionStatus } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionsTable } from './transactions-table';
import { useLanguage } from '@/hooks/use-language';
import { getLatestListings } from '@/lib/coinmarketcap';
import { ApiErrorCard } from './api-error-card';
import { Skeleton } from './ui/skeleton';

// Mocked data for supported fiat currencies and their rates against USD
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

// Helper function to generate mock transaction data
const generateMockTransactions = (cryptocurrencies: Cryptocurrency[]): Transaction[] => {
    if (cryptocurrencies.length < 10) return [];
    const find = (symbol: string) => cryptocurrencies.find(c => c.symbol === symbol);

    const txs: Omit<Transaction, 'id' | 'timestamp' | 'account'>[] = [];
    const types: Transaction['type'][] = ['Swap', 'Add', 'Remove'];
    const statuses: TransactionStatus[] = ['Completed', 'Pending', 'Completed', 'Failed', 'Completed', 'Completed'];

    for (let i = 0; i < 20; i++) {
        const type = types[i % 3];
        const status = statuses[i % statuses.length];
        const tokenA = cryptocurrencies[i % cryptocurrencies.length];
        const tokenB = cryptocurrencies[(i + 5) % cryptocurrencies.length];

        if (tokenA.id === tokenB.id) continue;

        let token0, token1, amount0, amount1, value;

        if (type === 'Swap') {
            token0 = tokenA;
            token1 = tokenB;
            amount0 = Math.random() * 10;
            amount1 = (amount0 * token0.price) / token1.price;
            value = amount0 * token0.price;
        } else { // Add or Remove
            token0 = find('ETH') || tokenA;
            token1 = find('USDC') || tokenB;
            amount0 = Math.random() * 5;
            amount1 = (amount0 * token0.price) / token1.price;
            value = (amount0 * token0.price) * 2;
        }

        if (token0 && token1) {
            txs.push({ type, status, token0, token1, amount0, amount1, value });
        }
    }
    
    return txs.map((tx, index) => ({
        ...tx,
        id: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        account: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        timestamp: new Date(Date.now() - (index * 1000 * 60 * (Math.random() * 10 + 5))), // 5-15 mins apart
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export function TransactionsClient() {
    const { t } = useLanguage();
    const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(supportedCurrencies[0]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = t('PageTitles.transactions');
    }, [t]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data: cryptoData, error: fetchError } = await getLatestListings();
            if (fetchError) {
                setError(fetchError);
            } else {
                setTransactions(generateMockTransactions(cryptoData));
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
                <Skeleton className="h-[600px] w-full" />
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-6">
                <h1 className="text-3xl font-bold">{t('TransactionsClient.title')}</h1>
                 <div className="w-full md:w-auto md:max-w-[220px]">
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
            <TransactionsTable transactions={transactions} currency={selectedCurrency} />
        </>
    );
}
