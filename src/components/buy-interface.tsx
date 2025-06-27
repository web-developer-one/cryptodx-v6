'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Cryptocurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from './wallet-connect';
import { DollarSign } from 'lucide-react';

export function BuyInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const [toToken, setToToken] = useState<Cryptocurrency>(cryptocurrencies.find(c => c.symbol === 'ETH') || cryptocurrencies[0]);
  const [usdAmount, setUsdAmount] = useState<string>('100');
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const { isActive: isWalletConnected } = useWallet();

  useEffect(() => {
    if (usdAmount && toToken?.price > 0) {
      const amount = parseFloat(usdAmount) / toToken.price;
      setCryptoAmount(amount.toLocaleString('en-US', { maximumFractionDigits: 5 }));
    } else {
      setCryptoAmount('');
    }
  }, [usdAmount, toToken]);
  
  const handleUsdAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setUsdAmount(value);
    }
  }

  const handleCryptoAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setCryptoAmount(value);
        if (toToken?.price > 0) {
            const amount = parseFloat(value) * toToken.price;
            setUsdAmount(amount.toLocaleString('en-US', { maximumFractionDigits: 2 }));
        }
    }
  }

  const handleToTokenChange = (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
      setToToken(token);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="text-center">
        <CardTitle>Buy Crypto</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* You pay */}
        <div className="p-4 rounded-lg bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="usd-input">You pay</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="usd-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={usdAmount} onChange={handleUsdAmountChange} />
            <div className="flex items-center gap-2 p-3 rounded-md bg-background border">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-bold">USD</span>
            </div>
          </div>
        </div>
        
        {/* You get */}
        <div className="p-4 rounded-lg bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="crypto-input">You get</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="crypto-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={cryptoAmount} onChange={handleCryptoAmountChange}/>
            <Select value={toToken.symbol} onValueChange={handleToTokenChange}>
              <SelectTrigger className="w-[150px] h-12 text-lg font-bold">
                <SelectValue placeholder="Select" />
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
            1 {toToken.symbol} ≈ ${toToken.price.toFixed(2)}
        </div>
      </CardContent>
      <CardFooter>
        {isWalletConnected ? (
          <Button className="w-full h-12 text-lg">Continue</Button>
        ) : (
          <WalletConnect>
            <Button className="w-full h-12 text-lg">Connect Wallet</Button>
          </WalletConnect>
        )}
      </CardFooter>
    </Card>
  );
}
