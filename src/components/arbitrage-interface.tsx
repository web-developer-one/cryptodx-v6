
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Cryptocurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { useRouter } from 'next/navigation';

interface ArbitrageOpportunity {
  token: Cryptocurrency;
  exchangeA: { name: string; price: number };
  exchangeB: { name: string; price: number };
  profitPercentage: number;
}

// Generate mock opportunities
const generateMockOpportunities = (cryptocurrencies: Cryptocurrency[]): ArbitrageOpportunity[] => {
  if (cryptocurrencies.length < 5) return [];

  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin'];
  const opportunities: ArbitrageOpportunity[] = [];
  const usedTokens = new Set<string>();

  const shuffledTokens = [...cryptocurrencies].sort(() => 0.5 - Math.random());

  for (const token of shuffledTokens) {
    if (opportunities.length >= 5) break;
    if (usedTokens.has(token.symbol)) continue;

    const price = token.price;
    if (price < 0.1) continue; // Ignore very low-priced tokens for realism

    // Create a plausible price difference
    const difference = (Math.random() - 0.4) * 0.02 + 0.005; // 0.5% to 2.5% difference
    if (difference < 0.005) continue; // Ignore very small differences
    
    const exchangeAIndex = Math.floor(Math.random() * exchanges.length);
    let exchangeBIndex = Math.floor(Math.random() * exchanges.length);
    while (exchangeAIndex === exchangeBIndex) {
      exchangeBIndex = Math.floor(Math.random() * exchanges.length);
    }

    const priceA = price * (1 - difference / 2);
    const priceB = price * (1 + difference / 2);

    opportunities.push({
      token: token,
      exchangeA: { name: exchanges[exchangeAIndex], price: priceA },
      exchangeB: { name: exchanges[exchangeBIndex], price: priceB },
      profitPercentage: ((priceB - priceA) / priceA) * 100,
    });
    usedTokens.add(token.symbol);
  }
  return opportunities.sort((a,b) => b.profitPercentage - a.profitPercentage);
};

export function ArbitrageInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t } = useLanguage();
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Initial generation
    setOpportunities(generateMockOpportunities(cryptocurrencies));

    // Update opportunities every 10 seconds
    const interval = setInterval(() => {
      setOpportunities(generateMockOpportunities(cryptocurrencies));
    }, 10000);

    return () => clearInterval(interval);
  }, [cryptocurrencies]);
  
  const handleTradeClick = (opportunity: ArbitrageOpportunity) => {
    router.push(`/?fromToken=${opportunity.token.symbol}`);
  };

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
              <TableHead>{t('ArbitrageInterface.tableHeaderToken')}</TableHead>
              <TableHead>{t('ArbitrageInterface.tableHeaderExA')}</TableHead>
              <TableHead>{t('ArbitrageInterface.tableHeaderExB')}</TableHead>
              <TableHead className="text-right">{t('ArbitrageInterface.tableHeaderProfit')}</TableHead>
              <TableHead className="text-center">{t('ArbitrageInterface.tableHeaderAction')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.length > 0 ? (
              opportunities.map((op) => (
                <TableRow key={op.token.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={op.token.logo || 'https://placehold.co/32x32.png'}
                        alt={op.token.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="font-medium">{op.token.name} ({op.token.symbol})</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-mono">${op.exchangeA.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})}</span>
                        <span className="text-xs text-muted-foreground">{op.exchangeA.name}</span>
                    </div>
                  </TableCell>
                   <TableCell>
                    <div className="flex flex-col">
                        <span className="font-mono">${op.exchangeB.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})}</span>
                        <span className="text-xs text-muted-foreground">{op.exchangeB.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono font-bold text-success">
                        {op.profitPercentage.toFixed(3)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" onClick={() => handleTradeClick(op)}>
                        {t('ArbitrageInterface.tradeButton')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  {t('ArbitrageInterface.noOpportunities')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
