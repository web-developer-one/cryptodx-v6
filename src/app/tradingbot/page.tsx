
'use client';

import React, { useEffect } from "react";
import { ArbitrageInterface } from "@/components/arbitrage-interface";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ArbitragePageProps {
  cryptoData: Cryptocurrency[];
  error: string | null;
}

function ArbitragePageClient({ cryptoData, error }: ArbitragePageProps) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.tradingBot');
  }, [t]);

  if (error) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8">
        <ApiErrorCard error={error} context="Cryptocurrency Data" />
      </div>
    );
  }

  if (cryptoData.length === 0) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
        <div className="flex justify-center mt-8">
          <Skeleton className="h-[600px] w-full max-w-7xl" />
        </div>
      </div>
    );
  }

  return (
     <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-2">{t('ArbitragePage.title')}</h1>
        <p className="text-muted-foreground text-center mb-8">
            {t('ArbitragePage.description')}
        </p>
        <div className="flex justify-center">
            <ArbitrageInterface cryptocurrencies={cryptoData} />
        </div>
    </div>
  )
}


export default function ArbitragePage() {
    // This is not ideal, but for a demo we fetch the data directly on the page.
    // In a real app, this would be passed down or fetched via a dedicated hook.
    const [cryptoData, setCryptoData] = React.useState<Cryptocurrency[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        getLatestListings().then(({data, error}) => {
            setCryptoData(data);
            setError(error);
            setLoading(false);
        })
    }, [])

    if (loading) {
       return (
        <div className="container py-8">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
            <div className="flex justify-center mt-8">
            <Skeleton className="h-[600px] w-full max-w-7xl" />
            </div>
        </div>
        );
    }

    return <ArbitragePageClient cryptoData={cryptoData} error={error} />
}
