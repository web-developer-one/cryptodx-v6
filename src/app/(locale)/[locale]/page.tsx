
import { getLatestListings } from "@/lib/coinmarketcap";
import { HomePageClient } from "@/components/home-page-client";

// This page handles the root URL for a given locale, e.g., /en or /es
export default async function LocaleHomePage() {
  const { data: cryptoData, error } = await getLatestListings();
  return <HomePageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
