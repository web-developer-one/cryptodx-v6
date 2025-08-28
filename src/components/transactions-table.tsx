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
import type { Transaction, TransactionStatus, SelectedCurrency } from '@/lib/types';
import type { NetworkConfig } from '@/hooks/use-wallet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowUpRight, Plus, Minus, ArrowRight, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

const symbolMap: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
};

// Client-side only component to prevent hydration mismatch
const FormattedCurrency = ({ value, currency }: { value: number, currency: SelectedCurrency }) => {
    const [formatted, setFormatted] = useState<string | null>(null);

    useEffect(() => {
        const convertedValue = value * currency.rate;
        const numberPart = new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 2,
        }).format(convertedValue);
        
        const symbol = symbolMap[currency.symbol] || currency.symbol;

        setFormatted(`${symbol}${numberPart}`);
    }, [value, currency]);

    // Render nothing on server and initial client render to avoid mismatch
    return <>{formatted || null}</>;
};

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 15)}...${address.substring(address.length - 15)}`;
};

const CopyButton = ({ textToCopy, itemLabel }: { textToCopy: string; itemLabel: string; }) => {
    const { toast } = useToast();
    const { t } = useLanguage();

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast({
                title: t('TransactionsTable.copied'),
                description: t('TransactionsTable.copyHash'),
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
    const { t } = useLanguage();
    const { type, token0, token1, amount0, amount1 } = transaction;

    const formatAmount = (amount: number) => amount.toLocaleString('en-US', { maximumFractionDigits: 4 });

    const simplifiedDescription = () => {
        switch (type) {
            case 'Swap': return t('TransactionsTable.swapFor').replace('{token0}', token0.symbol).replace('{token1}', token1.symbol);
            case 'Add': return t('TransactionsTable.addTokens').replace('{token0}', token0.symbol).replace('{token1}', token1.symbol);
            case 'Remove': return t('TransactionsTable.removeTokens').replace('{token0}', token0.symbol).replace('{token1}', token1.symbol);
            default: return t('TransactionsTable.unknownAction');
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
    // Ensure timestamp is a valid Date object before formatting
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    }
  }, [timestamp]);

  if (!timeAgo) {
    return null;
  }

  return <>{timeAgo}</>;
};

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
    const { t } = useLanguage();
    const statusText = () => {
      switch(status) {
        case 'Completed': return t('TransactionsTable.completed');
        case 'Pending': return t('TransactionsTable.pending');
        case 'Failed': return t('TransactionsTable.failed');
        default: return status;
      }
    }
    return (
        <Badge
            variant={'outline'}
            className={cn('capitalize border-transparent font-semibold', {
                'bg-success text-success-foreground': status === 'Completed',
                'bg-warning text-warning-foreground': status === 'Pending',
                'bg-destructive text-destructive-foreground': status === 'Failed',
            })}
        >
            {statusText()}
        </Badge>
    );
};

export function TransactionsTable({ transactions, currency, network }: { transactions: Transaction[], currency: SelectedCurrency, network: NetworkConfig }) {
    const { t } = useLanguage();
    
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-center">{t('TransactionsTable.activities')}</TableHead>
                            <TableHead className="w-[450px]">{t('TransactionsTable.details')}</TableHead>
                            <TableHead className="text-right">{t('TransactionsTable.value')}</TableHead>
                            <TableHead className="w-[180px]">{t('TransactionsTable.time')}</TableHead>
                            <TableHead className="w-[150px]">{t('TransactionsTable.status')}</TableHead>
                            <TableHead className="w-[360px]">{t('TransactionsTable.account')}</TableHead>
                            <TableHead className="w-[100px] text-right">{t('TransactionsTable.actions')}</TableHead>
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
                                <TableCell className="text-muted-foreground">
                                    <TimeAgo timestamp={tx.timestamp} />
                                </TableCell>

                                <TableCell>
                                    <StatusBadge status={tx.status} />
                                </TableCell>
                                <TableCell>
                                     <div className="flex items-center">
                                        <a href={`${network.blockExplorerUrls[0]}/address/${tx.account}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {truncateAddress(tx.account)}
                                        </a>
                                     </div>
                                </TableCell>
                                <TableCell className="text-right">
                                     <div className="flex items-center justify-end">
                                        <a href={`${network.blockExplorerUrls[0]}/tx/${tx.id}`} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <ArrowUpRight className={cn("h-4 w-4", {
                                                    'text-success': tx.status === 'Completed',
                                                    'text-warning': tx.status === 'Pending',
                                                    'text-destructive': tx.status === 'Failed',
                                                })} />
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
