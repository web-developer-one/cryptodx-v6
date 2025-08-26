
'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { ArbitrageInterface } from "@/components/arbitrage-interface";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ArbitragePageClientProps {
  cryptoData: Cryptocurrency[];
  error: string | null;
}

export function ArbitragePageClient({ cryptoData, error }: ArbitragePageClientProps) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.arbitrage');
  }, [t]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="w-full max-w-7xl mt-6">
          <ApiErrorCard error={error} context="Cryptocurrency Data" />
        </div>
      );
    }
    
    if (cryptoData.length === 0) {
      return <Skeleton className="h-[600px] w-full max-w-7xl mt-6" />;
    }

    return <ArbitrageInterface cryptocurrencies={cryptoData} />;
  };

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
        <div className="text-center">
            <h1 className="text-3xl font-bold">{t('ArbitragePage.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('ArbitragePage.description')}</p>
        </div>
      {renderContent()}
    </div>
  );
}
