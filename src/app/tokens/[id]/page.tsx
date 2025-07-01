
import { getTokenDetails } from "@/lib/coinmarketcap";
import { KeyStatistics } from "@/components/token-details/key-statistics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowDown, ArrowUp, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PriceChart } from "@/components/token-details/price-chart";
import { Button } from "@/components/ui/button";

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

  // The API doesn't provide 24h high/low, so let's simulate it for visual purposes
  if (token.low24h === null) {
    token.low24h = token.price * (1 - Math.abs(token.change24h / 100) * (Math.random() * 0.5 + 0.8));
  }
  if (token.high24h === null) {
      token.high24h = token.price * (1 + Math.abs(token.change24h / 100) * (Math.random() * 0.5 + 0.8));
  }

  return (
    <div className="container py-8 flex flex-col gap-6">
      <div>
        <Link href="/tokens" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tokens
          </Button>
        </Link>
      </div>
      <div className="border bg-card p-6 rounded-lg shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Image
            src={token.logo || `https://placehold.co/64x64.png`}
            alt={`${token.name} logo`}
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold">{token.name}</h1>
            <p className="text-lg text-muted-foreground">{token.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">
            ${token.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </p>
          <div
            className={cn(
              "flex items-center justify-end gap-1 text-base font-medium",
              token.change24h >= 0 ? "text-green-500" : "text-destructive"
            )}
          >
            {token.change24h >= 0 ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
            <span>{Math.abs(token.change24h).toFixed(2)}% (24h)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
