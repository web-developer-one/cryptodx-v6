'use client';

import { ExploreNav } from "@/components/explore-nav";
import { TransactionsClient } from "@/components/transactions-client";

export default function TransactionsPage() {
  return (
    <div className="container flex flex-col items-center py-8">
      <ExploreNav />
      <div className="w-full">
        <TransactionsClient />
      </div>
    </div>
  );
}
