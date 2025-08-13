
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Cryptocurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from './wallet-connect';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Skeleton } from './ui/skeleton';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface ChangellyCurrency {
    name: string;
    ticker: string;
    fullName: string;
    enabled: boolean;
    image: string;
}

export function ChangellySwapInterface({ allTokens }: { allTokens: Cryptocurrency[] }) {
  const { t } = useLanguage();
  const [fromToken, setFromToken] = useState<ChangellyCurrency | null>(null);
  const [toToken, setToToken] = useState<ChangellyCurrency | null>(null);
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("");
  const [changellyCurrencies, setChangellyCurrencies] = useState<ChangellyCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);

  const debouncedFromAmount = useDebounce(fromAmount, 500);

  const { isActive: isWalletConnected } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch('/api/changelly/getCurrenciesFull', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: "1", jsonrpc: "2.0", method: "getCurrenciesFull", params: {}})
        });
        const data = await response.json();
        if (data.result) {
          setChangellyCurrencies(data.result);
          setFromToken(data.result.find((c: ChangellyCurrency) => c.ticker === 'btc'));
          setToToken(data.result.find((c: ChangellyCurrency) => c.ticker === 'eth'));
        }
      } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Could not load currencies from Changelly." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCurrencies();
  }, [toast]);

  const getQuote = useCallback(async () => {
    if (!fromToken || !toToken || !debouncedFromAmount || parseFloat(debouncedFromAmount) <= 0) return;
    setIsFetchingQuote(true);
    try {
        const response = await fetch('/api/changelly/getExchangeAmount', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: "1",
                jsonrpc: "2.0",
                method: "getExchangeAmount",
                params: {
                    from: fromToken.ticker,
                    to: toToken.ticker,
                    amount: debouncedFromAmount
                }
            })
        });
        const data = await response.json();
        if(data.result) {
            setToAmount(data.result);
        } else {
            setToAmount("");
            toast({variant: 'destructive', title: 'Could not get quote', description: data.error.message})
        }
    } catch (e: any) {
        toast({variant: 'destructive', title: 'Error', description: e.message});
    } finally {
        setIsFetchingQuote(false);
    }
  }, [fromToken, toToken, debouncedFromAmount, toast]);

  useEffect(() => {
    getQuote();
  }, [getQuote]);

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader><Skeleton className="h-8 w-32 mx-auto" /></CardHeader>
        <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
        <CardFooter><Skeleton className="h-12 w-full" /></CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="text-center">
        <CardTitle>Changelly Swap</CardTitle>
        <CardDescription>Swap tokens using the Changelly API</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground">{t('SwapInterface.sell')}</label>
          <div className="flex items-center gap-2">
            <Input type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={e => setFromAmount(e.target.value)} />
            {fromToken && <Select value={fromToken.ticker} onValueChange={(ticker) => setFromToken(changellyCurrencies.find(c => c.ticker === ticker) || null)}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {changellyCurrencies.filter(c => c.enabled).map((token) => (
                  <SelectItem key={token.ticker} value={token.ticker}>
                    <div className="flex items-center gap-2">
                      <Image src={token.image} alt={token.name} width={20} height={20} className="rounded-full" />
                      {token.ticker.toUpperCase()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>}
          </div>
        </div>

        <div className="flex justify-center my-[-18px] z-10">
          <Button variant="secondary" size="icon" className="rounded-full border-4 border-background" onClick={handleSwap}>
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground">{t('SwapInterface.buy')}</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-3xl h-12 flex items-center">
              {isFetchingQuote ? <Loader2 className="h-6 w-6 animate-spin" /> : (toAmount || '0')}
            </div>
            {toToken && <Select value={toToken.ticker} onValueChange={(ticker) => setToToken(changellyCurrencies.find(c => c.ticker === ticker) || null)}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {changellyCurrencies.filter(c => c.enabled).map((token) => (
                  <SelectItem key={token.ticker} value={token.ticker}>
                    <div className="flex items-center gap-2">
                      <Image src={token.image} alt={token.name} width={20} height={20} className="rounded-full" />
                      {token.ticker.toUpperCase()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isWalletConnected ? (
          <Button className="w-full h-12 text-lg" disabled={isFetchingQuote || !toAmount}>
            {t('TradeNav.swap')}
          </Button>
        ) : (
          <WalletConnect>
            <Button className="w-full h-12 text-lg">{t('Header.connectWallet')}</Button>
          </WalletConnect>
        )}
      </CardFooter>
    </Card>
  );
}