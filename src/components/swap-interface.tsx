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
import { ArrowDownUp, Settings, Info, AlertTriangle, Loader2 } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { checkTokenReputation } from "@/ai/flows/check-token-reputation";
import { useReputation } from "@/hooks/use-reputation";

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
  const [isChecking, setIsChecking] = useState(false);
  const [reputationAlert, setReputationAlert] = useState<{ title: string; description: React.ReactNode } | null>(null);
  const { isReputationCheckEnabled } = useReputation();

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
    if (!isWalletConnected || isChecking) return;

    if (!isReputationCheckEnabled) {
      toast({
          title: "Swap Initiated (Simulated)",
          description: "Reputation check was skipped. Your transaction is being processed.",
      });
      return;
    }
    
    setIsChecking(true);
    setReputationAlert(null);

    try {
        const tokensToCheck = [fromToken, toToken].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i); // de-duplicate
        
        const reputationPromises = tokensToCheck.map(token => 
            checkTokenReputation({
                tokenName: token.name,
                tokenSymbol: token.symbol,
            }).then(result => ({ ...result, token }))
        );

        const results = await Promise.all(reputationPromises);
        const badTokens = results.filter(r => r.isScamOrScandal);

        if (badTokens.length > 0) {
            const description = (
                <div className="space-y-4">
                    {badTokens.map(({ token, reasoning, sourceUrl }) => (
                        <div key={token.id}>
                            <p>
                                <strong>{token.name} ({token.symbol}):</strong> {reasoning}
                            </p>
                            {sourceUrl && (
                                <p className="text-sm mt-1">
                                    Source: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 break-all">{sourceUrl}</a>
                                </p>
                            )}
                        </div>
                    ))}
                    <p className="mt-4 text-xs text-muted-foreground">
                        This is for informational purposes only and does not constitute financial advice. Please do your own research before proceeding.
                    </p>
                </div>
            );
            setReputationAlert({
                title: 'Reputation Alert',
                description: description,
            });
        } else {
            toast({
                title: "Swap Initiated (Simulated)",
                description: "Reputation checks passed. Your transaction is being processed.",
            });
        }
    } catch (error) {
        console.error("Reputation check failed:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not perform reputation check. Please try again.",
        });
    } finally {
        setIsChecking(false);
    }
  };

  const slippageValueDisplay = parseFloat(slippage) || 0;

  return (
    <>
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="relative text-center">
        <CardTitle>Swap</CardTitle>
        <CardDescription>Trade tokens in an instant</CardDescription>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
              <Settings className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Customize your transaction settings.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slippage" className="flex items-center gap-1">
                    Max Slippage
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your transaction will revert if the price changes<br/>unfavorably by more than this percentage.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Button variant={isSlippageAuto ? 'secondary' : 'ghost'} size="sm" onClick={handleAutoSlippage} className="h-7">Auto</Button>
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
                    Swap Deadline
                     <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Info className="h-3 w-3 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your transaction will revert if it is pending for<br/>longer than this time.</p>
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">minutes</span>
                </div>
              </div>
               <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trade-options" className="flex items-center gap-1">
                    Trade Options
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
            <label className="text-sm text-muted-foreground" htmlFor="from-input">From</label>
            <span className="text-sm text-muted-foreground">Sell</span>
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
            <label className="text-sm text-muted-foreground" htmlFor="to-input">To</label>
            <span className="text-sm text-muted-foreground">Buy</span>
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
               <Button className="w-full h-12 text-lg" onClick={handleSwapClick} disabled={isChecking}>
                  {isChecking ? <Loader2 className="h-6 w-6 animate-spin" /> : "Swap"}
               </Button>
            ) : (
                <WalletConnect>
                    <Button className="w-full h-12 text-lg">Connect Wallet</Button>
                </WalletConnect>
            )}
        </div>
        <div className="w-full flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
                <span>Price</span>
                <span>{exchangeRate > 0 ? `1 ${fromToken.symbol} ≈ ${exchangeRate.toFixed(4)} ${toToken.symbol}` : "-"}</span>
            </div>
            <div className="flex justify-between">
                <span>Price Impact</span>
                <span className={cn({
                    "text-green-500": priceImpact !== null && priceImpact < 1,
                    "text-destructive": priceImpact !== null && priceImpact >= 3,
                })}>
                    {priceImpact ? `< ${priceImpact.toFixed(2)}%` : "-"}
                </span>
            </div>
            <div className="flex justify-between">
                <span>Estimated Gas</span>
                <span>{gasEstimate}</span>
            </div>
            <div className="flex justify-between">
                <span>Slippage Tolerance (%)</span>
                <span>{slippageValueDisplay}%</span>
            </div>
        </div>
        <p className="text-xs text-muted-foreground/80 text-center">
            Estimates are based on real-time API data but market conditions can change rapidly. Slippage may occur.
        </p>
      </CardFooter>
    </Card>

    <AlertDialog open={!!reputationAlert} onOpenChange={(open) => !open && setReputationAlert(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <span>{reputationAlert?.title}</span>
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div className="pt-4 text-base">
                        {reputationAlert?.description}
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setReputationAlert(null)}>Cancel Swap</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    toast({
                        title: "Swap Initiated (Simulated)",
                        description: "You have acknowledged the risk. Your transaction is being processed.",
                    });
                    setReputationAlert(null);
                }}>
                    Acknowledge and Continue
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
