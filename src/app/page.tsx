
'use client';

import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { SwapInterface } from "@/components/swap-interface";
import { HowToExchange } from "@/components/how-to-exchange";
import { Faq } from "@/components/faq";
import { TradeNav } from "@/components/trade-nav";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Server-side fetching within a client component requires this pattern
function useCryptoData() {
  const [data, setData] = useState<{ cryptoData: Cryptocurrency[]; error: string | null }>({ cryptoData: [], error: null });

  useEffect(() => {
    async function fetchData() {
      const { data: cryptoData, error } = await getLatestListings();
      setData({ cryptoData: error ? [] : cryptoData, error });
    }
    fetchData();
  }, []);

  return data;
}

export default function Home() {
  // Using a hook to fetch data on the client to allow the page to be a client component
  const { cryptoData, error } = useCryptoData();
  const { t } = useLanguage();

  if (error && cryptoData.length === 0) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8 gap-6">
        <ApiErrorCard error={error} context="Cryptocurrency Data" />
      </div>
    );
  }

  // Show a loading state or skeleton while fetching
  if (!error && cryptoData.length === 0) {
      return (
         <div className="flex-1 flex flex-col items-center gap-8 pt-8 md:pt-12">
            <div className="container flex flex-col items-center gap-4 text-center">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-7 w-1/2 mt-2" />
            </div>
            <div className="container flex flex-col items-center gap-6">
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-[480px] w-full max-w-md" />
            </div>
         </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-8 pt-8 md:pt-12">
      <div className="container flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tighter">
            {t('HomePage.title')}
        </h1>
        <p className="max-w-2xl text-muted-foreground md:text-xl">
            {t('HomePage.subtitle')}
        </p>
      </div>
      <div className="container flex flex-col items-center gap-6">
          <TradeNav />
          <SwapInterface cryptocurrencies={cryptoData} />
      </div>
      <HowToExchange />
      <Faq />
    </div>
  );
}
