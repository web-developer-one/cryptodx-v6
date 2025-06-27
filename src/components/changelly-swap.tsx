
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChangellyCurrency, ChangellyRate } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { ArrowDown, CheckCircle, Info } from 'lucide-react';
import { getDexRate } from '@/lib/changelly';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from './wallet-connect';

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => resolve(func(...args)), delay);
    });
  };
};

export function ChangellySwap({ currencies }: { currencies: ChangellyCurrency[] }) {
  const [fromCurrency, setFromCurrency] = useState<ChangellyCurrency>(currencies.find(c => c.ticker === 'eth') || currencies[0]);
  const [toCurrency, setToCurrency] = useState<ChangellyCurrency>(currencies.find(c => c.ticker === 'btc') || currencies[1]);
  const [fromAmount, setFromAmount] = useState<string>('1');
  const [toAmount, setToAmount] = useState<string>('');
  const { isActive: isWalletConnected } = useWallet();
  
  const [rateInfo, setRateInfo] = useState<ChangellyRate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const debouncedGetRate = useCallback(debounce(getDexRate, 500), []);

  useEffect(() => {
    const fetchRate = async () => {
      if (!fromCurrency || !toCurrency || parseFloat(fromAmount) <= 0) {
        setToAmount('');
        setRateInfo(null);
        return;
      }
      setIsLoading(true);
      const result = await debouncedGetRate(fromCurrency.ticker, toCurrency.ticker, fromAmount);
      setRateInfo(result);
      if (result) {
        setToAmount(result.amount.toString());
      }
      setIsLoading(false);
    };

    fetchRate();
  }, [fromAmount, fromCurrency, toCurrency, debouncedGetRate]);


  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  }

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setToAmount(value);
        if (rateInfo) {
            const newFromAmount = (parseFloat(value) / (rateInfo.rate / parseFloat(fromAmount)));
            setFromAmount(newFromAmount.toString());
        }
    }
  }
  
  return (
    <Card className="w-full max-w-lg shadow-2xl shadow-primary/10">
      <CardContent className="relative flex flex-col gap-2 p-4">
        {/* From */}
        <div className="p-4 rounded-lg bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="from-input">You send</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="from-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={handleFromAmountChange} />
            <Select value={fromCurrency.ticker} onValueChange={(ticker) => setFromCurrency(currencies.find(c => c.ticker === ticker)!)}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((token) => (
                  <SelectItem key={token.ticker} value={token.ticker}>
                    <div className="flex items-center gap-2">
                      <Image src={token.image} alt={token.name} width={20} height={20} className="rounded-full" />
                      {token.ticker.toUpperCase()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-[-18px] z-10">
          <Button variant="secondary" size="icon" className="rounded-full border-4 border-background" onClick={handleSwap}>
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To */}
        <div className="p-4 rounded-lg bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="to-input">You get</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="to-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={toAmount} onChange={handleToAmountChange}/>
            <Select value={toCurrency.ticker} onValueChange={(ticker) => setToCurrency(currencies.find(c => c.ticker === ticker)!)}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((token) => (
                  <SelectItem key={token.ticker} value={token.ticker}>
                    <div className="flex items-center gap-2">
                      <Image src={token.image} alt={token.name} width={20} height={20} className="rounded-full" />
                      {token.ticker.toUpperCase()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-2 mt-2">
            <div className="flex justify-between items-center">
                <span>Rate</span>
                {isLoading ? <Skeleton className="h-4 w-32" /> : <span>1 {fromCurrency.ticker.toUpperCase()} ≈ {rateInfo ? (rateInfo.rate / parseFloat(fromAmount)).toFixed(6) : '-'} {toCurrency.ticker.toUpperCase()}</span>}
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <span>Est. arrival</span>
                    <Info className="h-3 w-3" />
                </div>
                <span>~ 5 minutes</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <span>Provider</span>
                </div>
                 <Badge variant="secondary" className="text-primary font-semibold">
                    <CheckCircle className="h-3 w-3 mr-1"/>
                    Best rate
                </Badge>
            </div>
        </div>

        <div className="mt-4">
            {isWalletConnected ? (
               <Button className="w-full h-12 text-lg">Swap Now</Button>
            ) : (
                <WalletConnect>
                    <Button className="w-full h-12 text-lg">Connect Wallet</Button>
                </WalletConnect>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

