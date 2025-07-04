import { getLatestListings } from "@/lib/coinmarketcap";
import { AddPoolPageClient } from "@/components/add-pool-page-client";

export default async function AddPoolsPage() {
    const { data: cryptoData, error } = await getLatestListings();
    return <AddPoolPageClient cryptoData={error ? [] : cryptoData} error={error} />;
}
