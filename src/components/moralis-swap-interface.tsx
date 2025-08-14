
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp, Loader2 } from "lucide-react";
import type { Cryptocurrency } from "@/lib/types";
import { WalletConnect } from "./wallet-connect";
import Image from "next/image";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "./ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export function MoralisSwapInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t } = useLanguage();

  const [fromToken, setFromToken] = useState<Cryptocurrency | undefined>(cryptocurrencies.find(c => c.symbol === 'ETH'));
  const [toToken, setToToken] = useState<Cryptocurrency | undefined>(cryptocurrencies.find(c => c.symbol === 'USDC'));
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string>("-");
  const [slippage] = useState("0.5");

  const { isActive: isWalletConnected } = useWallet();
  const { toast } = useToast();
  const debouncedFromAmount = useDebounce(fromAmount, 500);

  const priceImpact = useMemo(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return null;
    }
    // Simulate a small price impact that increases with trade size
    const impact = Math.min(0.01 + (parseFloat(fromAmount) / 10000), 10);
    return impact;
  }, [fromAmount]);

  useEffect(() => {
    // This effect runs only on the client to avoid hydration mismatch
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const randomGas = (Math.random() * (45 - 5) + 5).toFixed(2);
      setGasEstimate(`$${randomGas}`);
    } else {
      setGasEstimate("-");
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };
  
  const handleFromTokenChange = (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
        if (toToken && token.symbol === toToken.symbol) {
            handleSwap();
        } else {
            setFromToken(token);
        }
    }
  };

  const handleToTokenChange = (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
        if (fromToken && token.symbol === fromToken.symbol) {
            handleSwap();
        } else {
            setToToken(token);
        }
    }
  };

  const fetchReserves = useCallback(async () => {
      if (!fromToken || !toToken) return;

      setIsFetchingQuote(true);
      setExchangeRate(null);

      try {
          // In a real app, you would need the actual contract addresses.
          // This is a simplified example.
          const fromAddress = fromToken.symbol; 
          const toAddress = toToken.symbol;

          const response = await fetch(`/api/moralis/reserves?token0=${fromAddress}&token1=${toAddress}`);
          
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to fetch reserves.');
          }
          
          const data = await response.json();
          const reserve0 = parseFloat(data.reserve0);
          const reserve1 = parseFloat(data.reserve1);

          if (reserve0 > 0 && reserve1 > 0) {
              setExchangeRate(reserve1 / reserve0);
          } else {
              setExchangeRate(0);
          }

      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
          setExchangeRate(0);
      } finally {
          setIsFetchingQuote(false);
      }
  }, [fromToken, toToken, toast]);
  
  useEffect(() => {
    fetchReserves();
  }, [fetchReserves]);

  useEffect(() => {
    if (debouncedFromAmount && exchangeRate !== null) {
      const amount = parseFloat(debouncedFromAmount) * exchangeRate;
      setToAmount(amount.toLocaleString('en-US', { maximumFractionDigits: 5 }));
    } else {
      setToAmount("");
    }
  }, [debouncedFromAmount, exchangeRate]);

  if (cryptocurrencies.length === 0 || !fromToken || !toToken) {
    return (
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
          <CardHeader>
            <Skeleton className="h-8 w-24 mx-auto" />
          </CardHeader>
          <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
          <CardFooter className="flex-col gap-4">
            <Skeleton className="h-12 w-full" />
          </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="relative text-center">
        <CardTitle>Moralis Swap</CardTitle>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-2">
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="from-input">Sell</label>
          <div className="flex items-center gap-2">
            <Input id="from-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={e => setFromAmount(e.target.value)} />
            <Select value={fromToken.symbol} onValueChange={handleFromTokenChange}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                 <div className="flex items-center gap-2">
                    <Image
                        src={fromToken.logo || `https://placehold.co/20x20.png`}
                        alt={`${fromToken.name} logo`}
                        width={20}
                        height={20}
                        className="rounded-full"
                    />
                    {fromToken.symbol}
                </div>
              </SelectTrigger>
              <SelectContent>
                {cryptocurrencies.map((token) => (
                  <SelectItem key={token.id} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={token.logo || `https://placehold.co/20x20.png`}
                        alt={`${token.name} logo`}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center my-[-18px] z-10">
          <Button variant="secondary" size="icon" className="rounded-full border-4 border-background" onClick={handleSwap}>
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="to-input">Buy</label>
          <div className="flex items-center gap-2">
             <div className="flex-1 text-3xl h-12 flex items-center p-0">
                {isFetchingQuote ? <Loader2 className="h-6 w-6 animate-spin" /> : <Input type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={toAmount} readOnly />}
            </div>
            <Select value={toToken.symbol} onValueChange={handleToTokenChange}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <div className="flex items-center gap-2">
                    <Image
                        src={toToken.logo || `https://placehold.co/20x20.png`}
                        alt={`${toToken.name} logo`}
                        width={20}
                        height={20}
                        className="rounded-full"
                    />
                    {toToken.symbol}
                </div>
              </SelectTrigger>
              <SelectContent>
                {cryptocurrencies.map((token) => (
                  <SelectItem key={token.id} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={token.logo || `https://placehold.co/20x20.png`}
                        alt={`${token.name} logo`}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="w-full">
            {isWalletConnected ? (
              <Button className="w-full h-12 text-lg" disabled={isFetchingQuote}>
                Swap
              </Button>
            ) : (
                <WalletConnect>
                    <Button className="w-full h-12 text-lg">Connect Wallet</Button>
                </WalletConnect>
            )}
        </div>
         <div className="w-full flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
                <span>{t('SwapInterface.price')}</span>
                <span>{exchangeRate && fromToken && toToken ? `1 ${fromToken.symbol} ≈ ${exchangeRate.toFixed(4)} ${toToken.symbol}` : "-"}</span>
            </div>
            <div className="flex justify-between">
                <span>{t('SwapInterface.priceImpact')}</span>
                <span className={cn({
                    "text-green-500": priceImpact !== null && priceImpact < 1,
                    "text-destructive": priceImpact !== null && priceImpact >= 3,
                })}>
                    {priceImpact ? `< ${priceImpact.toFixed(2)}%` : "-"}
                </span>
            </div>
            <div className="flex justify-between">
                <span>{t('SwapInterface.estimatedGas')}</span>
                <span>{gasEstimate}</span>
            </div>
            <div className="flex justify-between">
                <span>{t('SwapInterface.slippageTolerance')}</span>
                <span>{parseFloat(slippage)}%</span>
            </div>
        </div>
        <p className="text-xs text-muted-foreground/80 text-center">
            {t('SwapInterface.estimatesDisclaimer')}
        </p>
      </CardFooter>
    </Card>
  );
}
