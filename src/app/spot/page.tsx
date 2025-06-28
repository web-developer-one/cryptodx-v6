
import { TradeNav } from "@/components/trade-nav";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export default function SpotPage() {
  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      <Card className="w-full max-w-md mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Hammer className="h-6 w-6" />
            <span>Spot Trading</span>
          </CardTitle>
          <CardDescription className="text-center">
            This feature is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            The spot trading interface is coming soon. Check back later!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
