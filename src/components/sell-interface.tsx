'use client';

import { useState, useEffect } from 'react';
import type { Cryptocurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import Image from 'next/image';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from './wallet-connect';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { checkTokenReputation } from '@/ai/flows/check-token-reputation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useReputation } from '@/hooks/use-reputation';

type SupportedCurrency = {
    symbol: string;
    name: string;
    currencySymbol: string;
    rate: number;
}

const supportedCurrencies: SupportedCurrency[] = [
    { symbol: 'USD', name: 'US Dollar', currencySymbol: '$', rate: 1 },
    { symbol: 'EUR', name: 'Euro', currencySymbol: '€', rate: 0.93 },
    { symbol: 'GBP', name: 'British Pound', currencySymbol: '£', rate: 0.79 },
    { symbol: 'JPY', name: 'Japanese Yen', currencySymbol: '¥', rate: 157.2 },
    { symbol: 'AUD', name: 'Australian Dollar', currencySymbol: 'A$', rate: 1.51 },
    { symbol: 'CAD', name: 'Canadian Dollar', currencySymbol: 'C$', rate: 1.37 },
    { symbol: 'CHF', name: 'Swiss Franc', currencySymbol: 'Fr', rate: 0.90 },
    { symbol: 'CNY', name: 'Chinese Yuan', currencySymbol: '¥', rate: 7.25 },
    { symbol: 'INR', name: 'Indian Rupee', currencySymbol: '₹', rate: 83.5 },
];


export function SellInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const [fromToken, setFromToken] = useState<Cryptocurrency>(cryptocurrencies.find(c => c.symbol === 'ETH') || cryptocurrencies[0]);
  const [cryptoAmount, setCryptoAmount] = useState<string>('1');
  const [fiatAmount, setFiatAmount] = useState<string>('');
  const [toFiat, setToFiat] = useState<SupportedCurrency>(supportedCurrencies[0]);
  const { isActive: isWalletConnected } = useWallet();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [reputationAlert, setReputationAlert] = useState<{ title: string; description: React.ReactNode } | null>(null);
  const { isReputationCheckEnabled } = useReputation();

  useEffect(() => {
    if (cryptoAmount && fromToken?.price > 0 && toFiat) {
      const amountInUsd = parseFloat(cryptoAmount) * fromToken.price;
      const convertedAmount = amountInUsd * toFiat.rate;
      setFiatAmount(convertedAmount.toLocaleString('en-US', { maximumFractionDigits: 2 }));
    } else {
      setFiatAmount('');
    }
  }, [cryptoAmount, fromToken, toFiat]);
  
  const handleCryptoAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCryptoAmount(value);
    }
  }

  const handleFiatAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setFiatAmount(value);
        if (fromToken?.price > 0 && toFiat.rate > 0) {
            const amountInUsd = parseFloat(value) / toFiat.rate;
            const amount = amountInUsd / fromToken.price;
            setCryptoAmount(amount.toLocaleString('en-US', { maximumFractionDigits: 5 }));
        }
    }
  }

  const handleFromTokenChange = (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
      setFromToken(token);
    }
  };
  
  const handleToFiatChange = (symbol: string) => {
    const fiat = supportedCurrencies.find((f) => f.symbol === symbol);
    if (fiat) {
        setToFiat(fiat);
    }
  }

  const handleSellClick = async () => {
    if (!isWalletConnected || isChecking) return;
    
    if (!isReputationCheckEnabled) {
      toast({
        title: "Sell Initiated (Simulated)",
        description: "Reputation check was skipped. Continuing to payment provider.",
      });
      return;
    }
    
    setIsChecking(true);
    setReputationAlert(null);

    try {
        const result = await checkTokenReputation({
            tokenName: fromToken.name,
            tokenSymbol: fromToken.symbol,
        });

        if (result.isScamOrScandal) {
            const description = (
                <div className="space-y-2">
                    <p>
                        <strong>{fromToken.name} ({fromToken.symbol}):</strong> {result.reasoning}
                    </p>
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
                title: "Sell Initiated (Simulated)",
                description: "Reputation check passed. Continuing to payment provider.",
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

  return (
    <>
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="text-center">
        <CardTitle>Sell Crypto</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* You sell */}
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="crypto-input">You sell</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="crypto-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={cryptoAmount} onChange={handleCryptoAmountChange}/>
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
        
        {/* You receive */}
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="fiat-input">You receive</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="fiat-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fiatAmount} onChange={handleFiatAmountChange} />
             <Select value={toFiat.symbol} onValueChange={handleToFiatChange}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                <div className="flex items-center gap-2">
                    <span>{toFiat.currencySymbol}</span>
                    <span>{toFiat.symbol}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {supportedCurrencies.map((fiat) => (
                  <SelectItem key={fiat.symbol} value={fiat.symbol}>
                    <div className="flex items-center gap-2">
                      <span>{fiat.currencySymbol}</span>
                      <span>{fiat.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center mt-2">
            1 {fromToken.symbol} ≈ {(fromToken.price * toFiat.rate).toFixed(2)} {toFiat.symbol}
        </div>
      </CardContent>
      <CardFooter>
        {isWalletConnected ? (
          <Button className="w-full h-12 text-lg" onClick={handleSellClick} disabled={isChecking}>
            {isChecking ? <Loader2 className="h-6 w-6 animate-spin" /> : "Continue"}
          </Button>
        ) : (
          <WalletConnect>
            <Button className="w-full h-12 text-lg">Connect Wallet</Button>
          </WalletConnect>
        )}
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
                <AlertDialogCancel onClick={() => setReputationAlert(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                    toast({
                        title: "Sell Initiated (Simulated)",
                        description: "You have acknowledged the risk. Continuing to payment provider.",
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
