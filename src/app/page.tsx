import { getLatestListings } from "@/lib/coinmarketcap";
import { HomePageClient } from "@/components/home-page-client";

export default async function Home() {
  // This is now the main page for the swap interface.
  const { data: cryptoData, error } = await getLatestListings();
  return <HomePageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
