'use client';

import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { TradeNav } from "@/components/trade-nav";
import { SellInterface } from "@/components/sell-interface";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function SellPage() {
  const { cryptoData, error } = useCryptoData();
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.sell');
  }, [t]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="w-full max-w-md mt-6">
          <ApiErrorCard error={error} context="Cryptocurrency Data" />
        </div>
      );
    }
    
    if (cryptoData.length === 0) {
      return <Skeleton className="h-[480px] w-full max-w-md mt-6" />;
    }

    return <SellInterface cryptocurrencies={cryptoData} />;
  };

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      {renderContent()}
    </div>
  );
}
