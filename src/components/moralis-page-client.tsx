
'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { MoralisSwapInterface } from "@/components/moralis-swap-interface";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TradeNav } from "./trade-nav";

export function MoralisPageClient() {
  const { t } = useLanguage();
  const [tokens, setTokens] = useState<Cryptocurrency[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = t('PageTitles.moralisSwap');
  }, [t]);

  useEffect(() => {
    async function fetchTokens() {
        try {
            const response = await fetch('/api/listings');
            const { data, error: apiError } = await response.json();
            if (apiError) {
                setError(apiError);
            } else {
                setTokens(data);
            }
        } catch (e) {
            setError('API_FETCH_FAILED');
        } finally {
            setIsLoading(false);
        }
    }
    fetchTokens();
  }, []);

  const renderContent = () => {
    if (isLoading) {
        return <Skeleton className="h-[480px] w-full max-w-md mt-6" />;
    }
    if (error) {
      return (
        <div className="w-full max-w-md mt-6">
          <ApiErrorCard error={error} context="Moralis Token Data" />
        </div>
      );
    }
    
    return <MoralisSwapInterface cryptocurrencies={tokens} />;
  };

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      {renderContent()}
    </div>
  );
}
