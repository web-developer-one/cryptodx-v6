import { getLatestListings } from "@/lib/coinmarketcap";
import { PositionsPageClient } from "@/components/positions-page-client";

export default async function PositionsPage() {
    const { data: cryptoData, error } = await getLatestListings();
    return <PositionsPageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
