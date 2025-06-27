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
import { ArrowDownUp, Settings } from "lucide-react";
import { cryptocurrencies as cryptoData } from "@/lib/crypto-data";
import type { Cryptocurrency } from "@/lib/types";
import { WalletConnect } from "./wallet-connect";
import Image from "next/image";

export function SwapInterface() {
  const [fromToken, setFromToken] = useState<Cryptocurrency>(cryptoData[0]);
  const [toToken, setToToken] = useState<Cryptocurrency>(cryptoData[1]);
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const exchangeRate = useMemo(() => {
    if (fromToken.price > 0 && toToken.price > 0) {
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
  
  // Simulate wallet connection
  const handleWalletConnect = () => {
    setTimeout(() => setIsWalletConnected(true), 500);
  };

  const handleFromTokenChange = (symbol: string) => {
    const token = cryptoData.find((t) => t.symbol === symbol);
    if (token) {
        if (token.symbol === toToken.symbol) {
            handleSwap();
        } else {
            setFromToken(token);
        }
    }
  };

  const handleToTokenChange = (symbol: string) => {
    const token = cryptoData.find((t) => t.symbol === symbol);
    if (token) {
        if (token.symbol === fromToken.symbol) {
            handleSwap();
        } else {
            setToToken(token);
        }
    }
  };

  const handleSwap = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
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


  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Swap</CardTitle>
          <CardDescription>Trade tokens in an instant</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-2">
        {/* From Token */}
        <div className="p-4 rounded-lg bg-secondary/50 border">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground" htmlFor="from-input">From</label>
            <span className="text-sm text-muted-foreground">Balance: -</span>
          </div>
          <div className="flex items-center gap-2">
            <Input id="from-input" type="text" placeholder="0" className="text-2xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={handleFromAmountChange} />
            <Select value={fromToken.symbol} onValueChange={handleFromTokenChange}>
              <SelectTrigger className="w-[150px] h-10 text-lg font-bold">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {cryptoData.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={`https://placehold.co/20x20.png`}
                        alt={`${token.name} logo`}
                        width={20}
                        height={20}
                        className="rounded-full"
                        data-ai-hint={`${token.symbol} logo`}
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
        <div className="p-4 rounded-lg bg-secondary/50 border">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground" htmlFor="to-input">To</label>
            <span className="text-sm text-muted-foreground">Balance: -</span>
          </div>
          <div className="flex items-center gap-2">
            <Input id="to-input" type="text" placeholder="0" className="text-2xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={toAmount} onChange={handleToAmountChange}/>
            <Select value={toToken.symbol} onValueChange={handleToTokenChange}>
              <SelectTrigger className="w-[150px] h-10 text-lg font-bold">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {cryptoData.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                       <Image
                        src={`https://placehold.co/20x20.png`}
                        alt={`${token.name} logo`}
                        width={20}
                        height={20}
                        className="rounded-full"
                        data-ai-hint={`${token.symbol} logo`}
                      />
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center pt-4">
            1 {fromToken.symbol} = {exchangeRate.toFixed(4)} {toToken.symbol}
        </div>

      </CardContent>
      <CardFooter>
        {isWalletConnected ? (
           <Button className="w-full h-12 text-lg">Swap</Button>
        ) : (
            <WalletConnect onConnect={handleWalletConnect}>
                <Button className="w-full h-12 text-lg">Connect Wallet</Button>
            </WalletConnect>
        )}
      </CardFooter>
    </Card>
  );
}
