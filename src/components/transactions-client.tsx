
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

const realTransactionData: Record<string, { tx: string; account: string }[]> = {
    '0x1': [ // Ethereum
        { tx: '0x2c9a59a366782c5a3d5b0f718a2e2a7a5e8840b1078f1e68bce0e02c0c7a36f5', account: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
        { tx: '0x8a9c3727931f1f45615b8a91c7849e7a2be2897e411516f4e6b1d5e67f779b8c', account: '0x18Ac474351757894565780562e6452a2337a1a4b' },
        { tx: '0x0e5d48892f39973273c1e3cd8c973546a15234c8965d564177b8c8c2b7f0e2b2', account: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    ],
    '0xa86a': [ // Avalanche
        { tx: '0x1b4f4c8b2d1d0f5e1d5e5f5c3c1e2b2a1a1f0f0c0d0b0a090807060504030201', account: '0x4f60579D4aA3e479B87E5b8A2a2f9a2b8e8f8c4d' },
        { tx: '0x2a2b2c2d2e2f202122232425262728292a2b2c2d2e2f30313233343536373839', account: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' },
    ],
     '0xa4b1': [ // Arbitrum
        { tx: '0x4c5b5c777e5d185e335275591440788325a835a6396f4a36999a22c5440be157', account: '0x4a4b4c4d4e4f50515253545556575859606162636465666768696a6b6c6d6e6f' },
        { tx: '0x1d1e1f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c', account: '0x3a3b3c3d3e3f404142434445464748494a4b4c4d4e4f50515253545556575859' },
    ],
     '0x38': [ // BSC
        { tx: '0x1f0e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4', account: '0x8AC76a51cc950d9822D68b83fE1Ad97B37Fb5453' },
        { tx: '0xf8c7b6a5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39', account: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
    ]
    // Add more for other networks as needed
};

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
    
    const validNetworkId = Object.keys(realTransactionData).includes(network.chainId) ? network.chainId : '0x1';
    const realData = realTransactionData[validNetworkId];
    const randomRealData = realData[Math.floor(Math.random() * realData.length)];
    
    return {
        type,
        status,
        token0,
        token1,
        amount0,
        amount1,
        value,
        id: randomRealData.tx,
        account: randomRealData.account,
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
