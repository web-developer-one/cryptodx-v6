import { TradeNav } from "@/components/trade-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SpotPage() {
  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      <Card className="w-full max-w-md mt-6">
        <CardHeader>
          <CardTitle>Spot Trading</CardTitle>
          <CardDescription>
            Buy and sell crypto at the current market rate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center pt-6">
            The spot trading interface is coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
