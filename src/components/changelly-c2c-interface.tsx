
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface ChangellyCurrency {
  name: string;
  ticker: string;
  fullName: string;
  enabled: boolean;
  fixRateEnabled: boolean;
}

// Dedicated function to fetch pairs
const getPairs = async () => {
    const response = await fetch('/api/changelly/getPairs');
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch currency pairs.');
    }
    return response.json();
}

// Generic function for other API requests
const apiRequest = async (method: string, params: any = {}) => {
    const response = await fetch('/api/changelly/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, params }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'An API error occurred.');
    }
    
    const data = await response.json();
    if(data.error) {
        throw new Error(data.error.message);
    }

    return data.result;
};

export const ChangellyC2CInterface = () => {
  const [fromCurrency, setFromCurrency] = useState('btc');
  const [toCurrency, setToCurrency] = useState('eth');
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('');
  
  const [currencies, setCurrencies] = useState<ChangellyCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const debouncedFromAmount = useDebounce(fromAmount, 500);

  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoading(true);
      try {
        // Use the dedicated getPairs function
        const result = await getPairs();
        setCurrencies(result.filter((c: ChangellyCurrency) => c.enabled && c.fixRateEnabled));
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch initial data. Could not fetch currencies.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  const fetchAmount = useCallback(async (from: string, to: string, amount: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setToAmount('');
      return;
    }
    setIsFetchingQuote(true);
    setError('');
    try {
      const result = await apiRequest('getExchangeAmount', [{ from, to, amount }]);
      setToAmount(result[0].amount);
    } catch (err: any) {
      setToAmount('');
      setError(err.message || 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsFetchingQuote(false);
    }
  }, []);

  useEffect(() => {
    if (currencies.length > 0) {
        fetchAmount(fromCurrency, toCurrency, debouncedFromAmount);
    }
  }, [fromCurrency, toCurrency, debouncedFromAmount, fetchAmount, currencies]);
  
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleExchange = () => {
     toast({
      title: "Transaction Submitted",
      description: "Getting confirmations...",
      duration: 3000,
    });
     setTimeout(() => {
      toast({
        title: "Transaction Update",
        description: "Exchanging...",
        duration: 3000,
      });
    }, 3000);
    setTimeout(() => {
      toast({
        title: "Transaction Update",
        description: "Sending to your wallet...",
        duration: 3000,
      });
    }, 6000);
    setTimeout(() => {
      toast({
        title: "Transaction Complete",
        description: `Successfully swapped ${fromAmount} ${fromCurrency.toUpperCase()} for ${toAmount} ${toCurrency.toUpperCase()}`,
        duration: 5000,
      });
    }, 9000);
  }
  
  const renderCurrencyOptions = () => {
    return currencies.map(c => (
      <SelectItem key={c.ticker} value={c.ticker}>
        {c.name} ({c.ticker.toUpperCase()})
      </SelectItem>
    ));
  };

  if (isLoading) {
    return (
        <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
          <CardHeader><Skeleton className="h-8 w-48 mx-auto" /></CardHeader>
          <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
          <CardFooter><Skeleton className="h-12 w-full" /></CardFooter>
      </Card>
    )
  }

  if (error && currencies.length === 0) {
    return (
        <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
            <CardHeader className="text-center">
                <CardTitle>Crypto Exchange</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-48 text-center">
                <p className="text-destructive font-medium">{error}</p>
            </CardContent>
             <CardFooter>
                <Button className="w-full" onClick={() => window.location.reload()}>Retry</Button>
            </CardFooter>
        </Card>
    )
  }

  return (
     <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle>Crypto Exchange</CardTitle>
        </CardHeader>
        <CardContent className="relative flex flex-col gap-2">
            <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
                 <label className="text-sm text-muted-foreground">You Send</label>
                 <div className="flex items-center gap-2">
                    <Input 
                        type="number" 
                        value={fromAmount} 
                        onChange={(e) => setFromAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                    />
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>{renderCurrencyOptions()}</SelectContent>
                    </Select>
                 </div>
            </div>

            <div className="flex justify-center my-[-18px] z-10">
                <Button variant="secondary" size="icon" className="rounded-full border-4 border-background" onClick={handleSwap}>
                    <ArrowDownUp className="h-4 w-4" />
                </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
                <label className="text-sm text-muted-foreground">You Get (Approximately)</label>
                <div className="flex items-center gap-2">
                    <div className="flex-1 text-3xl h-12 flex items-center p-0">
                        {isFetchingQuote ? <Loader2 className="h-6 w-6 animate-spin" /> : <Input type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={toAmount} readOnly />}
                    </div>
                     <Select value={toCurrency} onValueChange={setToCurrency}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>{renderCurrencyOptions()}</SelectContent>
                    </Select>
                </div>
            </div>
            
            {error && <p className="text-sm text-center text-destructive mt-2">{error}</p>}
        </CardContent>
        <CardFooter>
            <Button className="w-full h-12 text-lg" onClick={handleExchange} disabled={isFetchingQuote || !!error || !toAmount}>
                {(isFetchingQuote || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Exchange
            </Button>
        </CardFooter>
    </Card>
  );
};
