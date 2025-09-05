import { getLatestListings } from "@/lib/coinmarketcap";
import { BuyPageClient } from "@/components/buy-page-client";

interface BuyPageProps {
  searchParams?: {
    token?: string;
  };
}

export default async function BuyPage({ searchParams }: BuyPageProps) {
  const { data: cryptoData, error } = await getLatestListings();
  return <BuyPageClient cryptoData={error ? [] : cryptoData} error={error} selectedTokenSymbol={searchParams?.token} />;
}
