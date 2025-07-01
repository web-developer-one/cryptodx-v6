
import { getTokenDetails } from "@/lib/coinmarketcap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { TokenDetailClient } from "@/components/token-details/token-detail-client";

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
    <div className="container py-8 flex flex-col gap-6">
      <TokenDetailClient initialToken={token} />
    </div>
  );
}
