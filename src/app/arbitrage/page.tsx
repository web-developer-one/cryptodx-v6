
import { getLatestListings } from "@/lib/coinmarketcap";
import { ArbitragePageClient } from "@/components/arbitrage-page-client";

export default async function ArbitragePage() {
    const { data: cryptoData, error } = await getLatestListings();
    return <ArbitragePageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
