
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { ArrowDownUp, Settings, Info, Loader2, Check, X, Search, ArrowLeft, ChevronDown } from "lucide-react";
import type { Cryptocurrency } from "@/lib/types";
import { WalletConnect } from "./wallet-connect";
import Image from "next/image";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";


interface TokenSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cryptocurrencies: Cryptocurrency[];
  onSelect: (token: Cryptocurrency) => void;
  selectedTokenSymbol?: string;
  title: string;
}

function TokenSelectDialog({ open, onOpenChange, cryptocurrencies, onSelect, selectedTokenSymbol, title }: TokenSelectDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<'All' | 'Stables' | 'Gainers' | 'Losers'>('All');

    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'USDP'];

    const filteredTokens = useMemo(() => {
        let tokens = cryptocurrencies;

        if (activeFilter === 'Stables') {
            tokens = tokens.filter(t => stablecoins.includes(t.symbol));
        } else if (activeFilter === 'Gainers') {
            tokens = tokens.filter(t => t.change24h >= 0);
        } else if (activeFilter === 'Losers') {
            tokens = tokens.filter(t => t.change24h < 0);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            return tokens.filter(
                (token) =>
                token.name.toLowerCase().includes(lowercasedQuery) ||
                token.symbol.toLowerCase().includes(lowercasedQuery)
            );
        }
        return tokens;
    }, [searchQuery, cryptocurrencies, activeFilter]);

    const handleSelect = (token: Cryptocurrency) => {
        onSelect(token);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                     <DialogTitle className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                       {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-4">
                     <div className="relative">
                        <Input
                            placeholder="Search currency"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex gap-2">
                        {(['All', 'Stables', 'Gainers', 'Losers', 'New'] as const).map(filter => (
                             <Button 
                                key={filter} 
                                variant={activeFilter === filter ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => setActiveFilter(filter as any)}
                                disabled={filter === 'New'} // Disable 'New' as per image styling
                             >
                                {filter}
                            </Button>
                        ))}
                    </div>
                </div>

                <ScrollArea className="h-80 border-t">
                    <div className="p-2">
                        {filteredTokens.map(token => (
                            <button
                                key={token.id}
                                onClick={() => handleSelect(token)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={token.logo || `https://placehold.co/40x40.png`}
                                        alt={token.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-bold">{token.symbol}</p>
                                            <p className="text-muted-foreground text-sm">{token.platform?.symbol}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground text-left">{token.name}</p>
                                    </div>
                                </div>
                                {selectedTokenSymbol === token.symbol && (
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

export function MoralisSwapInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t } = useLanguage();

  const [fromToken, setFromToken] = useState<Cryptocurrency | undefined>(cryptocurrencies.find(c => c.symbol === 'ETH'));
  const [toToken, setToToken] = useState<Cryptocurrency | undefined>(cryptocurrencies.find(c => c.symbol === 'USDC'));
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("");
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string>("-");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const [slippage, setSlippage] = useState("0.5");
  const [isSlippageAuto, setIsSlippageAuto] = useState(true);
  const [deadline, setDeadline] = useState("30");

  const [isFromDialogOpen, setIsFromDialogOpen] = useState(false);
  const [isToDialogOpen, setIsToDialogOpen] = useState(false);

  const { isActive: isWalletConnected, balances, performSwap, isSwapping } = useWallet();
  const { toast } = useToast();
  const debouncedFromAmount = useDebounce(fromAmount, 500);
  
  const fromTokenBalance = useMemo(() => balances?.[fromToken?.symbol || ''], [balances, fromToken]);
  const toTokenBalance = useMemo(() => balances?.[toToken?.symbol || ''], [balances, toToken]);


  const priceImpact = useMemo(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return null;
    }
    const impact = Math.min(0.01 + (parseFloat(fromAmount) / 10000), 10);
    return impact;
  }, [fromAmount]);

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const randomGas = (Math.random() * (45 - 5) + 5).toFixed(2);
      setGasEstimate(`$${randomGas}`);
    } else {
      setGasEstimate("-");
    }
  }, [fromAmount, fromToken, toToken]);
  
  const fetchReserves = useCallback(async () => {
      if (!fromToken || !toToken) return;
      setIsFetchingQuote(true);
      setExchangeRate(null);
      try {
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


  const handleSwap = () => {
    const tempFromToken = fromToken;
    const tempFromAmount = fromAmount;
    setFromToken(toToken);
    setFromAmount(toAmount);
    setToToken(tempFromToken);
    setToAmount(tempFromAmount);
  };
  
  const handleFromTokenChange = (token: Cryptocurrency) => {
    if (toToken && token.symbol === toToken.symbol) {
        handleSwap();
    } else {
        setFromToken(token);
    }
  };

  const handleToTokenChange = (token: Cryptocurrency) => {
    if (fromToken && token.symbol === fromToken.symbol) {
        handleSwap();
    } else {
        setToToken(token);
    }
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
        if (exchangeRate && exchangeRate > 0) {
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

  const handleSetMax = () => {
    if (fromTokenBalance) {
        setFromAmount(fromTokenBalance);
    }
  };
  
   const handleSwapClick = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
        toast({ variant: 'destructive', title: 'Invalid input', description: 'Please provide valid token and amount details.' });
        return;
    }
    await performSwap(fromToken, toToken, fromAmount);
  };

  const slippageValueDisplay = parseFloat(slippage) || 0;


  if (cryptocurrencies.length === 0 || !fromToken || !toToken) {
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

  return (
    <>
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
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm text-muted-foreground">{t('SwapInterface.sell')}</span>
            {isWalletConnected && fromTokenBalance !== undefined && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>{t('SwapInterface.balance').replace('{balance}', `${parseFloat(fromTokenBalance).toLocaleString('en-US', {maximumFractionDigits: 5})}`)}</span>
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSetMax}>
                        {t('SwapInterface.max')}
                    </Button>
                </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input id="from-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fromAmount} onChange={handleFromAmountChange} />
            <Button variant="outline" className="h-12 text-lg font-bold bg-background hover:bg-accent min-w-[130px]" onClick={() => setIsFromDialogOpen(true)}>
                  <div className="flex items-center gap-2">
                      <Image
                          src={fromToken.logo || `https://placehold.co/24x24.png`}
                          alt={`${fromToken.name} logo`}
                          width={24}
                          height={24}
                          className="rounded-full"
                      />
                      {fromToken.symbol}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>
              </Button>
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
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm text-muted-foreground">{t('SwapInterface.buy')}</span>
            {isWalletConnected && toTokenBalance !== undefined && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>{t('SwapInterface.balance').replace('{balance}', `${parseFloat(toTokenBalance).toLocaleString('en-US', {maximumFractionDigits: 5})}`)}</span>
                </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isFetchingQuote ? (
              <div className="flex-1 flex items-center h-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Input id="to-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={toAmount} onChange={handleToAmountChange}/>
            )}
            <Button variant="outline" className="h-12 text-lg font-bold bg-background hover:bg-accent min-w-[130px]" onClick={() => setIsToDialogOpen(true)}>
                  <div className="flex items-center gap-2">
                      <Image
                          src={toToken.logo || `https://placehold.co/24x24.png`}
                          alt={`${toToken.name} logo`}
                          width={24}
                          height={24}
                          className="rounded-full"
                      />
                      {toToken.symbol}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>
              </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="w-full">
              {isWalletConnected ? (
                <Button className="w-full h-12 text-lg" disabled={isFetchingQuote || isSwapping} onClick={handleSwapClick}>
                  {isSwapping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSwapping ? 'Swapping...' : t('TradeNav.swap')}
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
                  <span>{slippageValueDisplay}%</span>
              </div>
          </div>
          <p className="text-xs text-muted-foreground/80 text-center">
              {t('SwapInterface.estimatesDisclaimer')}
          </p>
        </CardFooter>
      </Card>
      
      <TokenSelectDialog
          open={isFromDialogOpen}
          onOpenChange={setIsFromDialogOpen}
          cryptocurrencies={cryptocurrencies}
          onSelect={handleFromTokenChange}
          selectedTokenSymbol={fromToken.symbol}
          title="Select a currency"
      />
      <TokenSelectDialog
          open={isToDialogOpen}
          onOpenChange={setIsToDialogOpen}
          cryptocurrencies={cryptocurrencies}
          onSelect={handleToTokenChange}
          selectedTokenSymbol={toToken.symbol}
          title="Select a currency"
      />
    </>
  );
}
