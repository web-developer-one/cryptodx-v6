
'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { MoralisSwapInterface } from "@/components/moralis-swap-interface";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MoralisProvider } from "@moralisweb3/next";

interface MoralisPageClientProps {
  cryptoData: Cryptocurrency[];
  error: string | null;
}

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY || "";

export function MoralisPageClient({ cryptoData, error }: MoralisPageClientProps) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.moralis');
  }, [t]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="w-full max-w-md mt-6">
          <ApiErrorCard error={error} context="Cryptocurrency Data" />
        </div>
      );
    }
    
    if (cryptoData.length === 0 && !error) {
        return <Skeleton className="h-[480px] w-full max-w-md mt-6" />;
    }

    return <MoralisSwapInterface cryptocurrencies={cryptoData} />;
  }

  return (
    <MoralisProvider apiKey={MORALIS_API_KEY}>
        <div className="flex-1 flex flex-col items-center py-8 gap-6">
            {renderContent()}
        </div>
    </MoralisProvider>
  );
}
