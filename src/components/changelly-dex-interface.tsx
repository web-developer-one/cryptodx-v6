
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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

interface ChangellyPair {
    from: string;
    to: string;
    rate: number;
    min: string;
}

interface ChangellyCurrency {
    name: string;
    ticker: string;
    fullName: string;
    enabled: boolean;
    image: string;
}

export function ChangellyDexInterface() {
  const { t } = useLanguage();
  const [fromToken, setFromToken] = useState<string>('btc');
  const [toToken, setToToken] = useState<string>('eth');
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("");
  const [allCurrencies, setAllCurrencies] = useState<ChangellyCurrency[]>([]);
  const [supportedPairs, setSupportedPairs] = useState<ChangellyPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [minAmount, setMinAmount] = useState<string>('0');

  const debouncedFromAmount = useDebounce(fromAmount, 500);

  const { isActive: isWalletConnected } = useWallet();
  const { toast } = useToast();

  const fromTokenDetails = useMemo(() => allCurrencies.find(c => c.ticker === fromToken), [allCurrencies, fromToken]);
  const toTokenDetails = useMemo(() => allCurrencies.find(c => c.ticker === toToken), [allCurrencies, toToken]);

  const fetchCurrenciesAndPairs = useCallback(async () => {
    setIsLoading(true);
    try {
        const [currenciesRes, pairsRes] = await Promise.all([
            fetch('/api/changelly/getCurrenciesFull', { method: 'POST' }),
            fetch('/api/changelly/getPairs', { method: 'POST' })
        ]);
        
        const currenciesData = await currenciesRes.json();
        const pairsData = await pairsRes.json();
        
        if (currenciesData.result) {
            setAllCurrencies(currenciesData.result.filter((c: any) => c.enabled));
        } else {
             throw new Error(currenciesData.error?.message || "Could not fetch currencies.");
        }
        
        if (pairsData.result) {
            setSupportedPairs(pairsData.result);
        } else {
            throw new Error(pairsData.error?.message || "Could not fetch pairs.");
        }

    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error", description: `Could not load data from Changelly: ${error.message}` });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchCurrenciesAndPairs();
  }, [fetchCurrenciesAndPairs]);


  const getQuote = useCallback(async () => {
    if (!fromToken || !toToken || !debouncedFromAmount || parseFloat(debouncedFromAmount) <= 0) return;
    setIsFetchingQuote(true);
    
    const pairInfo = supportedPairs.find(p => p.from === fromToken && p.to === toToken);
    if (!pairInfo) {
        setToAmount("N/A");
        setMinAmount('0');
        setIsFetchingQuote(false);
        return;
    }
    
    setMinAmount(pairInfo.min);

    try {
        const response = await fetch('/api/changelly/getExchangeAmount', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ from: fromToken, to: toToken, amount: debouncedFromAmount })
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
  }, [fromToken, toToken, debouncedFromAmount, toast, supportedPairs]);

  useEffect(() => {
    getQuote();
  }, [getQuote]);

  const handleSwap = () => {
    const currentFrom = fromToken;
    const currentTo = toToken;
    setFromToken(currentTo);
    setToToken(currentFrom);
    setFromAmount(toAmount === "N/A" ? "1" : toAmount);
    setToAmount(fromAmount);
  };
  
  const handleFromTokenChange = (ticker: string) => {
    if (toToken && ticker === toToken) {
        handleSwap();
    } else {
        setFromToken(ticker);
    }
  }
  
  const handleToTokenChange = (ticker: string) => {
    if (fromToken && ticker === fromToken) {
        handleSwap();
    } else {
        setToToken(ticker);
    }
  }

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
        <CardTitle>C2C Swap</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground">{t('SwapInterface.sell')}</label>
          <div className="flex items-center gap-2">
            <Input type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={e => setFromAmount(e.target.value)} />
            {fromTokenDetails && 
                <Select value={fromTokenDetails.ticker} onValueChange={handleFromTokenChange}>
                  <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                    <SelectValue>
                         <div className="flex items-center gap-2">
                          <Image src={fromTokenDetails.image} alt={fromTokenDetails.name} width={20} height={20} className="rounded-full" />
                          {fromTokenDetails.ticker.toUpperCase()}
                        </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allCurrencies.map((token) => (
                      <SelectItem key={token.ticker} value={token.ticker}>
                        <div className="flex items-center gap-2">
                          <Image src={token.image} alt={token.name} width={20} height={20} className="rounded-full" />
                          {token.ticker.toUpperCase()}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            }
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
             <div className="flex-1 text-3xl h-12 flex items-center p-0">
                {isFetchingQuote ? <Loader2 className="h-6 w-6 animate-spin" /> : <Input type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={toAmount} readOnly />}
            </div>
            {toTokenDetails && 
                <Select value={toTokenDetails.ticker} onValueChange={handleToTokenChange}>
                    <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                        <SelectValue>
                            <div className="flex items-center gap-2">
                            <Image src={toTokenDetails.image} alt={toTokenDetails.name} width={20} height={20} className="rounded-full" />
                            {toTokenDetails.ticker.toUpperCase()}
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {allCurrencies.map((token) => (
                        <SelectItem key={token.ticker} value={token.ticker}>
                            <div className="flex items-center gap-2">
                            <Image src={token.image} alt={token.name} width={20} height={20} className="rounded-full" />
                            {token.ticker.toUpperCase()}
                            </div>
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            }
          </div>
           {minAmount !== '0' && (
              <div className="text-xs text-muted-foreground mt-2">Min. amount: {minAmount} {fromToken.toUpperCase()}</div>
            )}
        </div>
      </CardContent>
      <CardFooter>
        {isWalletConnected ? (
          <Button className="w-full h-12 text-lg" disabled={isFetchingQuote || !toAmount || toAmount === 'N/A'}>
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
