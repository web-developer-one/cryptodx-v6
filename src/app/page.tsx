import { Faq } from "@/components/faq";
import { HowToExchange } from "@/components/how-to-exchange";
import { MarketHighlights } from "@/components/market-highlights";
import { SwapInterface } from "@/components/swap-interface";
import { getLatestListings } from "@/lib/coinmarketcap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { TradeNav } from "@/components/trade-nav";

export default async function Home() {
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
    <div className="flex-1 flex flex-col items-center">
      <div className="container flex flex-col items-center py-8 gap-6">
        <TradeNav />
        <SwapInterface cryptocurrencies={cryptoData} />
      </div>

      <HowToExchange />

      <div className="container flex flex-col items-center py-8 gap-8">
        <div className="w-full max-w-7xl">
          <MarketHighlights cryptocurrencies={cryptoData} />
        </div>
      </div>
      
      <Faq />
    </div>
  );
}
