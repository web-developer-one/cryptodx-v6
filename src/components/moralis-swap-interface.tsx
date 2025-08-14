
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { ArrowDownUp } from "lucide-react";
import type { Cryptocurrency } from "@/lib/types";
import { WalletConnect } from "./wallet-connect";
import Image from "next/image";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "./ui/skeleton";

export function MoralisSwapInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t } = useLanguage();

  if (cryptocurrencies.length === 0) {
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

  const [fromToken, setFromToken] = useState<Cryptocurrency>(cryptocurrencies[0]);
  const [toToken, setToToken] = useState<Cryptocurrency>(cryptocurrencies.length > 1 ? cryptocurrencies[1] : cryptocurrencies[0]);
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("");
  const { isActive: isWalletConnected } = useWallet();

  const { toast } = useToast();

  const exchangeRate = useMemo(() => {
    if (fromToken?.price > 0 && toToken?.price > 0) {
      return fromToken.price / toToken.price;
    }
    return 0;
  }, [fromToken, toToken]);

  useEffect(() => {
    if (fromAmount && exchangeRate > 0) {
      const amount = parseFloat(fromAmount) * exchangeRate;
      setToAmount(amount.toLocaleString('en-US', { maximumFractionDigits: 5 }));
    } else {
      setToAmount("");
    }
  }, [fromAmount, exchangeRate]);


  const handleFromTokenChange = (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
        if (token.symbol === toToken.symbol) {
            handleSwap();
        } else {
            setFromToken(token);
        }
    }
  };

  const handleToTokenChange = (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
        if (token.symbol === fromToken.symbol) {
            handleSwap();
        } else {
            setToToken(token);
        }
    }
  };

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
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
        if (exchangeRate > 0) {
            const amount = parseFloat(value) / exchangeRate;
            setFromAmount(amount.toLocaleString('en-US', { maximumFractionDigits: 5 }));
        }
    }
  }

  const handleSwapClick = () => {
    toast({
        title: "Swap Submitted (Simulated)",
        description: `Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
    });
  };

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="relative text-center">
        <CardTitle>Swap</CardTitle>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-2">
        {/* From Token */}
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="from-input">Sell</label>
          <div className="flex items-center gap-2">
            <Input id="from-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={handleFromAmountChange} />
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

        {/* Swap Button */}
        <div className="flex justify-center my-[-18px] z-10">
          <Button variant="secondary" size="icon" className="rounded-full border-4 border-background" onClick={handleSwap}>
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="to-input">Buy</label>
          <div className="flex items-center gap-2">
            <Input id="to-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={toAmount} onChange={handleToAmountChange}/>
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
              <Button className="w-full h-12 text-lg" onClick={handleSwapClick}>
                Swap
              </Button>
            ) : (
                <WalletConnect>
                    <Button className="w-full h-12 text-lg">Connect Wallet</Button>
                </WalletConnect>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
