import { getLatestListings } from "@/lib/coinmarketcap";
import { ChangellyPageClient } from "@/components/changelly-page-client";
import { TradeNav } from "@/components/trade-nav";
import { FloatingTokensBackground } from "@/components/floating-tokens-background";

export default async function ChangellyPage() {
  const { data: cryptoData, error } = await getLatestListings();
  return (
    <div className="flex-1 flex flex-col relative">
      <FloatingTokensBackground />
      <div className="container flex-1 flex flex-col items-center py-8 gap-6 relative z-10">
        <h1 className="text-3xl font-bold">Changelly Swap</h1>
        <TradeNav />
        <ChangellyPageClient cryptoData={error ? [] : cryptoData} error={error} />
      </div>
    </div>
  );
}
