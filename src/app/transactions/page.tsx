
import { getLatestListings } from "@/lib/coinmarketcap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ExploreNav } from "@/components/explore-nav";
import type { Cryptocurrency, Transaction } from "@/lib/types";
import { TransactionsClient } from "@/components/transactions-client";

// Helper function to generate mock transaction data
const generateMockTransactions = (cryptocurrencies: Cryptocurrency[]): Transaction[] => {
    if (cryptocurrencies.length < 10) return [];
    const find = (symbol: string) => cryptocurrencies.find(c => c.symbol === symbol);

    const txs: Omit<Transaction, 'id' | 'timestamp' | 'account'>[] = [];
    const types: Transaction['type'][] = ['Swap', 'Add', 'Remove'];

    for (let i = 0; i < 20; i++) {
        const type = types[i % 3];
        const tokenA = cryptocurrencies[i % cryptocurrencies.length];
        const tokenB = cryptocurrencies[(i + 5) % cryptocurrencies.length];

        if (tokenA.id === tokenB.id) continue;

        let token0, token1, amount0, amount1, value;

        if (type === 'Swap') {
            token0 = tokenA;
            token1 = tokenB;
            amount0 = Math.random() * 10;
            amount1 = (amount0 * token0.price) / token1.price;
            value = amount0 * token0.price;
        } else { // Add or Remove
            token0 = find('ETH') || tokenA;
            token1 = find('USDC') || tokenB;
            amount0 = Math.random() * 5;
            amount1 = (amount0 * token0.price) / token1.price;
            value = (amount0 * token0.price) * 2;
        }

        if (token0 && token1) {
            txs.push({ type, token0, token1, amount0, amount1, value });
        }
    }
    
    return txs.map((tx, index) => ({
        ...tx,
        id: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        account: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        timestamp: new Date(Date.now() - (index * 1000 * 60 * (Math.random() * 10 + 5))), // 5-15 mins apart
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};


export default async function TransactionsPage() {
  const cryptoData = await getLatestListings();

  if (!cryptoData || cryptoData.length === 0) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8">
        <ExploreNav />
        <Card className="w-full max-w-md mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive" />
              <span>Error</span>
            </CardTitle>
            <CardDescription>
              Could not load cryptocurrency data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              There was an issue fetching data from the CoinMarketCap API.
              Please check your API key or try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const mockTransactions = generateMockTransactions(cryptoData);

  return (
    <div className="container py-8">
      <ExploreNav />
      <TransactionsClient transactions={mockTransactions} cryptocurrencies={cryptoData} />
    </div>
  );
}
