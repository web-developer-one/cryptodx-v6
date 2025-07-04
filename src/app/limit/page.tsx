import { getLatestListings } from "@/lib/coinmarketcap";
import { LimitPageClient } from "@/components/limit-page-client";

export default async function LimitPage() {
  const { data: cryptoData, error } = await getLatestListings();
  return <LimitPageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
