'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Cryptocurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnect } from './wallet-connect';
import { Plus } from 'lucide-react';

export function CreatePositionInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const [token0, setToken0] = useState<Cryptocurrency>(cryptocurrencies.find(c => c.symbol === 'ETH') || cryptocurrencies[0]);
  const [token1, setToken1] = useState<Cryptocurrency>(cryptocurrencies.find(c => c.symbol === 'USDC') || (cryptocurrencies.length > 1 ? cryptocurrencies[1] : cryptocurrencies[0]));
  const [amount0, setAmount0] = useState<string>('1');
  const [amount1, setAmount1] = useState<string>('');
  const { isActive: isWalletConnected } = useWallet();
  const [lastEdited, setLastEdited] = useState<'token0' | 'token1'>('token0');

  const priceRatio = useMemo(() => {
    if (token0?.price > 0 && token1?.price > 0) {
      return token0.price / token1.price;
    }
    return 0;
  }, [token0, token1]);

  useEffect(() => {
    if (priceRatio > 0) {
      if (lastEdited === 'token0') {
        const amt0 = parseFloat(amount0);
        if (amt0 > 0) {
          setAmount1((amt0 * priceRatio).toFixed(5));
        } else {
          setAmount1('');
        }
      } else { // lastEdited === 'token1'
        const amt1 = parseFloat(amount1);
        if (amt1 > 0) {
          setAmount0((amt1 / priceRatio).toFixed(5));
        } else {
          setAmount0('');
        }
      }
    }
  }, [amount0, amount1, priceRatio, lastEdited]);

  const handleTokenChange = (setter: React.Dispatch<React.SetStateAction<Cryptocurrency>>, otherToken: Cryptocurrency) => (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
        if (token.symbol === otherToken.symbol) {
            // Swap tokens if the same one is selected
            if(setter.toString() === setToken0.toString()) {
                setToken0(token1);
                setToken1(token0);
            } else {
                setToken1(token0);
                setToken0(token1);
            }
        } else {
            setter(token);
        }
    }
  };
  
  const handleAmountChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: 'token0' | 'token1') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setLastEdited(field);
      setter(value);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="text-center">
        <CardTitle>Add Liquidity</CardTitle>
        <CardDescription>Create a new liquidity position.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="token0-input">Token 1</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="token0-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={amount0} onChange={handleAmountChange(setAmount0, "token0")} />
            <Select value={token0.symbol} onValueChange={handleTokenChange(setToken0, token1)}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
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

        <div className="flex justify-center my-[-12px] z-10">
            <Plus className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="p-4 rounded-lg bg-[#f8fafc] dark:bg-secondary/50 border">
          <label className="text-sm text-muted-foreground" htmlFor="token1-input">Token 2</label>
          <div className="flex items-center gap-2 mt-1">
            <Input id="token1-input" type="text" placeholder="0" className="text-3xl h-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0" value={amount1} onChange={handleAmountChange(setAmount1, "token1")} />
            <Select value={token1.symbol} onValueChange={handleTokenChange(setToken1, token0)}>
              <SelectTrigger className="w-[180px] h-12 text-lg font-bold">
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

        <div className="text-sm text-muted-foreground text-center mt-2 space-y-1">
            <div className='flex justify-center gap-4'>
                <span>1 {token0.symbol} = {priceRatio > 0 ? priceRatio.toFixed(4) : '-'} {token1.symbol}</span>
                <span>1 {token1.symbol} = {priceRatio > 0 ? (1 / priceRatio).toFixed(4) : '-'} {token0.symbol}</span>
            </div>
            <p>Your position will represent an estimated 0.01% of the pool.</p>
        </div>

      </CardContent>
      <CardFooter>
        {isWalletConnected ? (
          <Button className="w-full h-12 text-lg">Add Liquidity</Button>
        ) : (
          <WalletConnect>
            <Button className="w-full h-12 text-lg">Connect Wallet</Button>
          </WalletConnect>
        )}
      </CardFooter>
    </Card>
  );
}
