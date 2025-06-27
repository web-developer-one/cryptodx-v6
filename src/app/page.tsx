import { MarketHighlights } from "@/components/market-highlights";
import { SwapInterface } from "@/components/swap-interface";

export default function Home() {
  return (
    <div className="container flex-1 flex flex-col items-center justify-center py-8 gap-8">
      <SwapInterface />
      <MarketHighlights />
    </div>
  );
}
