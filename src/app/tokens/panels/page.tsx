'use client';

import { TokenPanels } from "@/components/token-panels";
import { ExploreNav } from "@/components/explore-nav";

export default function TokensPanelPage() {
  return (
    <div className="container flex flex-col items-center py-8">
      <ExploreNav />
      <div className="mt-6 w-full">
        <TokenPanels />
      </div>
    </div>
  );
}
