import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownToLine } from "lucide-react";
import { TradeNav } from "@/components/trade-nav";

export default function BuyPage() {
  return (
    <div className="container flex-1 flex flex-col items-center py-8">
      <TradeNav />
      <Card className="w-full max-w-md mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine />
            <span>Buy Crypto</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is under construction. Fiat on-ramp services will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
