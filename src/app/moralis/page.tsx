
import { getLatestListings } from "@/lib/coinmarketcap";
import { MoralisPageClient } from "@/components/moralis-page-client";
import { MoralisProvider } from "moralis";

const MORALIS_API_KEY = process.env.MORALIS_API_KEY || "";

export default async function MoralisPage() {
  const { data: cryptoData, error } = await getLatestListings();
  
  return (
    <MoralisProvider apiKey={MORALIS_API_KEY}>
      <MoralisPageClient cryptoData={error ? [] : cryptoData} error={error} />
    </MoralisProvider>
  );
}
