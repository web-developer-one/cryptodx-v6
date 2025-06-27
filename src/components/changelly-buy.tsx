
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChangellyFiatCurrency, ChangellyCurrency, ChangellyRate } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { ArrowDown, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { getDexRate } from '@/lib/changelly';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

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


export function ChangellyBuy({ cryptoCurrencies, fiatCurrencies }: { cryptoCurrencies: ChangellyCurrency[], fiatCurrencies: ChangellyFiatCurrency[] }) {
  const [fromCurrency, setFromCurrency] = useState<ChangellyFiatCurrency>(fiatCurrencies.find(f => f.ticker === 'usd') || fiatCurrencies[0]);
  const [toCurrency, setToCurrency] = useState<ChangellyCurrency>(cryptoCurrencies.find(c => c.ticker === 'btc') || cryptoCurrencies[0]);
  const [fromAmount, setFromAmount] = useState<string>('300');
  const [toAmount, setToAmount] = useState<string>('');
  
  const [rateInfo, setRateInfo] = useState<ChangellyRate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastEdited, setLastEdited] = useState<'from' | 'to'>('from');

  const debouncedGetRate = useCallback(debounce(getDexRate, 500), []);

  useEffect(() => {
    const fetchRate = async () => {
      if (!fromCurrency || !toCurrency) return;

      let amount: string, fromTicker: string, toTicker: string;
      if (lastEdited === 'from') {
          if (parseFloat(fromAmount) <= 0) {
            setToAmount('');
            setRateInfo(null);
            return;
          };
          amount = fromAmount;
          fromTicker = fromCurrency.ticker;
          toTicker = toCurrency.ticker;
      } else { // lastEdited === 'to' - this is a reverse calculation, not directly supported by API, so we estimate.
          if (parseFloat(toAmount) <= 0) {
              setFromAmount('');
              setRateInfo(null);
              return;
          }
          // We can't get a reverse rate, so we'll just show the amount and not update the other side
          // In a real app, you might need a different endpoint or logic.
          // For now, we only update 'to' when 'from' is edited.
          return;
      }

      setIsLoading(true);
      const result = await debouncedGetRate(fromTicker, toTicker, amount);
      setRateInfo(result);
      if (result) {
        setToAmount(result.amount.toString());
      }
      setIsLoading(false);
    };

    fetchRate();
  }, [fromAmount, fromCurrency, toCurrency, lastEdited, debouncedGetRate]);


  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setLastEdited('from');
      setFromAmount(value);
    }
  }

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        // Since we can't get a reverse rate, just update the input
        setLastEdited('to');
        setToAmount(value);
    }
  }

  return (
    <Card className="w-full max-w-lg shadow-2xl shadow-primary/10">
      <CardContent className="flex flex-col gap-4 p-4">
        {/* You spend */}
        <div className="p-4 rounded-lg bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="from-input">You spend</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="from-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={handleFromAmountChange} />
            <Select value={fromCurrency.ticker} onValueChange={(ticker) => setFromCurrency(fiatCurrencies.find(c => c.ticker === ticker)!)}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {fiatCurrencies.map((token) => (
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
        
        {/* You get */}
        <div className="p-4 rounded-lg bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="to-input">You get</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="to-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={toAmount} onChange={handleToAmountChange} />
            <Select value={toCurrency.ticker} onValueChange={(ticker) => setToCurrency(cryptoCurrencies.find(c => c.ticker === ticker)!)}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {cryptoCurrencies.map((token) => (
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
                <span>Best offer from:</span>
                 <div className="flex items-center gap-2">
                    <Image src="https://placehold.co/20x20.png" alt="Moonpay" width={20} height={20} data-ai-hint="moonpay logo"/>
                    <span className="font-semibold">MoonPay</span>
                </div>
            </div>
             <div className="flex justify-between items-center">
                <span>Rate</span>
                {isLoading ? <Skeleton className="h-4 w-32" /> : <span>1 {fromCurrency.ticker.toUpperCase()} ≈ {rateInfo ? (rateInfo.rate / parseFloat(fromAmount)).toFixed(6) : '-'} {toCurrency.ticker.toUpperCase()}</span>}
            </div>
        </div>
        
        <Button className="w-full h-12 text-lg mt-4">Buy {toCurrency.ticker.toUpperCase()} Now</Button>

        <p className="text-xs text-muted-foreground/80 text-center">
            By clicking "Buy Now", you agree to Changelly's Terms of Use. Powered by Changelly.
        </p>
      </CardContent>
    </Card>
  );
}
