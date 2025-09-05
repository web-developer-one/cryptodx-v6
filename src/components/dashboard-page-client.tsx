
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useWallet, networkConfigs } from '@/hooks/use-wallet';
import type { Cryptocurrency } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Send, RefreshCw, Search, ChevronDown } from 'lucide-react';
import { DashboardTable } from './dashboard-table';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { getLatestListings } from '@/lib/coinmarketcap';
import { ApiErrorCard } from './api-error-card';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export function DashboardPageClient() {
  const { t } = useLanguage();
  const { account, balances, isBalancesLoading, selectedNetwork, setSelectedNetwork, isLoading: isWalletLoading } = useWallet();
  const [allTokens, setAllTokens] = useState<Cryptocurrency[]>([]);
  const [isTokensLoading, setIsTokensLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = t('PageTitles.dashboard');
  }, [t]);

  useEffect(() => {
    async function fetchTokens() {
        setIsTokensLoading(true);
        const { data, error } = await getLatestListings();
        if(error) {
            setError(error);
        } else {
            setAllTokens(data);
        }
        setIsTokensLoading(false);
    }
    fetchTokens();
  }, []);

  const { totalValue, totalChange, totalChangePercentage } = useMemo(() => {
    if (!balances || !allTokens.length) return { totalValue: 0, totalChange: 0, totalChangePercentage: 0 };
    
    let totalValue = 0;
    let yesterdayValue = 0;

    Object.values(balances).forEach(token => {
        const tokenInfo = allTokens.find(t => t.symbol === token.symbol);
        const price = tokenInfo?.price || 0;
        const change24h = tokenInfo?.change24h || 0;
        const balance = parseFloat(token.balance);

        const currentValue = balance * price;
        totalValue += currentValue;
        
        if (price > 0 && change24h !== -100) {
            const priceYesterday = price / (1 + change24h / 100);
            yesterdayValue += balance * priceYesterday;
        } else {
            yesterdayValue += currentValue;
        }
    });

    const totalChange = totalValue - yesterdayValue;
    const totalChangePercentage = yesterdayValue > 0 ? (totalChange / yesterdayValue) * 100 : 0;
    
    return { totalValue, totalChange, totalChangePercentage };
  }, [balances, allTokens]);

  const filteredBalances = useMemo(() => {
    if (!balances) return [];
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return Object.values(balances).filter(
      (token) =>
        token.name.toLowerCase().includes(lowercasedQuery) ||
        token.symbol.toLowerCase().includes(lowercasedQuery)
    );
  }, [balances, searchQuery]);


  const isLoading = isBalancesLoading || isTokensLoading || isWalletLoading;
  
  const nativeCurrencyBalance = useMemo(() => {
    return balances?.[selectedNetwork.nativeCurrency.symbol];
  }, [balances, selectedNetwork]);
  
  const nativeCurrencyValue = useMemo(() => {
    if(!nativeCurrencyBalance || !allTokens.length) return 0;
    const tokenInfo = allTokens.find(t => t.symbol === nativeCurrencyBalance.symbol);
    const price = tokenInfo?.price || 0;
    return parseFloat(nativeCurrencyBalance.balance) * price;

  }, [nativeCurrencyBalance, allTokens]);

  return (
    <div className="container py-8 space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="relative">
                <Input placeholder="Search for a token..." className="pr-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
        </div>

        <div className="flex gap-2">
            <Button>Buy</Button>
            <Button variant="secondary">Swap</Button>
            <Button variant="secondary">Bridge</Button>
            <Button variant="secondary">Send</Button>
            <Button variant="secondary">Sell</Button>
            <Button variant="secondary">Stake</Button>
        </div>

        <Card>
            <CardContent className="p-6">
                <h2 className="text-sm text-muted-foreground">Decentralized accounts</h2>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-2">
                    {isLoading ? <Skeleton className="h-10 w-48" /> : (
                        <>
                            <p className="text-4xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <div className={cn("flex items-center text-sm font-medium", totalChange >= 0 ? "text-green-500" : "text-destructive")}>
                                {totalChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                ${Math.abs(totalChange).toFixed(2)} ({totalChangePercentage.toFixed(2)}%) Today
                            </div>
                        </>
                    )}
                </div>
                 <div className="flex items-center gap-4 mt-4">
                    <Button variant="outline" size="sm" className="font-mono">
                       {account ? truncateAddress(account) : <Skeleton className="h-5 w-24" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {selectedNetwork.logo && <Image src={selectedNetwork.logo} alt={selectedNetwork.chainName} width={16} height={16} className="rounded-full" />}
                          {selectedNetwork.chainName}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {Object.values(networkConfigs).map((network) => (
                            <DropdownMenuItem
                            key={network.chainId}
                            onClick={() => setSelectedNetwork(network)}
                            >
                            {network.logo && (<Image
                                src={network.logo}
                                alt={`${network.chainName} logo`}
                                width={20}
                                height={20}
                                className="mr-2 rounded-full"
                            />)}
                            {network.chainName}
                            </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                 <div className="mt-4 text-sm text-muted-foreground">
                    <span className="font-semibold">{selectedNetwork.nativeCurrency.symbol} Balance:</span>
                    {isLoading ? <Skeleton className="inline-block h-4 w-20 ml-2" /> : ` $${nativeCurrencyValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
            </CardContent>
        </Card>
        
        {error && <ApiErrorCard error={error} context="Token Data" />}

        {isLoading ? (
            <Skeleton className="h-96 w-full" />
        ) : (
            <DashboardTable balances={filteredBalances} totalValue={totalValue} allTokens={allTokens} />
        )}

    </div>
  );
}
