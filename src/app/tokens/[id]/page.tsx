
import { getTokenDetails } from "@/lib/coinmarketcap";
import { KeyStatistics } from "@/components/token-details/key-statistics";
import { PriceChart } from "@/components/token-details/price-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowDown, ArrowUp } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default async function TokenDetailPage({ params }: { params: { id: string } }) {
  const token = await getTokenDetails(params.id);

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

  return (
    <div className="container py-8 flex flex-col gap-8">
      <Card>
        <CardContent className="flex items-center justify-between p-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={token.logo || `https://placehold.co/48x48.png`}
              alt={`${token.name} logo`}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold">{token.name}</h1>
              <p className="text-muted-foreground">{token.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              ${token.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </p>
            <div
              className={cn(
                "flex items-center justify-end gap-1 text-sm font-medium",
                token.change24h >= 0 ? "text-primary" : "text-destructive"
              )}
            >
              {token.change24h >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span>{Math.abs(token.change24h).toFixed(2)}% (24h)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <KeyStatistics token={token} />
        </div>
        <div className="lg:col-span-2">
          <PriceChart token={token} />
        </div>
      </div>
    </div>
  );
}
