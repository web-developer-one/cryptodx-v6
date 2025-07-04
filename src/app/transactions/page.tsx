
import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { ExploreNav } from "@/components/explore-nav";
import { TransactionsClient } from "@/components/transactions-client";

export default async function TransactionsPage() {
  const { data: cryptoData, error } = await getLatestListings();

  if (error) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8">
        <ExploreNav />
        <div className="w-full max-w-lg mt-6">
          <ApiErrorCard error={error} context="Cryptocurrency Data" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container flex flex-col items-center py-8">
      <ExploreNav />
      <div className="w-full">
        <TransactionsClient cryptocurrencies={cryptoData} />
      </div>
    </div>
  );
}
