"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cryptocurrencies } from "@/lib/crypto-data";
import type { Cryptocurrency } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import Image from "next/image";

const topGainers = [...cryptocurrencies]
  .sort((a, b) => b.change24h - a.change24h)
  .slice(0, 5);

const topLosers = [...cryptocurrencies]
  .sort((a, b) => a.change24h - b.change24h)
  .slice(0, 5);

const trending = [...cryptocurrencies].filter(c => ['BTC', 'ETH', 'SOL', 'DOGE', 'SHIB'].includes(c.symbol));

function CryptoTable({ coins }: { coins: Cryptocurrency[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Name</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">24h %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coins.map((coin) => (
          <TableRow key={coin.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Image
                    src={`https://placehold.co/24x24.png`}
                    alt={`${coin.name} logo`}
                    width={24}
                    height={24}
                    className="rounded-full"
                    data-ai-hint={`${coin.symbol} logo`}
                  />
                <span className="font-medium">{coin.name}</span>
                <span className="text-muted-foreground">{coin.symbol}</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-mono">${coin.price < 0.01 ? coin.price.toPrecision(2) : coin.price.toLocaleString()}</TableCell>
            <TableCell
              className={cn(
                "text-right font-medium",
                coin.change24h >= 0 ? "text-primary" : "text-destructive"
              )}
            >
              {coin.change24h >= 0 ? "+" : ""}
              {coin.change24h.toFixed(2)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function MarketHighlights() {
  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle>Market Highlights</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gainers">
              <TrendingUp className="mr-2 h-4 w-4" /> Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers">
              <TrendingDown className="mr-2 h-4 w-4" /> Top Losers
            </TabsTrigger>
            <TabsTrigger value="trending">
              <Star className="mr-2 h-4 w-4" /> Trending
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gainers">
            <CryptoTable coins={topGainers} />
          </TabsContent>
          <TabsContent value="losers">
            <CryptoTable coins={topLosers} />
          </TabsContent>
          <TabsContent value="trending">
            <CryptoTable coins={trending} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
