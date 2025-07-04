'use client';

import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from '@/components/wallet-connect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Layers } from 'lucide-react';
import Link from 'next/link';
import { PositionsTable } from '@/components/positions-table';
import type { Cryptocurrency, Position, SelectedCurrency } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';

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

export function YourPositions({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
    const { isActive } = useWallet();
    const { t } = useLanguage();
    const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(supportedCurrencies[0]);

    const handleCurrencyChange = (symbol: string) => {
        const currency = supportedCurrencies.find(c => c.symbol === symbol);
        if (currency) {
            setSelectedCurrency(currency);
        }
    };
    
    // Mock data for positions. In a real app, this would be fetched based on the user's account.
    const mockPositions: Position[] = useMemo(() => {
        if (cryptocurrencies.length < 4) return [];
        
        const eth = cryptocurrencies.find(c => c.symbol === 'ETH');
        const usdc = cryptocurrencies.find(c => c.symbol === 'USDC');
        const btc = cryptocurrencies.find(c => c.symbol === 'BTC');
        const sol = cryptocurrencies.find(c => c.symbol === 'SOL');

        if (!eth || !usdc || !btc || !sol) return [];

        return [
            { id: '1', token0: eth, token1: usdc, network: 'Ethereum', value: 1250.75, apr: 12.5 },
            { id: '2', token0: btc, token1: eth, network: 'Ethereum', value: 5430.10, apr: 8.2 },
            { id: '3', token0: sol, token1: usdc, network: 'Solana', value: 880.00, apr: 22.1 },
        ];
    }, [cryptocurrencies]);

    if (!isActive) {
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <Card className="w-full mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Briefcase className="h-6 w-6" />
                            <span>{t('YourPositions.title')}</span>
                        </CardTitle>
                        <CardDescription>
                            {t('YourPositions.connectPrompt')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            {t('YourPositions.connectPromptDescription')}
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <WalletConnect>
                           <Button size="lg">{t('Header.connectWallet')}</Button>
                        </WalletConnect>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (mockPositions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <Card className="w-full mt-6">
                    <CardHeader>
                         <CardTitle className="flex items-center justify-center gap-2">
                            <Layers className="h-6 w-6" />
                            <span>{t('YourPositions.noPositionsTitle')}</span>
                        </CardTitle>
                        <CardDescription>
                           {t('YourPositions.noPositionsDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            {t('YourPositions.createPositionPrompt')}
                        </p>
                    </CardContent>
                     <CardFooter className="flex justify-center">
                        <Link href="/pools/add">
                            <Button size="lg">{t('YourPositions.explorePools')}</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
         <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('YourPositions.title')}</h1>
                <div className="flex items-center gap-4">
                    <div className="w-full max-w-[240px]">
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
                    <Link href="/pools/add">
                        <Button>{t('YourPositions.newPosition')}</Button>
                    </Link>
                </div>
            </div>
            <PositionsTable positions={mockPositions} currency={selectedCurrency} />
        </div>
    );
}
