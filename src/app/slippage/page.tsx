import { getLatestListings } from "@/lib/coinmarketcap";
import { SlippagePageClient } from "@/components/slippage-page-client";

export default async function SlippagePage() {
    const { data: cryptoData, error } = await getLatestListings();
    return <SlippagePageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
