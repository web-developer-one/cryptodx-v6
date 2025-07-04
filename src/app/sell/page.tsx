import { getLatestListings } from "@/lib/coinmarketcap";
import { SellPageClient } from "@/components/sell-page-client";

export default async function SellPage() {
  const { data: cryptoData, error } = await getLatestListings();
  return <SellPageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
