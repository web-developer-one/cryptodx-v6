
import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { TradeNav } from "@/components/trade-nav";
import { BuyInterface } from "@/components/buy-interface";

export default async function BuyPage() {
  const { data: cryptoData, error } = await getLatestListings();

  if (error) {
    return (
      <div className="container flex-1 flex flex-col items-center py-8 gap-6">
        <TradeNav />
        <div className="w-full max-w-md mt-6">
            <ApiErrorCard error={error} context="Cryptocurrency Data" />
        </div>
      </div>
    );
  }

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      <BuyInterface cryptocurrencies={cryptoData} />
    </div>
  );
}
