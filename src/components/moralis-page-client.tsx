'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { MoralisSwapInterface } from "@/components/moralis-swap-interface";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
            const response = await fetch('/api/moralis/tokens');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch tokens from Moralis');
            }
            const data = await response.json();
            setTokens(data);
        } catch (e: any) {
            setError(e.message);
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
      {renderContent()}
    </div>
  );
}
