
'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { MoralisSwapInterface } from "@/components/moralis-swap-interface";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TradeNav } from "./trade-nav";

interface ChangellyPageClientProps {
  cryptoData: Cryptocurrency[];
  error: string | null;
}

export function ChangellyPageClient({ cryptoData, error }: ChangellyPageClientProps) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.changelly');
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

    return <MoralisSwapInterface cryptocurrencies={cryptoData} />;
  };

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      <h1 className="text-3xl font-bold">Changelly Swap</h1>
      {renderContent()}
    </div>
  );
}
