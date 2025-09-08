
import { getLatestListings } from "@/lib/coinmarketcap";
import { AddPoolPageClient } from "@/components/add-pool-page-client";

interface AddPoolsPageProps {
    searchParams?: {
        token0?: string;
        token1?: string;
    }
}

export default async function AddPoolsPage({ searchParams }: AddPoolsPageProps) {
    const { data: cryptoData, error } = await getLatestListings();
    return <AddPoolPageClient 
                cryptoData={error ? [] : cryptoData} 
                error={error}
                token0Symbol={searchParams?.token0}
                token1Symbol={searchParams?.token1}
            />;
}
