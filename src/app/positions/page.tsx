
import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { YourPositions } from "@/components/your-positions";
import { PositionsNav } from "@/components/positions-nav";

export default async function PositionsPage() {
  const { data: cryptoData, error } = await getLatestListings();
  const contentWidthClass = "w-full max-w-4xl";

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
      <div className={contentWidthClass}>
        <YourPositions cryptocurrencies={cryptoData} />
      </div>
    </div>
  );
}
