
import { getLatestListings } from "@/lib/coinmarketcap";
import { MoralisPageClient } from "@/components/moralis-page-client";

export default async function MoralisPage() {
  const { data: cryptoData, error } = await getLatestListings();
  
  return (
    <MoralisPageClient cryptoData={error ? [] : cryptoData} error={error} />
  );
}
