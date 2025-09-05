
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import type { Cryptocurrency } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from './ui/button';

type Balance = {
    name: string;
    symbol: string;
    logo?: string;
    balance: string;
    usdValue: number;
    address?: string;
};

interface DashboardTableProps {
  balances: Balance[];
  totalValue: number;
  allTokens: Cryptocurrency[];
}

const PriceDisplay = ({ tokenSymbol, allTokens }: { tokenSymbol: string, allTokens: Cryptocurrency[] }) => {
    const tokenInfo = allTokens.find(t => t.symbol === tokenSymbol);
    if (!tokenInfo) return (
      <div className="flex flex-col items-end">
        <span>-</span>
        <span className="text-xs">-</span>
      </div>
    );
    
    return (
        <div className="flex flex-col items-end">
            <span className="font-mono">${tokenInfo.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            <div className={cn("text-xs flex items-center", tokenInfo.change24h >= 0 ? "text-green-500" : "text-destructive")}>
                 {tokenInfo.change24h >= 0 ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
                 {Math.abs(tokenInfo.change24h).toFixed(2)}%
            </div>
        </div>
    )
}

export function DashboardTable({ balances, totalValue, allTokens }: DashboardTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Token</TableHead>
          <TableHead>Portfolio %</TableHead>
          <TableHead className="text-right">Price (24hr)</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {balances.map((token) => {
          const tokenInfo = allTokens.find(t => t.symbol === token.symbol);
          const currentPrice = tokenInfo?.price || 0;
          const usdValue = parseFloat(token.balance) * currentPrice;
          const portfolioPercentage = totalValue > 0 ? (usdValue / totalValue) * 100 : 0;
          
          return (
            <TableRow key={token.symbol}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image
                    src={token.logo || `https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`}
                    alt={token.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-bold">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">{token.name}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">Buy</Button>
                </div>
              </TableCell>
              <TableCell className="font-mono">
                {portfolioPercentage.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">
                <PriceDisplay tokenSymbol={token.symbol} allTokens={allTokens} />
              </TableCell>
              <TableCell className="text-right">
                <p className="font-mono font-semibold">${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-muted-foreground font-mono">{parseFloat(token.balance).toLocaleString('en-US', { maximumFractionDigits: 4 })} {token.symbol}</p>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
