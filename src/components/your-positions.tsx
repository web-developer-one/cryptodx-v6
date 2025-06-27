'use client';

import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from '@/components/wallet-connect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Layers } from 'lucide-react';
import Link from 'next/link';
import { PositionsTable } from '@/components/positions-table';
import type { Cryptocurrency, Position } from '@/lib/types';
import { useMemo } from 'react';

export function YourPositions({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
    const { isActive } = useWallet();
    
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
                <Card className="w-full max-w-lg mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Briefcase className="h-6 w-6" />
                            <span>Your Positions</span>
                        </CardTitle>
                        <CardDescription>
                            Connect your wallet to view your liquidity positions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Your active liquidity positions will be displayed here once you connect your wallet.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <WalletConnect>
                           <Button size="lg">Connect Wallet</Button>
                        </WalletConnect>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (mockPositions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <Card className="w-full max-w-lg mt-6">
                    <CardHeader>
                         <CardTitle className="flex items-center justify-center gap-2">
                            <Layers className="h-6 w-6" />
                            <span>No Positions Found</span>
                        </CardTitle>
                        <CardDescription>
                           You do not have any active liquidity positions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Create a new position by providing liquidity to a pool.
                        </p>
                    </CardContent>
                     <CardFooter className="flex justify-center">
                        <Link href="/pools">
                            <Button size="lg">Explore Pools</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
         <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Your Positions</h1>
                <Link href="/pools">
                    <Button>+ New Position</Button>
                </Link>
            </div>
            <PositionsTable positions={mockPositions} />
        </div>
    );
}
