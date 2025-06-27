import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";
import { ExploreNav } from "@/components/explore-nav";

export default function PoolsPage() {
  return (
    <div className="container py-8">
      <ExploreNav />
      <div className="flex flex-col items-center justify-center">
        <Card className="w-full max-w-md mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass />
              <span>Explore Pools</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page is under construction. Check back later to discover and manage liquidity pools.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
