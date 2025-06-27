"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { Cryptocurrency } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";

function CryptoList({ coins }: { coins: Cryptocurrency[] }) {
  return (
    <div className="flex flex-col gap-1">
      {coins.map((coin, index) => (
        <div key={coin.id} className="grid grid-cols-[20px_1fr_auto_auto] items-center gap-4 p-2 rounded-md hover:bg-secondary/50 transition-colors">
          <div className="text-sm font-medium text-muted-foreground">{index + 1}</div>
          <div className="flex items-center gap-3">
            <Image
              src={coin.logo || `https://placehold.co/24x24.png`}
              alt={`${coin.name} logo`}
              width={24}
              height={24}
              className="rounded-full"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm truncate">{coin.name}</span>
              <span className="text-xs text-muted-foreground">{coin.symbol}</span>
            </div>
          </div>
          <div className="font-mono text-sm text-right">
            ${coin.price < 0.01 ? coin.price.toPrecision(2) : coin.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
          <div
            className={cn(
              "font-medium text-sm flex items-center justify-end gap-1 w-[75px]",
              coin.change24h >= 0 ? "text-primary" : "text-destructive"
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

export function MarketHighlights({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const topGainers = [...cryptocurrencies]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 5);

  const topLosers = [...cryptocurrencies]
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, 5);

  const trending = cryptocurrencies.filter(c => ['BTC', 'ETH', 'SOL', 'DOGE', 'SHIB'].includes(c.symbol)).slice(0, 5);

  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle>Market Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="gainers">
              Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers">
              Top Losers
            </TabsTrigger>
            <TabsTrigger value="trending">
              Trending
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gainers" className="mt-0">
            <CryptoList coins={topGainers} />
          </TabsContent>
          <TabsContent value="losers" className="mt-0">
            <CryptoList coins={topLosers} />
          </TabsContent>
          <TabsContent value="trending" className="mt-0">
            <CryptoList coins={trending} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
