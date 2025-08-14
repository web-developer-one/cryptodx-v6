
'use client';

import { ChangellyPageClient } from "@/components/changelly-page-client";
import { TradeNav } from "@/components/trade-nav";
import { getLatestListings } from "@/lib/coinmarketcap";

// Note: This page now renders a server component that fetches data
// and passes it to the client component.
export default function ChangellyPage() {
  // Although the swap interface will fetch its own Changelly data,
  // we can still pass some initial data if needed, or handle errors.
  // For now, we'll keep it simple and let the client handle its own state.
  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      <ChangellyPageClient cryptoData={[]} error={null} />
    </div>
  );
}
