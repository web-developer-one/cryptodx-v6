
import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { CreatePositionInterface } from "@/components/create-position-interface";
import { PositionsNav } from "@/components/positions-nav";

export default async function AddPoolsPage() {
  const { data: cryptoData, error } = await getLatestListings();

  if (error) {
    return (
      <div className="container flex-1 flex flex-col items-center py-8 gap-6">
        <div className="w-full max-w-md">
          <PositionsNav />
        </div>
        <div className="w-full max-w-md mt-6">
          <ApiErrorCard error={error} context="Cryptocurrency Data" />
        </div>
      </div>
    );
  }

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <div className="w-full max-w-md">
        <PositionsNav />
      </div>
      <CreatePositionInterface cryptocurrencies={cryptoData} />
    </div>
  );
}
