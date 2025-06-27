import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";

export default function LimitPage() {
  return (
    <div className="container flex-1 flex flex-col items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge />
            <span>Limit Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is under construction. Set limit orders for your trades here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
