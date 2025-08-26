
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
import { ArrowDown, Info, Loader2 } from "lucide-react";
import type { Cryptocurrency } from "@/lib/types";
import { WalletConnect } from "./wallet-connect";
import Image from "next/image";
import { useWallet } from "@/hooks/use-wallet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "./ui/skeleton";

export function LimitOrderInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t } = useLanguage();

  if (cryptocurrencies.length === 0) {
    return (
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader><Skeleton className="h-8 w-24 mx-auto" /></CardHeader>
        <CardContent><Skeleton className="h-[400px] w-full" /></CardContent>
        <CardFooter><Skeleton className="h-12 w-full" /></CardFooter>
      </Card>
    );
  }
  
  const [fromToken, setFromToken] = useState<Cryptocurrency>(cryptocurrencies[0]);
  const [toToken, setToToken] = useState<Cryptocurrency>(cryptocurrencies.length > 1 ? cryptocurrencies[1] : cryptocurrencies[0]);
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("7d");
  const { isActive: isWalletConnected, balances, performSwap, isSwapping } = useWallet();
  const [lastEdited, setLastEdited] = useState<"from" | "to">("from");

  const fromTokenBalance = useMemo(() => balances?.[fromToken.symbol], [balances, fromToken.symbol]);
  const toTokenBalance = useMemo(() => balances?.[toToken.symbol], [balances, toToken.symbol]);

  const marketPrice = useMemo(() => {
    if (fromToken?.price > 0 && toToken?.price > 0) {
      return fromToken.price / toToken.price;
    }
    return 0;
  }, [fromToken, toToken]);

  // Set initial limit price when tokens change
  useEffect(() => {
    if (marketPrice > 0) {
      setLimitPrice(marketPrice.toFixed(5));
    }
  }, [marketPrice]);

  // Recalculate amounts when inputs change
  useEffect(() => {
    const price = parseFloat(limitPrice);
    if (price <= 0) return;

    if (lastEdited === 'from') {
      const from = parseFloat(fromAmount);
      if (from > 0) {
        setToAmount((from * price).toFixed(5));
      } else {
        setToAmount("");
      }
    } else { // lastEdited === 'to'
      const to = parseFloat(toAmount);
      if (to > 0) {
        setFromAmount((to / price).toFixed(5));
      } else {
        setFromAmount("");
      }
    }
  }, [fromAmount, toAmount, limitPrice, lastEdited]);
  

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
    const tempFromToken = fromToken;
    const tempFromAmount = fromAmount;
    setFromToken(toToken);
    setFromAmount(toAmount);
    setToToken(tempFromToken);
    setToAmount(tempFromAmount);
  };
  
  const handleAmountChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: "from" | "to") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setLastEdited(field);
      setter(value);
    }
  };
  
  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setLimitPrice(value);
    }
  };

  const handleSetMax = () => {
    if (fromTokenBalance) {
        setFromAmount(fromTokenBalance);
        setLastEdited('from');
    }
  };

  const limitPricePercentageDiff = useMemo(() => {
    const price = parseFloat(limitPrice);
    if (marketPrice > 0 && price > 0) {
      return ((price - marketPrice) / marketPrice) * 100;
    }
    return 0;
  }, [limitPrice, marketPrice]);

  const handlePlaceOrder = async () => {
    await performSwap(fromToken, toToken, fromAmount);
  }

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="relative text-center">
        <CardTitle>{t('LimitOrderInterface.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {/* From Token */}
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground" htmlFor="from-input">{t('LimitOrderInterface.youSell')}</label>
             {isWalletConnected && fromTokenBalance !== undefined && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>{t('SwapInterface.balance').replace('{balance}', `${parseFloat(fromTokenBalance).toLocaleString('en-US', {maximumFractionDigits: 5})} ${fromToken.symbol}`)}</span>
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSetMax}>
                        {t('SwapInterface.max')}
                    </Button>
                </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input id="from-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={handleAmountChange(setFromAmount, "from")} />
            <Select value={fromToken.symbol} onValueChange={handleFromTokenChange}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold bg-card">
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
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground" htmlFor="to-input">{t('LimitOrderInterface.youBuy')}</label>
            {isWalletConnected && toTokenBalance !== undefined && (
                <span className="text-sm text-muted-foreground">
                    {t('SwapInterface.balance').replace('{balance}', `${parseFloat(toTokenBalance).toLocaleString('en-US', {maximumFractionDigits: 5})} ${toToken.symbol}`)}
                </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input id="to-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={toAmount} onChange={handleAmountChange(setToAmount, "to")}/>
            <Select value={toToken.symbol} onValueChange={handleToTokenChange}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold bg-card">
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

        {/* Limit Price */}
        <div className="p-4 rounded-lg bg-secondary/50 border mt-2">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground" htmlFor="limit-price-input">{t('LimitOrderInterface.limitPrice')}</label>
                <span className="text-xs text-muted-foreground">{t('LimitOrderInterface.market')}: {marketPrice.toFixed(5)}</span>
            </div>
            <div className="relative">
                <Input id="limit-price-input" type="text" placeholder="0" className="text-lg h-12 bg-transparent pr-28" value={limitPrice} onChange={handleLimitPriceChange} />
                <div className="absolute inset-y-0 right-2 flex items-center text-lg font-medium">
                    {toToken.symbol} per {fromToken.symbol}
                </div>
            </div>
            <div className="text-center text-xs mt-2 text-muted-foreground">
                <span className={cn(
                    limitPricePercentageDiff >= 0 ? "text-primary" : "text-destructive"
                )}>
                    {limitPricePercentageDiff.toFixed(2)}%
                </span>
                <span> {limitPricePercentageDiff >= 0 ? t('LimitOrderInterface.aboveMarket') : t('LimitOrderInterface.belowMarket')}</span>
            </div>
        </div>
        
        {/* Expiry */}
        <div className="p-4 rounded-lg border mt-2">
             <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t('LimitOrderInterface.expiresIn')}</label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('LimitOrderInterface.expiresInTooltip')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <RadioGroup defaultValue="7d" className="grid grid-cols-4 gap-2 mt-2" onValueChange={setExpiry} value={expiry}>
                {['1D', '7D', '30D', 'Never'].map(period => (
                    <div key={period}>
                        <RadioGroupItem value={period.toLowerCase()} id={`expiry-${period}`} className="sr-only"/>
                        <Label
                            htmlFor={`expiry-${period}`}
                            className={cn(
                                "cursor-pointer flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                expiry === period.toLowerCase() && "border-primary"
                            )}
                        >
                            {period === 'Never' ? t('LimitOrderInterface.never') : period}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="w-full">
            {isWalletConnected ? (
               <Button className="w-full h-12 text-lg" onClick={handlePlaceOrder} disabled={isSwapping}>
                   {isSwapping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {isSwapping ? 'Placing Order...' : t('LimitOrderInterface.placeOrder')}
                </Button>
            ) : (
                <WalletConnect>
                    <Button className="w-full h-12 text-lg">{t('Header.connectWallet')}</Button>
                </WalletConnect>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
