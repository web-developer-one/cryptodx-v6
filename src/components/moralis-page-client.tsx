
'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { MoralisSwapInterface } from "@/components/moralis-swap-interface";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface MoralisPageClientProps {
  cryptoData: Cryptocurrency[];
  error: string | null;
}

export function MoralisPageClient({ cryptoData, error }: MoralisPageClientProps) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.moralis');
  }, [t]);

  if (error && cryptoData.length === 0) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8 gap-6">
        <ApiErrorCard error={error} context="Cryptocurrency Data" />
      </div>
    );
  }

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
    <div className="flex-1 flex flex-col items-center py-8 gap-6">
        <MoralisSwapInterface cryptocurrencies={cryptoData} />
    </div>
  );
}
