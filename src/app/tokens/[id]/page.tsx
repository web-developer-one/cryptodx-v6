
import { getLatestListings, getTokenDetails } from "@/lib/coinmarketcap";
import { KeyStatistics } from "@/components/token-details/key-statistics";
import { PriceChart } from "@/components/token-details/price-chart";
import { MarketHighlights } from "@/components/market-highlights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function TokenDetailPage({ params }: { params: { id: string } }) {
  const [token, allCryptos] = await Promise.all([
    getTokenDetails(params.id),
    getLatestListings()
  ]);

  if (!token) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive" />
              <span>Error</span>
            </CardTitle>
            <CardDescription>
              Could not load token data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              There was an issue fetching data for this token. It may not exist or
              there was an API error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredCryptos = allCryptos.filter(c => c.id !== token.id);

  return (
    <div className="container py-8 flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-bold">{token.name} ({token.symbol})</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <KeyStatistics token={token} />
        </div>
        <div className="lg:col-span-2">
          <PriceChart token={token} />
        </div>
      </div>
      
      {filteredCryptos.length > 0 && (
        <div>
          <MarketHighlights cryptocurrencies={filteredCryptos} />
        </div>
      )}
    </div>
  );
}
