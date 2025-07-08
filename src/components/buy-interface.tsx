
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Cryptocurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import Image from 'next/image';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from './wallet-connect';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Skeleton } from './ui/skeleton';

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


export function BuyInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t } = useLanguage();

  // Guard against rendering with no data, which can cause crashes on init
  if (cryptocurrencies.length === 0) {
    return (
       <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
          <CardHeader><Skeleton className="h-8 w-32 mx-auto" /></CardHeader>
          <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
          <CardFooter><Skeleton className="h-12 w-full" /></CardFooter>
      </Card>
    )
  }

  const [toToken, setToToken] = useState<Cryptocurrency>(cryptocurrencies.find(c => c.symbol === 'ETH') || cryptocurrencies[0]);
  const [fromFiat, setFromFiat] = useState<SupportedCurrency>(supportedCurrencies[0]);
  const [fiatAmount, setFiatAmount] = useState<string>('100');
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const { isActive: isWalletConnected, balances } = useWallet();
  const { toast } = useToast();

  const toTokenBalance = useMemo(() => balances?.[toToken.symbol], [balances, toToken.symbol]);
  
  useEffect(() => {
    if (fiatAmount && toToken?.price > 0 && fromFiat) {
      const amountInUsd = parseFloat(fiatAmount) / fromFiat.rate;
      const amount = amountInUsd / toToken.price;
      setCryptoAmount(amount.toLocaleString('en-US', { maximumFractionDigits: 5 }));
    } else {
      setCryptoAmount('');
    }
  }, [fiatAmount, toToken, fromFiat]);
  
  const handleFiatAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setFiatAmount(value);
    }
  }

  const handleCryptoAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setCryptoAmount(value);
        if (toToken?.price > 0 && fromFiat) {
            const amountInUsd = parseFloat(value) * toToken.price;
            const amount = amountInUsd * fromFiat.rate;
            setFiatAmount(amount.toLocaleString('en-US', { maximumFractionDigits: 2 }));
        }
    }
  }

  const handleToTokenChange = (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
      setToToken(token);
    }
  };
  
  const handleFromFiatChange = (symbol: string) => {
    const fiat = supportedCurrencies.find((f) => f.symbol === symbol);
    if (fiat) {
        setFromFiat(fiat);
    }
  }

  const handleBuyClick = () => {
    toast({
      title: t('BuyInterface.buyInitiated'),
      description: t('BuyInterface.paymentProvider'),
    });
  }

  return (
    <>
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="text-center">
        <CardTitle>{t('BuyInterface.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* You pay */}
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="fiat-input">{t('BuyInterface.youPay')}</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="fiat-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={fiatAmount} onChange={handleFiatAmountChange} />
             <Select value={fromFiat.symbol} onValueChange={handleFromFiatChange}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
                 <div className="flex items-center gap-2">
                    <span>{fromFiat.currencySymbol}</span>
                    <span>{fromFiat.symbol}</span>
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
        
        {/* You get */}
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-muted-foreground" htmlFor="crypto-input">{t('BuyInterface.youGet')}</label>
             {isWalletConnected && toTokenBalance !== undefined && (
                <span className="text-sm text-muted-foreground">
                    {t('SwapInterface.balance').replace('{balance}', `${parseFloat(toTokenBalance).toLocaleString('en-US', {maximumFractionDigits: 5})} ${toToken.symbol}`)}
                </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input id="crypto-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={cryptoAmount} onChange={handleCryptoAmountChange}/>
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

        <div className="text-sm text-muted-foreground text-center mt-2">
            1 {toToken.symbol} ≈ {(toToken.price * fromFiat.rate).toFixed(2)} {fromFiat.symbol}
        </div>
      </CardContent>
      <CardFooter>
        {isWalletConnected ? (
            <Button className="w-full h-12 text-lg" onClick={handleBuyClick}>
              {t('BuyInterface.continue')}
            </Button>
        ) : (
          <WalletConnect>
            <Button className="w-full h-12 text-lg">{t('Header.connectWallet')}</Button>
          </WalletConnect>
        )}
      </CardFooter>
    </Card>
    </>
  );
}
