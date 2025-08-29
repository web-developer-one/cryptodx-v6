
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCurrenciesFull, getExchangeAmount, getPairsParams } from '@/services/changellyApiService';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChangellyCurrency {
  name: string;
  ticker: string;
  fullName: string;
  enabled: boolean;
  fixRateEnabled: boolean;
}

export const ChangellyC2CInterface = () => {
  const [fromCurrency, setFromCurrency] = useState('btc');
  const [toCurrency, setToCurrency] = useState('eth');
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('');
  
  const [currencies, setCurrencies] = useState<ChangellyCurrency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const debouncedFromAmount = useDebounce(fromAmount, 500);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const result = await getCurrenciesFull();
        setCurrencies(result.filter((c: ChangellyCurrency) => c.enabled && c.fixRateEnabled));
        setError('');
      } catch (err) {
        setError('Something went wrong. Could not fetch currencies.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  const fetchAmount = useCallback(async (from, to, amount) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setToAmount('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await getPairsParams(from, to);
      const result = await getExchangeAmount(from, to, amount);
      setToAmount(result[0].amount);
    } catch (err: any) {
      setToAmount('');
      if (err.message && err.message.includes('pair is disabled')) {
        setError('This exchange pair is currently unavailable.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmount(fromCurrency, toCurrency, debouncedFromAmount);
  }, [fromCurrency, toCurrency, debouncedFromAmount, fetchAmount]);
  
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
                    <Input 
                        type="text" 
                        value={toAmount} 
                        readOnly 
                        placeholder={loading ? 'Calculating...' : '0'}
                        className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                    />
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
            <Button className="w-full h-12 text-lg" onClick={handleExchange} disabled={loading || !!error || !toAmount}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Exchange
            </Button>
        </CardFooter>
    </Card>
  );
};
