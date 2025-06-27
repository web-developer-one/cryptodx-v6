import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeNav } from "@/components/trade-nav";

export default function SellPage() {
  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Sell
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is under construction. Fiat off-ramp services will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
