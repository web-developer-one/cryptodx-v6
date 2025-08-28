'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Cryptocurrency, Transaction, SelectedCurrency, TransactionStatus } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionsTable } from './transactions-table';
import { useLanguage } from '@/hooks/use-language';
import { getLatestListings } from '@/lib/coinmarketcap';
import { ApiErrorCard } from './api-error-card';
import { Skeleton } from './ui/skeleton';
import { useWallet } from '@/hooks/use-wallet';
import type { NetworkConfig } from '@/hooks/use-wallet';

// Mocked data for supported fiat currencies and their rates against USD
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

// Helper function to generate a single mock transaction
const generateSingleMockTransaction = (cryptocurrencies: Cryptocurrency[], network: NetworkConfig): Transaction => {
    const types: Transaction['type'][] = ['Swap', 'Add', 'Remove'];
    const statuses: TransactionStatus[] = ['Completed', 'Pending', 'Failed', 'Completed'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    let tokenA = cryptocurrencies[Math.floor(Math.random() * cryptocurrencies.length)];
    let tokenB = cryptocurrencies[Math.floor(Math.random() * cryptocurrencies.length)];
    // Ensure tokens are different
    while (tokenA.id === tokenB.id) {
        tokenB = cryptocurrencies[Math.floor(Math.random() * cryptocurrencies.length)];
    }

    let token0, token1, amount0, amount1, value;
    
    if (type === 'Swap') {
        token0 = tokenA;
        token1 = tokenB;
        amount0 = Math.random() * 10;
        amount1 = (amount0 * token0.price) / token1.price;
        value = amount0 * token0.price;
    } else { // Add or Remove
        token0 = cryptocurrencies.find(c => c.symbol === network.nativeCurrency.symbol) || tokenA;
        token1 = cryptocurrencies.find(c => c.symbol === 'USDC') || tokenB;
        amount0 = Math.random() * 5;
        if(token0 && token1 && token1.price > 0) {
            amount1 = (amount0 * token0.price) / token1.price;
            value = (amount0 * token0.price) * 2;
        } else {
            amount1 = 0;
            value = 0;
        }
    }
    
    return {
        type,
        status,
        token0,
        token1,
        amount0,
        amount1,
        value,
        id: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        account: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        timestamp: new Date(),
    };
};

export function TransactionsClient() {
    const { t } = useLanguage();
    const { selectedNetwork } = useWallet();
    const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(supportedCurrencies[0]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allTokens, setAllTokens] = useState<Cryptocurrency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = t('PageTitles.transactions');
    }, [t]);

    const initializeTransactions = useCallback((tokens: Cryptocurrency[], network: NetworkConfig) => {
        const initialTxs = Array.from({ length: 20 }, (_, i) => ({
            ...generateSingleMockTransaction(tokens, network),
            timestamp: new Date(Date.now() - (i * 1000 * (Math.random() * 10 + 5))),
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setTransactions(initialTxs);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            const { data: cryptoData, error: fetchError } = await getLatestListings();
            if (fetchError) {
                setError(fetchError);
            } else {
                setAllTokens(cryptoData);
                initializeTransactions(cryptoData, selectedNetwork);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [selectedNetwork, initializeTransactions]);

    useEffect(() => {
        if (isLoading || error || allTokens.length === 0) return;

        const intervalId = setInterval(() => {
            setTransactions(prevTransactions => {
                const newTx = generateSingleMockTransaction(allTokens, selectedNetwork);
                const updatedTransactions = [newTx, ...prevTransactions];
                if (updatedTransactions.length > 50) {
                    updatedTransactions.pop();
                }
                return updatedTransactions;
            });
        }, 2000); // Add a new transaction every 2 seconds

        return () => clearInterval(intervalId);
    }, [isLoading, error, allTokens, selectedNetwork]);


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
            <TransactionsTable transactions={transactions} currency={selectedCurrency} network={selectedNetwork} />
        </>
    );
}
