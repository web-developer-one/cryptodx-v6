
import { getLatestListings } from "@/lib/coinmarketcap";
import { HomePageClient } from "@/components/home-page-client";

export default async function Home() {
  const { data: cryptoData, error } = await getLatestListings();
  return <HomePageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
