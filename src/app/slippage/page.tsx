import { SlippageInterface } from "@/components/slippage-interface";
import { getLatestListings } from "@/lib/coinmarketcap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function SlippagePage() {
  const cryptoData = await getLatestListings();

  if (!cryptoData || cryptoData.length === 0) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8">
        <Card className="w-full max-w-md">
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
              There was an issue fetching data from the CoinMarketCap API. Please
              check your API key or try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-2">Slippage Analysis & Simulation</h1>
        <p className="text-muted-foreground text-center mb-8">
            Understand and simulate the potential slippage for your trades.
        </p>
        <div className="flex justify-center">
            <SlippageInterface cryptocurrencies={cryptoData} />
        </div>
    </div>
  );
}
