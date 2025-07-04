import { getLatestListings } from "@/lib/coinmarketcap";
import { BuyPageClient } from "@/components/buy-page-client";

export default async function BuyPage() {
  const { data: cryptoData, error } = await getLatestListings();
  return <BuyPageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
