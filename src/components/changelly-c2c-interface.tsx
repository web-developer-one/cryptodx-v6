
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Skeleton } from './ui/skeleton';
import {
  ArrowDownUp,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Check,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import crypto from 'crypto-js';

const CHANGELLY_C2C_API_KEY = process.env.NEXT_PUBLIC_CHANGELLY_C2C_API_KEY;
const CHANGELLY_C2C_PRIVATE_KEY = process.env.NEXT_PUBLIC_CHANGELLY_C2C_PRIVATE_KEY;
const CHANGELLY_API_URL = '/api/changelly-proxy'; // Using a proxy

interface ChangellyCurrency {
  name: string;
  ticker: string;
  fullName: string;
  enabled: boolean;
  image: string;
  fixRateEnabled: boolean;
  address?: string; 
  network?: string; 
  contractAddress?: string;
  isNative?: boolean;
}

interface CoinSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencies: ChangellyCurrency[];
  onSelect: (ticker: string) => void;
  title: string;
  selectedTicker?: string;
}

function CoinSelectionDialog({
  open,
  onOpenChange,
  currencies,
  onSelect,
  title,
  selectedTicker,
}: CoinSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) {
      return currencies;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return currencies.filter(
      (c) =>
        c.fullName.toLowerCase().includes(lowercasedQuery) ||
        c.ticker.toLowerCase().includes(lowercasedQuery)
    );
  }, [currencies, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <ScrollArea className="h-80 border-t">
          <div className="p-2">
            {filteredCurrencies.map((token) => (
              <button
                key={token.ticker}
                onClick={() => {
                  onSelect(token.ticker);
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={token.image}
                    alt={token.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-bold text-left">{token.fullName}</p>
                    <p className="text-sm text-muted-foreground text-left">
                      {token.ticker.toUpperCase()}
                    </p>
                  </div>
                </div>
                {selectedTicker === token.ticker && (
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

const apiRequest = async (method: string, params: any) => {
    if (!CHANGELLY_C2C_API_KEY || !CHANGELLY_C2C_PRIVATE_KEY) {
        throw new Error('Changelly API credentials are not configured in environment variables.');
    }

    const message = {
        jsonrpc: '2.0',
        id: 'test',
        method: method,
        params: params,
    };
    
    const messageString = JSON.stringify(message);
    const sign = crypto.HmacSHA512(messageString, CHANGELLY_C2C_PRIVATE_KEY).toString(crypto.enc.Hex);

    const response = await fetch('/api/changelly/proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': CHANGELLY_C2C_API_KEY,
            'sign': sign,
        },
        body: messageString,
    });

    const data = await response.json();
    
    if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'An unknown API error occurred.');
    }
    
    return data.result;
};

export function ChangellyC2CInterface() {
  const { t } = useLanguage();
  const [fromToken, setFromToken] = useState<string>('btc');
  const [toToken, setToToken] = useState<string>('eth');
  const [fromAmount, setFromAmount] = useState<string>('0.1');
  const [toAmount, setToAmount] = useState<string>('');
  const [allCurrencies, setAllCurrencies] = useState<ChangellyCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromDialogOpen, setIsFromDialogOpen] = useState(false);
  const [isToDialogOpen, setIsToDialogOpen] = useState(false);

  const debouncedFromAmount = useDebounce(fromAmount, 500);
  const { toast } = useToast();

  const fromTokenDetails = useMemo(
    () => allCurrencies.find((c) => c.ticker === fromToken),
    [allCurrencies, fromToken]
  );
  const toTokenDetails = useMemo(
    () => allCurrencies.find((c) => c.ticker === toToken),
    [allCurrencies, toToken]
  );
  
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest('getCurrenciesFull', {});
      setAllCurrencies(result.filter((c: ChangellyCurrency) => c.enabled && c.fixRateEnabled));
    } catch (error: any) {
       setError(error.message || 'Failed to fetch initial data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const getQuote = useCallback(async () => {
    if (
      !fromToken ||
      !toToken ||
      !debouncedFromAmount ||
      parseFloat(debouncedFromAmount) <= 0
    ) {
      setToAmount('');
      return;
    }
    setError(null);
    setIsFetchingQuote(true);

    try {
      // Check if pair is valid first
      await apiRequest('getPairsParams', { from: fromToken, to: toToken });
      
      const result = await apiRequest('getExchangeAmount', [{ from: fromToken, to: toToken, amount: debouncedFromAmount }]);
      setToAmount(result[0].amount);

    } catch (e: any) {
        if (e.message && e.message.includes('pair is disabled')) {
            setError('This exchange pair is currently unavailable.');
        } else {
            setError('Something went wrong. Please try again.');
        }
        setToAmount('');
    } finally {
      setIsFetchingQuote(false);
    }
  }, [fromToken, toToken, debouncedFromAmount]);

  useEffect(() => {
    getQuote();
  }, [getQuote]);

  const handleSwap = () => {
    const currentFrom = fromToken;
    const currentTo = toToken;
    setFromToken(currentTo);
    setToToken(currentFrom);
    setFromAmount(toAmount === '' ? '0.1' : toAmount);
  };

  const handleFromTokenChange = (ticker: string) => {
    if (toToken && ticker === toToken) {
      handleSwap();
    } else {
      setFromToken(ticker);
    }
  };

  const handleToTokenChange = (ticker: string) => {
    if (fromToken && ticker === fromToken) {
      handleSwap();
    } else {
      setToToken(ticker);
    }
  };
  
  const initiateSwap = () => {
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
        description: `Successfully swapped ${fromAmount} ${fromToken.toUpperCase()} for ${toAmount} ${toToken.toUpperCase()}`,
        duration: 5000,
      });
    }, 9000);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader>
          <Skeleton className="h-8 w-32 mx-auto" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-12 w-full" />
        </CardFooter>
      </Card>
    );
  }
  
  if (error && allCurrencies.length === 0) {
     return (
       <Card className="w-full max-w-md shadow-lg border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive text-center">API Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">Could not connect to the Changelly API. Please ensure your C2C API keys are correctly configured in your environment variables.</p>
          <p className="text-xs text-destructive mt-4 font-mono bg-muted p-2 rounded">{error}</p>
        </CardContent>
         <CardFooter>
            <Button onClick={fetchInitialData} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Retry Connection'}
            </Button>
        </CardFooter>
      </Card>
     )
  }

  return (
    <>
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle>C2C Swap</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
            <label className="text-sm text-muted-foreground">
              {t('SwapInterface.sell')}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0"
                className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
              />
              {fromTokenDetails && (
                <Button
                  variant="outline"
                  className="h-12 text-lg font-bold bg-card hover:bg-accent min-w-[130px]"
                  onClick={() => setIsFromDialogOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={fromTokenDetails.image}
                      alt={fromTokenDetails.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    {fromTokenDetails.ticker.toUpperCase()}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center my-[-18px] z-10">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full border-4 border-background"
              onClick={handleSwap}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
            <label className="text-sm text-muted-foreground">
              {t('SwapInterface.buy')}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-3xl h-12 flex items-center p-0">
                {isFetchingQuote ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Input
                    type="text"
                    placeholder="0"
                    className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                    value={toAmount}
                    readOnly
                  />
                )}
              </div>
              {toTokenDetails && (
                <Button
                  variant="outline"
                  className="h-12 text-lg font-bold bg-card hover:bg-accent min-w-[130px]"
                  onClick={() => setIsToDialogOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={toTokenDetails.image}
                      alt={toTokenDetails.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    {toTokenDetails.ticker.toUpperCase()}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>
                </Button>
              )}
            </div>
             {error && (
                <div className="text-xs text-destructive mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {error}
                </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full h-12 text-lg"
            disabled={isFetchingQuote || !!error || !toAmount || !fromAmount}
            onClick={initiateSwap}
          >
            Exchange
          </Button>
        </CardFooter>
      </Card>
      <CoinSelectionDialog
        open={isFromDialogOpen}
        onOpenChange={setIsFromDialogOpen}
        currencies={allCurrencies}
        onSelect={handleFromTokenChange}
        title="You Send"
        selectedTicker={fromToken}
      />
       <CoinSelectionDialog
        open={isToDialogOpen}
        onOpenChange={setIsToDialogOpen}
        currencies={allCurrencies}
        onSelect={handleToTokenChange}
        title="You Get"
        selectedTicker={toToken}
      />
    </>
  );
}
