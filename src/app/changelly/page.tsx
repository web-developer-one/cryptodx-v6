import { getLatestListings } from "@/lib/coinmarketcap";
import { ChangellyPageClient } from "@/components/changelly-page-client";

export default async function ChangellyPage() {
  const { data: cryptoData, error } = await getLatestListings();
  return <ChangellyPageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
