'use client';

import { SlippageInterface } from "@/components/slippage-interface";
import { ApiErrorCard } from "@/components/api-error-card";
import { useLanguage } from "@/hooks/use-language";
import { useEffect } from "react";
import type { Cryptocurrency } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface SlippagePageClientProps {
    cryptoData: Cryptocurrency[];
    error: string | null;
}

export function SlippagePageClient({ cryptoData, error }: SlippagePageClientProps) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.slippage');
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
        <h1 className="text-3xl font-bold text-center mb-2">{t('SlippagePage.title')}</h1>
        <p className="text-muted-foreground text-center mb-8">
            {t('SlippagePage.description')}
        </p>
        <div className="flex justify-center">
            <SlippageInterface cryptocurrencies={cryptoData} />
        </div>
    </div>
  );
}
