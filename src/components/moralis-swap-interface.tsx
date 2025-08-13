
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { ArrowDownUp, Settings, Info, Loader2 } from "lucide-react";
import type { Cryptocurrency } from "@/lib/types";
import { WalletConnect } from "./wallet-connect";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "./ui/skeleton";
import { ethers } from "ethers";

// Mock token addresses for demonstration. Replace with actual addresses for a real app.
const tokenAddresses: Record<string, string> = {
    "ETH": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "USDC": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "WBTC": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    "DAI": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "MATIC": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    "SOL": "0xD31a59c85AE9D8edEFeC411E42BAf13054238241" // Note: This is a wrapped SOL on Ethereum
};


export function MoralisSwapInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t } = useLanguage();

  if (cryptocurrencies.length === 0) {
    return (
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
          <CardHeader>
            <Skeleton className="h-8 w-24 mx-auto" />
            <Skeleton className="h-5 w-48 mx-auto mt-2" />
          </CardHeader>
          <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
          <CardFooter className="flex-col gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardFooter>
      </Card>
    );
  }

  const [fromToken, setFromToken] = useState<Cryptocurrency>(cryptocurrencies[0]);
  const [toToken, setToToken] = useState<Cryptocurrency>(cryptocurrencies.length > 1 ? cryptocurrencies[1] : cryptocurrencies[0]);
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("");
  const { account, isActive: isWalletConnected, selectedNetwork } = useWallet();
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [quote, setQuote] = useState<any>(null);

  const [slippage, setSlippage] = useState("0.5");
  const [deadline, setDeadline] = useState("30");
  const { toast } = useToast();

  const handleFromTokenChange = (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
      if (token.symbol === toToken.symbol) handleSwap();
      else setFromToken(token);
    }
  };

  const handleToTokenChange = (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
        if (token.symbol === fromToken.symbol) handleSwap();
        else setToToken(token);
    }
  };

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setQuote(null);
  };
  
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      setQuote(null);
      setToAmount("");
    }
  };
  
  const getQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !isWalletConnected || !account) return;
    setIsFetchingQuote(true);
    setQuote(null);
    try {
        const fromTokenAddress = tokenAddresses[fromToken.symbol];
        const toTokenAddress = tokenAddresses[toToken.symbol];

        if(!fromTokenAddress || !toTokenAddress) {
            toast({ variant: 'destructive', title: "Unsupported Token", description: "One of the selected tokens is not supported for swaps."});
            return;
        }

        const amount = ethers.parseUnits(fromAmount, 18).toString();

        const res = await fetch('/api/moralis/swap', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chain: selectedNetwork.chainId,
                fromTokenAddress,
                toTokenAddress,
                amount,
                fromAddress: account
            })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Failed to fetch quote.");
        
        setQuote(data);
        setToAmount(ethers.formatUnits(data.toAmount, 18));

    } catch (e: any) {
        toast({ variant: 'destructive', title: "Error getting quote", description: e.message });
    } finally {
        setIsFetchingQuote(false);
    }
  }
  
  useEffect(() => {
    if(fromAmount && parseFloat(fromAmount) > 0) {
        const timer = setTimeout(() => getQuote(), 1000);
        return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAmount, fromToken, toToken, account, selectedNetwork.chainId]);

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="relative text-center">
        <CardTitle>Moralis Swap</CardTitle>
        <CardDescription>Swap tokens using Moralis 1inch Plugin</CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-2">
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground" htmlFor="from-input">{t('SwapInterface.sell')}</label>
          </div>
          <div className="flex items-center gap-2">
            <Input id="from-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={handleFromAmountChange} />
            <Select value={fromToken.symbol} onValueChange={handleFromTokenChange}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <div className="flex items-center gap-2">
                    <Image src={fromToken.logo || `https://placehold.co/20x20.png`} alt={`${fromToken.name} logo`} width={20} height={20} className="rounded-full" />
                    {fromToken.symbol}
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.keys(tokenAddresses).map((symbol) => {
                    const token = cryptocurrencies.find(c => c.symbol === symbol);
                    return token ? (
                        <SelectItem key={token.id} value={token.symbol}>
                            <div className="flex items-center gap-2">
                            <Image src={token.logo || `https://placehold.co/20x20.png`} alt={`${token.name} logo`} width={20} height={20} className="rounded-full" />
                            {token.symbol}
                            </div>
                        </SelectItem>
                    ) : null
                })}
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
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground" htmlFor="to-input">{t('SwapInterface.buy')}</label>
          </div>
          <div className="flex items-center gap-2">
            <Input id="to-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={isFetchingQuote ? '' : toAmount} readOnly />
            <Select value={toToken.symbol} onValueChange={handleToTokenChange}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <div className="flex items-center gap-2">
                    <Image src={toToken.logo || `https://placehold.co/20x20.png`} alt={`${toToken.name} logo`} width={20} height={20} className="rounded-full" />
                    {toToken.symbol}
                </div>
              </SelectTrigger>
               <SelectContent>
                {Object.keys(tokenAddresses).map((symbol) => {
                    const token = cryptocurrencies.find(c => c.symbol === symbol);
                    return token ? (
                        <SelectItem key={token.id} value={token.symbol}>
                            <div className="flex items-center gap-2">
                            <Image src={token.logo || `https://placehold.co/20x20.png`} alt={`${token.name} logo`} width={20} height={20} className="rounded-full" />
                            {token.symbol}
                            </div>
                        </SelectItem>
                    ) : null
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="w-full">
            {isWalletConnected ? (
              <Button className="w-full h-12 text-lg" onClick={getQuote} disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isFetchingQuote || !!quote}>
                {isFetchingQuote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {quote ? "Ready to Swap" : (isFetchingQuote ? "Getting Quote..." : "Get Quote")}
              </Button>
            ) : (
                <WalletConnect>
                    <Button className="w-full h-12 text-lg">{t('Header.connectWallet')}</Button>
                </WalletConnect>
            )}
        </div>
         {quote && (
             <p className="text-xs text-muted-foreground/80 text-center">
                Gas estimate: {quote.gas} units. This transaction will be sent via the 1inch aggregation protocol.
            </p>
         )}
      </CardFooter>
    </Card>
  );
}