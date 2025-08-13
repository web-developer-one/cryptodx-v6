
'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { TradeNav } from "@/components/trade-nav";
import { ChangellySwapInterface } from "@/components/changelly-swap-interface";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";

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
    
    // We pass no props now, as the component fetches its own data
    return <ChangellySwapInterface />;
  };

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      {renderContent()}
    </div>
  );
}
