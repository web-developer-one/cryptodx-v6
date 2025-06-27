'use client';

import { useState } from 'react';
import type { LiquidityPool, SelectedCurrency } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PoolsTable } from './pools-table';

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


export function PoolsClient({ pools }: { pools: LiquidityPool[] }) {
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
                <h1 className="text-3xl font-bold">Available Liquidity Pools</h1>
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
            <PoolsTable pools={pools} currency={selectedCurrency} />
        </>
    );
}
