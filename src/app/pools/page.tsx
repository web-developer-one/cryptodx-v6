'use client';

import { ExploreNav } from "@/components/explore-nav";
import { PoolsClient } from "@/components/pools-client";

export default function PoolsListPage() {
  return (
    <div className="container flex flex-col items-center py-8">
      <ExploreNav />
      <div className="w-full">
        <PoolsClient />
      </div>
    </div>
  );
}
