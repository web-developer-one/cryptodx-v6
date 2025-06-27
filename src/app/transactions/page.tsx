import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { ExploreNav } from "@/components/explore-nav";

export default function TransactionsPage() {
  return (
    <div className="container py-8">
      <ExploreNav />
      <div className="flex flex-col items-center justify-center">
        <Card className="w-full max-w-md mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History />
              <span>Recent Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page is under construction. Transaction history will be available here soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
