
'use client';

import { useState, useMemo } from 'react';
import type { Cryptocurrency, Transaction } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionsTable } from './transactions-table';
import Image from 'next/image';

export function TransactionsClient({ transactions, cryptocurrencies }: { transactions: Transaction[], cryptocurrencies: Cryptocurrency[] }) {
    const [selectedToken, setSelectedToken] = useState<string>('all');
    
    const uniqueTokens = useMemo(() => {
        const tokenSet = new Set<string>();
        transactions.forEach(tx => {
            tokenSet.add(tx.token0.symbol);
            tokenSet.add(tx.token1.symbol);
        });
        return cryptocurrencies.filter(c => tokenSet.has(c.symbol));
    }, [transactions, cryptocurrencies]);

    const filteredTransactions = useMemo(() => {
        if (selectedToken === 'all') {
            return transactions;
        }
        return transactions.filter(tx => tx.token0.symbol === selectedToken || tx.token1.symbol === selectedToken);
    }, [transactions, selectedToken]);

    return (
        <>
            <div className="flex justify-between items-center my-6">
                <h1 className="text-3xl font-bold">Recent Transactions</h1>
                <div className="w-full max-w-xs">
                    <Select onValueChange={setSelectedToken} defaultValue="all">
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by token..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tokens</SelectItem>
                            {uniqueTokens.map(token => (
                                <SelectItem key={token.id} value={token.symbol}>
                                    <div className="flex items-center gap-2">
                                        <Image src={token.logo || 'https://placehold.co/20x20.png'} alt={token.name} width={20} height={20} className="rounded-full" />
                                        {token.symbol}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <TransactionsTable transactions={filteredTransactions} />
        </>
    );
}
