
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Cryptocurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from './wallet-connect';
import { Plus, Search, ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Skeleton } from './ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TokenSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cryptocurrencies: Cryptocurrency[];
  onSelect: (token: Cryptocurrency) => void;
  selectedTokenSymbol?: string;
  title: string;
}

function TokenSelectDialog({ open, onOpenChange, cryptocurrencies, onSelect, selectedTokenSymbol, title }: TokenSelectDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<'All' | 'Stables' | 'Gainers' | 'Losers'>('All');

    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'USDP'];

    const filteredTokens = useMemo(() => {
        let tokens = cryptocurrencies;

        if (activeFilter === 'Stables') {
            tokens = tokens.filter(t => stablecoins.includes(t.symbol));
        } else if (activeFilter === 'Gainers') {
            tokens = tokens.filter(t => t.change24h >= 0);
        } else if (activeFilter === 'Losers') {
            tokens = tokens.filter(t => t.change24h < 0);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            return tokens.filter(
                (token) =>
                token.name.toLowerCase().includes(lowercasedQuery) ||
                token.symbol.toLowerCase().includes(lowercasedQuery)
            );
        }
        return tokens;
    }, [searchQuery, cryptocurrencies, activeFilter]);

    const handleSelect = (token: Cryptocurrency) => {
        onSelect(token);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                     <DialogTitle className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                       {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-4">
                     <div className="relative">
                        <Input
                            placeholder="Search currency"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex gap-2">
                        {(['All', 'Stables', 'Gainers', 'Losers', 'New'] as const).map(filter => (
                             <Button 
                                key={filter} 
                                variant={activeFilter === filter ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter(filter as any)}
                                disabled={filter === 'New'}
                             >
                                {filter}
                            </Button>
                        ))}
                    </div>
                </div>

                <ScrollArea className="h-80 border-t">
                    <div className="p-2">
                        {filteredTokens.map(token => (
                            <button
                                key={token.id}
                                onClick={() => handleSelect(token)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={token.logo || `https://placehold.co/40x40.png`}
                                        alt={token.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-bold">{token.symbol}</p>
                                            <p className="text-muted-foreground text-sm">{token.platform?.symbol}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground text-left">{token.name}</p>
                                    </div>
                                </div>
                                {selectedTokenSymbol === token.symbol && (
                                    <Check className="h-5 w-5 text-green-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}


export function CreatePositionInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t } = useLanguage();

  if (cryptocurrencies.length === 0) {
    return (
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader><Skeleton className="h-8 w-48 mx-auto" /></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        <CardFooter><Skeleton className="h-12 w-full" /></CardFooter>
      </Card>
    );
  }
  
  const [token0, setToken0] = useState<Cryptocurrency>(cryptocurrencies.find(c => c.symbol === 'ETH') || cryptocurrencies[0]);
  const [token1, setToken1] = useState<Cryptocurrency>(cryptocurrencies.find(c => c.symbol === 'USDC') || (cryptocurrencies.length > 1 ? cryptocurrencies[1] : cryptocurrencies[0]));
  const [amount0, setAmount0] = useState<string>('1');
  const [amount1, setAmount1] = useState<string>('');
  const { isActive: isWalletConnected } = useWallet();
  const [lastEdited, setLastEdited] = useState<'token0' | 'token1'>('token0');
  const [isToken0DialogOpen, setIsToken0DialogOpen] = useState(false);
  const [isToken1DialogOpen, setIsToken1DialogOpen] = useState(false);

  const priceRatio = useMemo(() => {
    if (token0?.price > 0 && token1?.price > 0) {
      return token0.price / token1.price;
    }
    return 0;
  }, [token0, token1]);

  useEffect(() => {
    if (priceRatio > 0) {
      if (lastEdited === 'token0') {
        const amt0 = parseFloat(amount0);
        if (amt0 > 0) {
          setAmount1((amt0 * priceRatio).toFixed(5));
        } else {
          setAmount1('');
        }
      } else { // lastEdited === 'token1'
        const amt1 = parseFloat(amount1);
        if (amt1 > 0) {
          setAmount0((amt1 / priceRatio).toFixed(5));
        } else {
          setAmount0('');
        }
      }
    }
  }, [amount0, amount1, priceRatio, lastEdited]);

  const handleTokenChange = (setter: React.Dispatch<React.SetStateAction<Cryptocurrency>>, otherToken: Cryptocurrency) => (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
        if (token.symbol === otherToken.symbol) {
            if(setter.toString() === setToken0.toString()) {
                setToken0(token1);
                setToken1(token0);
            } else {
                setToken1(token0);
                setToken0(token1);
            }
        } else {
            setter(token);
        }
    }
  };

  const handleSelectToken0 = (token: Cryptocurrency) => {
    if(token.symbol === token1.symbol) {
        setToken1(token0);
    }
    setToken0(token);
  }

  const handleSelectToken1 = (token: Cryptocurrency) => {
     if(token.symbol === token0.symbol) {
        setToken0(token1);
    }
    setToken1(token);
  }
  
  const handleAmountChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: 'token0' | 'token1') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setLastEdited(field);
      setter(value);
    }
  };

  return (
    <>
        <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
            <CardTitle>{t('CreatePositionInterface.title')}</CardTitle>
            <CardDescription>{t('CreatePositionInterface.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
            <label className="text-sm text-muted-foreground" htmlFor="token0-input">{t('CreatePositionInterface.token1')}</label>
            <div className="flex items-center gap-2 mt-1">
                <Input id="token0-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={amount0} onChange={handleAmountChange(setAmount0, "token0")} />
                 <Button variant="outline" className="h-12 text-lg font-bold bg-card hover:bg-accent min-w-[130px]" onClick={() => setIsToken0DialogOpen(true)}>
                    <div className="flex items-center gap-2">
                        <Image
                            src={token0.logo || `https://placehold.co/24x24.png`}
                            alt={`${token0.name} logo`}
                            width={24}
                            height={24}
                            className="rounded-full"
                        />
                        {token0.symbol}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </div>
            </div>

            <div className="flex justify-center my-[-12px] z-10">
                <Plus className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
            <label className="text-sm text-muted-foreground" htmlFor="token1-input">{t('CreatePositionInterface.token2')}</label>
            <div className="flex items-center gap-2 mt-1">
                <Input id="token1-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={amount1} onChange={handleAmountChange(setAmount1, "token1")} />
                <Button variant="outline" className="h-12 text-lg font-bold bg-card hover:bg-accent min-w-[130px]" onClick={() => setIsToken1DialogOpen(true)}>
                    <div className="flex items-center gap-2">
                        <Image
                            src={token1.logo || `https://placehold.co/24x24.png`}
                            alt={`${token1.name} logo`}
                            width={24}
                            height={24}
                            className="rounded-full"
                        />
                        {token1.symbol}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </div>
            </div>

            <div className="text-sm text-muted-foreground text-center mt-2 space-y-1">
                <div className='flex justify-center gap-4'>
                    <span>1 {token0.symbol} = {priceRatio > 0 ? priceRatio.toFixed(4) : '-'} {token1.symbol}</span>
                    <span>1 {token1.symbol} = {priceRatio > 0 ? (1 / priceRatio).toFixed(4) : '-'} {token0.symbol}</span>
                </div>
                <p>{t('CreatePositionInterface.poolShareEstimate').replace('{percentage}', '0.01')}</p>
            </div>

        </CardContent>
        <CardFooter>
            {isWalletConnected ? (
            <Button className="w-full h-12 text-lg">{t('YourPositions.addLiquidity')}</Button>
            ) : (
            <WalletConnect>
                <Button className="w-full h-12 text-lg">{t('Header.connectWallet')}</Button>
            </WalletConnect>
            )}
        </CardFooter>
        </Card>
        <TokenSelectDialog
            open={isToken0DialogOpen}
            onOpenChange={setIsToken0DialogOpen}
            cryptocurrencies={cryptocurrencies}
            onSelect={handleSelectToken0}
            selectedTokenSymbol={token0.symbol}
            title={t('CreatePositionInterface.token1')}
        />
        <TokenSelectDialog
            open={isToken1DialogOpen}
            onOpenChange={setIsToken1DialogOpen}
            cryptocurrencies={cryptocurrencies}
            onSelect={handleSelectToken1}
            selectedTokenSymbol={token1.symbol}
            title={t('CreatePositionInterface.token2')}
        />
    </>
  );
}
