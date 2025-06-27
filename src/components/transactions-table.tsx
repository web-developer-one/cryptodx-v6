
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { Button } from './ui/button';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
    }).format(value);
};

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};


const ActionDescription = ({ transaction }: { transaction: Transaction }) => {
    const { type, token0, token1, amount0, amount1 } = transaction;

    const formatAmount = (amount: number) => amount.toLocaleString('en-US', { maximumFractionDigits: 4 });

    switch (type) {
        case 'Swap':
            return `Swap ${formatAmount(amount0)} ${token0.symbol} for ${formatAmount(amount1)} ${token1.symbol}`;
        case 'Add':
            return `Add ${formatAmount(amount0)} ${token0.symbol} and ${formatAmount(amount1)} ${token1.symbol}`;
        case 'Remove':
            return `Remove ${formatAmount(amount0)} ${token0.symbol} and ${formatAmount(amount1)} ${token1.symbol}`;
        default:
            return 'Unknown Action';
    }
}

const TypeIcon = ({ type }: { type: Transaction['type'] }) => {
    switch (type) {
        case 'Swap':
            return <ArrowUpRight className="h-4 w-4 text-muted-foreground" />;
        case 'Add':
            return <Plus className="h-4 w-4 text-primary" />;
        case 'Remove':
            return <Minus className="h-4 w-4 text-destructive" />;
        default:
            return null;
    }
}


export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
    
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <TypeIcon type={tx.type} />
                                        <p className="font-medium"><ActionDescription transaction={tx} /></p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(tx.value)}</TableCell>
                                <TableCell>
                                     <a href="#" className="text-primary hover:underline">
                                        {truncateAddress(tx.account)}
                                     </a>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right">
                                     <a href="#" target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="icon">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                     </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
