
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Cryptocurrency, SelectedCurrency } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";

const supportedCurrencies: SelectedCurrency[] = [
    { symbol: 'USD', name: 'US Dollar', rate: 1 },
    { symbol: 'EUR', name: 'Euro', rate: 0.93 },
    { symbol: 'GBP', name: 'British Pound', rate: 0.79 },
    { symbol: 'JPY', name: 'Japanese Yen', rate: 157.2 },
    { symbol: 'AUD', name: 'Australian Dollar', rate: 1.51 },
    { symbol: 'CAD', name: 'Canadian Dollar', rate: 1.37 },
    { symbol: 'CHF', name: 'Swiss Franc', rate: 0.90 },
    { symbol: 'CNY', name: 'Chinese Yuan', rate: 7.25 },
    { symbol: 'INR', name: 'Indian Rupee', rate: 83.5 },
];

const FormattedPrice = ({ price, currency }: { price: number; currency: SelectedCurrency }) => {
  const [formattedPrice, setFormattedPrice] = useState<string>("");

  useEffect(() => {
    const convertedPrice = price * currency.rate;
    setFormattedPrice(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.symbol,
        minimumFractionDigits: 2,
        maximumFractionDigits: convertedPrice < 1 ? 6 : 2,
      }).format(convertedPrice)
    );
  }, [price, currency]);

  return <>{formattedPrice}</>;
};

function CryptoList({ coins, currency }: { coins: Cryptocurrency[], currency: SelectedCurrency }) {
  return (
    <div className="flex flex-col gap-1">
      {coins.map((coin, index) => (
        <div key={coin.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-3 p-2 rounded-md hover:bg-secondary/50 transition-colors">
          <div className="text-sm font-medium text-muted-foreground text-center w-[20px]">{index + 1}</div>
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src={coin.logo || `https://placehold.co/24x24.png`}
              alt={`${coin.name} logo`}
              width={24}
              height={24}
              className="rounded-full"
            />
            <div className="flex items-baseline gap-1.5 overflow-hidden">
              <span className="font-semibold text-sm truncate">{coin.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">{coin.symbol}</span>
            </div>
          </div>
          <div className="font-mono text-sm text-right whitespace-nowrap">
            <FormattedPrice price={coin.price} currency={currency} />
          </div>
          <div
            className={cn(
              "font-medium text-sm flex items-center justify-end gap-1 w-[70px]",
              coin.change24h >= 0 ? "text-green-500" : "text-destructive"
            )}
          >
            {coin.change24h >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{Math.abs(coin.change24h).toFixed(2)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MarketListCard({ title, coins }: { title: string, coins: Cryptocurrency[] }) {
  const [currency, setCurrency] = useState<SelectedCurrency>(supportedCurrencies[0]);

  const handleCurrencyChange = (symbol: string) => {
    const newCurrency = supportedCurrencies.find(c => c.symbol === symbol);
    if (newCurrency) {
        setCurrency(newCurrency);
    }
  };

  return (
    <Card className="shadow-lg shadow-primary/5">
        <CardHeader>
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg font-semibold pt-1">{title}</CardTitle>
                <div className="w-full max-w-[100px]">
                    <Select onValueChange={handleCurrencyChange} defaultValue={currency.symbol}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select currency..." />
                        </SelectTrigger>
                        <SelectContent>
                            {supportedCurrencies.map(c => (
                                <SelectItem key={c.symbol} value={c.symbol}>
                                    {c.symbol}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <CryptoList coins={coins} currency={currency} />
        </CardContent>
    </Card>
  );
}

export function MarketHighlights({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t } = useLanguage();
  const topGainers = [...cryptocurrencies]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 5);

  const topLosers = [...cryptocurrencies]
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, 5);

  const popular = cryptocurrencies.filter(c => ['BTC', 'ETH', 'SOL', 'DOGE', 'SHIB'].includes(c.symbol)).slice(0, 5);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <MarketListCard title={t('MarketHighlights.popular')} coins={popular} />
      <MarketListCard title={t('MarketHighlights.gainers')} coins={topGainers} />
      <MarketListCard title={t('MarketHighlights.losers')} coins={topLosers} />
    </div>
  );
}
