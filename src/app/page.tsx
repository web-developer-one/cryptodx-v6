import { getLatestListings } from "@/lib/coinmarketcap";
import { HomePageClient } from "@/components/home-page-client";

interface HomeProps {
  searchParams?: {
    fromToken?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const { data: cryptoData, error } = await getLatestListings();
  return <HomePageClient cryptoData={error ? [] : cryptoData} error={error} fromTokenSymbol={searchParams?.fromToken} />;
}
