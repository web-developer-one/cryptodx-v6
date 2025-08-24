
'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { TradeNav } from "@/components/trade-nav";
import { MoralisSwapInterface } from "@/components/moralis-swap-interface";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";

interface SellPageClientProps {
  cryptoData: Cryptocurrency[];
  error: string | null;
}

export function SellPageClient({ cryptoData, error }: SellPageClientProps) {
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

    return <MoralisSwapInterface cryptocurrencies={cryptoData} />;
  };

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      {renderContent()}
    </div>
  );
}
