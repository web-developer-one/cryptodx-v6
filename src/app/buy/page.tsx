import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownToLine } from "lucide-react";

export default function BuyPage() {
  return (
    <div className="container flex-1 flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-md">
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
