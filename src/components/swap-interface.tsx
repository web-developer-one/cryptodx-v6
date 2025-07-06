
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
import { ArrowDownUp, Settings, Info } from "lucide-react";
import type { Cryptocurrency } from "@/lib/types";
import { WalletConnect } from "./wallet-connect";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

export function SwapInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const [fromToken, setFromToken] = useState<Cryptocurrency>(cryptocurrencies[0]);
  const [toToken, setToToken] = useState<Cryptocurrency>(cryptocurrencies.length > 1 ? cryptocurrencies[1] : cryptocurrencies[0]);
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("");
  const { isActive: isWalletConnected } = useWallet();
  const [gasEstimate, setGasEstimate] = useState<string>("-");

  const [slippage, setSlippage] = useState("0.5");
  const [isSlippageAuto, setIsSlippageAuto] = useState(true);
  const [deadline, setDeadline] = useState("30");
  const { toast } = useToast();
  const { t } = useLanguage();

  const exchangeRate = useMemo(() => {
    if (fromToken?.price > 0 && toToken?.price > 0) {
      return fromToken.price / toToken.price;
    }
    return 0;
  }, [fromToken, toToken]);

  const priceImpact = useMemo(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return null;
    }
    // Simulate a small price impact that increases with trade size
    const impact = Math.min(0.01 + (parseFloat(fromAmount) / 10000), 10);
    return impact;
  }, [fromAmount]);

  useEffect(() => {
    if (fromAmount && exchangeRate > 0) {
      const amount = parseFloat(fromAmount) * exchangeRate;
      setToAmount(amount.toLocaleString('en-US', { maximumFractionDigits: 5 }));
    } else {
      setToAmount("");
    }
  }, [fromAmount, exchangeRate]);

  useEffect(() => {
    // This effect runs only on the client to avoid hydration mismatch
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const randomGas = (Math.random() * (45 - 5) + 5).toFixed(2);
      setGasEstimate(`$${randomGas}`);
    } else {
      setGasEstimate("-");
    }
  }, [fromAmount, fromToken, toToken]);

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

  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setIsSlippageAuto(false);
      setSlippage(value);
    }
  };

  const handleAutoSlippage = () => {
    setIsSlippageAuto(true);
    setSlippage("0.5");
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setDeadline(value);
    }
  }

  const handleSwapClick = async () => {
    if (!isWalletConnected) return;
    toast({
        title: t('SwapInterface.swapInitiated'),
        description: t('SwapInterface.reputationPassedSwap'),
    });
  };

  const slippageValueDisplay = parseFloat(slippage) || 0;

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="relative text-center">
        <CardTitle>{t('SwapInterface.title')}</CardTitle>
        <CardDescription>{t('SwapInterface.description')}</CardDescription>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
              <Settings className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">{t('SwapInterface.settingsTitle')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('SwapInterface.settingsDescription')}
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slippage" className="flex items-center gap-1">
                    {t('SwapInterface.maxSlippage')}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('SwapInterface.maxSlippageTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Button variant={isSlippageAuto ? 'secondary' : 'ghost'} size="sm" onClick={handleAutoSlippage} className="h-7">{t('SwapInterface.auto')}</Button>
                </div>
                <div className="relative">
                  <Input
                    id="slippage"
                    type="text"
                    value={slippage}
                    onChange={handleSlippageChange}
                    className="h-10 pr-7 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="deadline" className="flex items-center gap-1">
                    {t('SwapInterface.swapDeadline')}
                     <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Info className="h-3 w-3 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('SwapInterface.swapDeadlineTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="deadline"
                    type="text"
                    value={deadline}
                    onChange={handleDeadlineChange}
                    className="h-10 pr-20 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{t('SwapInterface.minutes')}</span>
                </div>
              </div>
               <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trade-options" className="flex items-center gap-1">
                    {t('SwapInterface.tradeOptions')}
                  </Label>
                </div>
                <Input
                  id="trade-options"
                  value="Default"
                  disabled
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-2">
        {/* From Token */}
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground" htmlFor="from-input">{t('SwapInterface.from')}</label>
            <span className="text-sm text-muted-foreground">{t('SwapInterface.sell')}</span>
          </div>
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
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground" htmlFor="to-input">{t('SwapInterface.to')}</label>
            <span className="text-sm text-muted-foreground">{t('SwapInterface.buy')}</span>
          </div>
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
                  {t('TradeNav.swap')}
               </Button>
            ) : (
                <WalletConnect>
                    <Button className="w-full h-12 text-lg">{t('Header.connectWallet')}</Button>
                </WalletConnect>
            )}
        </div>
        <div className="w-full flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
                <span>{t('SwapInterface.price')}</span>
                <span>{exchangeRate > 0 ? `1 ${fromToken.symbol} ≈ ${exchangeRate.toFixed(4)} ${toToken.symbol}` : "-"}</span>
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
                <span>{slippageValueDisplay}%</span>
            </div>
        </div>
        <p className="text-xs text-muted-foreground/80 text-center">
            {t('SwapInterface.estimatesDisclaimer')}
        </p>
      </CardFooter>
    </Card>
  );
}
