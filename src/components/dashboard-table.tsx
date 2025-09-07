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
import { ArrowDown, ArrowUp, Send } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { Dialog, DialogTrigger } from './ui/dialog';
import { SendTokenDialog, ReceiveTokenDialog } from './dashboard-page-client';

type Balance = {
    name: string;
    symbol: string;
    logo?: string;
    balance: string;
    usdValue: number;
    address?: string;
    decimals: number;
    price: number;
    change24h: number;
};

interface DashboardTableProps {
  balances: Balance[];
  totalValue: number;
}

export function DashboardTable({ balances, totalValue }: DashboardTableProps) {
   if (balances.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <p>No tokens found in this wallet.</p>
      </div>
    )
  }

  // Filter out the fake MCAT token before rendering
  const filteredBalances = balances.filter(token => token.symbol !== 'MCAT');

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[350px]">Token</TableHead>
          <TableHead>Portfolio %</TableHead>
          <TableHead className="text-right">Price (24hr)</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredBalances.map((token) => {
          const usdValue = token.usdValue || 0;
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
                </div>
              </TableCell>
              <TableCell className="font-mono">
                {portfolioPercentage.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">
                 <p className="font-mono font-semibold">${token.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
                 <div className={cn("flex items-center justify-end gap-1 text-sm", token.change24h >= 0 ? "text-success" : "text-destructive")}>
                    {token.change24h >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(token.change24h).toFixed(2)}%
                 </div>
              </TableCell>
              <TableCell className="text-right">
                <p className="font-mono font-semibold">${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-muted-foreground font-mono">{parseFloat(token.balance).toLocaleString('en-US', { maximumFractionDigits: 4 })} {token.symbol}</p>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Send className="mr-2 h-4 w-4" />
                                Send
                            </Button>
                        </DialogTrigger>
                        <SendTokenDialog token={token} />
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                             <Button variant="outline" size="sm">Receive</Button>
                        </DialogTrigger>
                        <ReceiveTokenDialog address={token.address || ''} />
                    </Dialog>
                    <Link href={`/buy?token=${token.symbol}`} passHref>
                        <Button variant="outline" size="sm">Buy</Button>
                    </Link>
                    <Link href={`/sell?token=${token.symbol}`} passHref>
                        <Button variant="outline" size="sm">Sell</Button>
                    </Link>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
