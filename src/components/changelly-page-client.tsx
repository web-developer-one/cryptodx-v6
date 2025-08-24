
'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { MoralisSwapInterface } from "@/components/moralis-swap-interface";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
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
    
    if (cryptoData.length === 0) {
      return <Skeleton className="h-[480px] w-full max-w-md mt-6" />;
    }

    return <MoralisSwapInterface cryptocurrencies={cryptoData} />;
  };

  return (
    <>
      {renderContent()}
    </>
  );
}
