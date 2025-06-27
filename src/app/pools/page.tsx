
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
import { PoolsTable } from "@/components/pools-table";
import type { Cryptocurrency, LiquidityPool } from "@/lib/types";

// Helper function to generate mock pool data
const generateMockPools = (cryptocurrencies: Cryptocurrency[]): LiquidityPool[] => {
    if (cryptocurrencies.length < 10) return [];

    const find = (symbol: string) => cryptocurrencies.find(c => c.symbol === symbol);
    
    const tokenPairs = [
        { s0: 'ETH', s1: 'USDC' },
        { s0: 'WBTC', s1: 'ETH' },
        { s0: 'SOL', s1: 'USDT' },
        { s0: 'MATIC', s1: 'USDC' },
        { s0: 'AVAX', s1: 'USDT' },
        { s0: 'LINK', s1: 'ETH' },
        { s0: 'UNI', s1: 'ETH' },
        { s0: 'DOGE', s1: 'USDT' },
    ];
    
    const networks = ['Ethereum', 'Solana', 'Polygon', 'Arbitrum'];

    return tokenPairs.map((pair, index) => {
        const token0 = find(pair.s0);
        const token1 = find(pair.s1);

        if (!token0 || !token1) return null;

        return {
            id: (index + 1).toString(),
            token0,
            token1,
            network: networks[index % networks.length],
            tvl: Math.random() * 50000000 + 10000000, // $10M - $60M
            volume24h: Math.random() * 5000000 + 1000000, // $1M - $6M
        };
    }).filter((p): p is LiquidityPool => p !== null);
};


export default async function PoolsListPage() {
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
  
  const mockPools = generateMockPools(cryptoData);

  return (
    <div className="container py-8">
      <ExploreNav />
      <div className="flex justify-between items-center my-6">
        <h1 className="text-3xl font-bold">Available Liquidity Pools</h1>
      </div>
      <PoolsTable pools={mockPools} />
    </div>
  );
}
