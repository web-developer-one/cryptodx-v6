'use client';

import { TokenExplorer } from "@/components/token-explorer";
import { ExploreNav } from "@/components/explore-nav";

export default function TokensPage() {
  return (
    <div className="container flex flex-col items-center py-8">
      <ExploreNav />
      <div className="mt-6 w-full">
        <TokenExplorer />
      </div>
    </div>
  );
}
