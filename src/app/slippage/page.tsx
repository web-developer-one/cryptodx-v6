import { SlippageInterface } from "@/components/slippage-interface";
import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";

export default async function SlippagePage() {
  const { data: cryptoData, error } = await getLatestListings();

  if (error) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8">
        <ApiErrorCard error={error} context="Cryptocurrency Data" />
      </div>
    );
  }

  return (
    <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-2">Slippage Analysis & Simulation</h1>
        <p className="text-muted-foreground text-center mb-8">
            Understand and simulate the potential slippage for your trades.
        </p>
        <div className="flex justify-center">
            <SlippageInterface cryptocurrencies={cryptoData} />
        </div>
    </div>
  );
}
