'use client';

import { useState, useMemo } from 'react';
import type { Cryptocurrency, Transaction } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionsTable } from './transactions-table';

// Mocked data for supported fiat currencies and their rates against USD
// In a real app, this would come from a currency conversion API
const supportedCurrencies = [
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

export interface SelectedCurrency {
    symbol: string;
    name: string;
    rate: number;
}

export function TransactionsClient({ transactions, cryptocurrencies }: { transactions: Transaction[], cryptocurrencies: Cryptocurrency[] }) {
    const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(supportedCurrencies[0]);

    const handleCurrencyChange = (symbol: string) => {
        const currency = supportedCurrencies.find(c => c.symbol === symbol);
        if (currency) {
            setSelectedCurrency(currency);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center my-6">
                <h1 className="text-3xl font-bold">Recent Transactions</h1>
                <div className="w-full max-w-[220px]">
                    <Select onValueChange={handleCurrencyChange} defaultValue={selectedCurrency.symbol}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select currency..." />
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
