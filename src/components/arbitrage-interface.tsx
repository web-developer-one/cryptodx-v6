
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Cryptocurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

// Seeded random number generator for deterministic results
const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

interface ArbitrageOpportunity {
    token: Cryptocurrency;
    priceA: number;
    priceB: number;
    profit: number;
    buyAt: 'A' | 'B';
    sellAt: 'A' | 'B';
}

export function ArbitrageInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
    const { t } = useLanguage();
    const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);

    useEffect(() => {
        const generateOpportunities = () => {
            const random = mulberry32(12345); // Use a fixed seed for consistent "randomness"
            const generated: ArbitrageOpportunity[] = [];

            cryptocurrencies.slice(0, 50).forEach(token => {
                const priceA = token.price;
                const priceB = token.price * (1 + (random() - 0.5) * 0.05); // +/- 2.5% variation
                
                const profit = Math.abs(priceA - priceB) / Math.min(priceA, priceB) * 100;

                if (profit > 0.1) { // Only show opportunities > 0.1%
                     generated.push({
                        token,
                        priceA,
                        priceB,
                        profit,
                        buyAt: priceA < priceB ? 'A' : 'B',
                        sellAt: priceA < priceB ? 'B' : 'A',
                    });
                }
            });

            // Sort by highest profit
            generated.sort((a,b) => b.profit - a.profit);
            setOpportunities(generated.slice(0, 15)); // Take top 15
        };

        generateOpportunities();

        const interval = setInterval(generateOpportunities, 10000); // Regenerate every 10 seconds
        return () => clearInterval(interval);

    }, [cryptocurrencies]);

    return (
        <Card className="w-full max-w-7xl shadow-lg">
            <CardHeader>
                <CardTitle>{t('ArbitrageInterface.opportunitiesTitle')}</CardTitle>
                <CardDescription>{t('ArbitrageInterface.opportunitiesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">{t('ArbitrageInterface.tableHeaderToken')}</TableHead>
                            <TableHead className="text-right">{t('ArbitrageInterface.tableHeaderExA')}</TableHead>
                            <TableHead className="text-right">{t('ArbitrageInterface.tableHeaderExB')}</TableHead>
                            <TableHead className="text-right">{t('ArbitrageInterface.tableHeaderProfit')}</TableHead>
                            <TableHead className="text-center">{t('ArbitrageInterface.tableHeaderAction')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {opportunities.map(op => (
                            <TableRow key={op.token.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Image src={op.token.logo || 'https://placehold.co/24x24.png'} alt={op.token.name} width={24} height={24} className="rounded-full" />
                                        <span className="font-medium">{op.token.name}</span>
                                        <span className="text-muted-foreground">{op.token.symbol}</span>
                                    </div>
                                </TableCell>
                                <TableCell className={cn("text-right font-mono", op.buyAt === 'A' ? 'text-success' : '')}>
                                    ${op.priceA.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                </TableCell>
                                <TableCell className={cn("text-right font-mono", op.buyAt === 'B' ? 'text-success' : '')}>
                                    ${op.priceB.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                </TableCell>
                                <TableCell className="text-right font-medium text-success">
                                    {op.profit.toFixed(2)}%
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className='flex items-center justify-center gap-2'>
                                        <Badge variant={op.buyAt === 'A' ? 'secondary' : 'destructive'} className="border-none">{t('ArbitrageInterface.buyAt')} {op.buyAt}</Badge>
                                        <ArrowRight className="h-4 w-4 mx-1" />
                                        <Badge variant={op.sellAt === 'A' ? 'secondary' : 'destructive'} className="border-none">{t('ArbitrageInterface.sellAt')} {op.sellAt}</Badge>
                                        <Button size="sm" variant="outline" className="ml-4">{t('ArbitrageInterface.tradeButton')}</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {opportunities.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>{t('ArbitrageInterface.noOpportunities')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
