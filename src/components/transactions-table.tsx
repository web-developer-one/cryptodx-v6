
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
import { ArrowUpRight, Plus, Minus, ArrowRight, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { SelectedCurrency } from './transactions-client';
import { useToast } from '@/hooks/use-toast';

// Client-side only component to prevent hydration mismatch
const FormattedCurrency = ({ value, currency }: { value: number, currency: SelectedCurrency }) => {
    const [formatted, setFormatted] = useState<string | null>(null);

    useEffect(() => {
        const convertedValue = value * currency.rate;
        setFormatted(
            new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency.symbol,
                notation: 'compact',
                maximumFractionDigits: 2,
            }).format(convertedValue)
        );
    }, [value, currency]);

    // Render nothing on server and initial client render to avoid mismatch
    return <>{formatted || null}</>;
};

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const CopyButton = ({ textToCopy, itemLabel }: { textToCopy: string; itemLabel: string; }) => {
    const { toast } = useToast();

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast({
                title: "Copied!",
                description: `The ${itemLabel} has been copied to your clipboard.`,
            });
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to copy.",
            });
        });
    };

    return (
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={handleCopy}>
            <Copy className="h-3 w-3" />
            <span className="sr-only">Copy {itemLabel}</span>
        </Button>
    );
};


const TransactionDetails = ({ transaction }: { transaction: Transaction }) => {
    const { type, token0, token1, amount0, amount1 } = transaction;

    const formatAmount = (amount: number) => amount.toLocaleString('en-US', { maximumFractionDigits: 4 });

    const simplifiedDescription = () => {
        switch (type) {
            case 'Swap': return `Swap ${token0.symbol} for ${token1.symbol}`;
            case 'Add': return `Add ${token0.symbol} and ${token1.symbol}`;
            case 'Remove': return `Remove ${token0.symbol} and ${token1.symbol}`;
            default: return 'Unknown Action';
        }
    };

    const separatorIcon = () => {
        switch (type) {
            case 'Swap': return <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />;
            case 'Add': return <Plus className="h-4 w-4 text-muted-foreground mx-2" />;
            case 'Remove': return <Minus className="h-4 w-4 text-muted-foreground mx-2" />;
            default: return null;
        }
    };
    
    return (
        <div>
            <div className="font-medium">{simplifiedDescription()}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Image src={token0.logo || `https://placehold.co/16x16.png`} alt={token0.name} width={16} height={16} className="rounded-full mr-1.5" />
                <span>{formatAmount(amount0)} {token0.symbol}</span>
                {separatorIcon()}
                <Image src={token1.logo || `https://placehold.co/16x16.png`} alt={token1.name} width={16} height={16} className="rounded-full mr-1.5" />
                <span>{formatAmount(amount1)} {token1.symbol}</span>
            </div>
        </div>
    );
};


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

const TimeAgo = ({ timestamp }: { timestamp: Date }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    // This ensures that the time is calculated on the client-side after hydration,
    // avoiding the server-client mismatch.
    setTimeAgo(formatDistanceToNow(new Date(timestamp), { addSuffix: true }));
  }, [timestamp]);

  if (!timeAgo) {
    // Render nothing during SSR and initial client render
    // to prevent the mismatch.
    return null;
  }

  return <>{timeAgo}</>;
};


export function TransactionsTable({ transactions, currency }: { transactions: Transaction[], currency: SelectedCurrency }) {
    
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-center">Activities</TableHead>
                            <TableHead className="w-[240px]">Details</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="w-[280px]">Account</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>
                                    <div className="flex items-center justify-center">
                                        <div className="inline-flex items-center justify-center p-2 rounded-full bg-secondary">
                                            <TypeIcon type={tx.type} />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <TransactionDetails transaction={tx} />
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    <FormattedCurrency value={tx.value} currency={currency} />
                                </TableCell>
                                <TableCell>
                                     <div className="flex items-center">
                                        <a href={`https://etherscan.io/address/${tx.account}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {truncateAddress(tx.account)}
                                        </a>
                                        <CopyButton textToCopy={tx.account} itemLabel="address" />
                                     </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    <TimeAgo timestamp={tx.timestamp} />
                                </TableCell>
                                <TableCell className="text-right">
                                     <div className="flex items-center justify-end">
                                        <a href={`https://etherscan.io/tx/${tx.id}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
                                        </a>
                                        <CopyButton textToCopy={tx.id} itemLabel="hash" />
                                     </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
