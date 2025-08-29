

'use client';

import { MoralisPageClient } from "@/components/moralis-page-client";
import { TradeNav } from "@/components/trade-nav";
import { useLanguage } from "@/hooks/use-language";
import { useEffect } from "react";
import { FloatingTokensBackground } from "@/components/floating-tokens-background";
import { HomePageClient } from "@/components/home-page-client";
import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { HowToExchange } from "@/components/how-to-exchange";
import { Faq } from "@/components/faq";
import { UkDisclaimer } from "@/components/uk-disclaimer";
import { MoralisSwapInterface } from "@/components/moralis-swap-interface";
import { Skeleton } from "@/components/ui/skeleton";
import type { Cryptocurrency } from "@/lib/types";

// This component now effectively replaces the old HomePageClient
function MoralisContent({ cryptoData, error }: { cryptoData: Cryptocurrency[], error: string | null}) {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('PageTitles.home');
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
    <div className="flex-1 flex flex-col">
       <div className="flex-1 flex flex-col relative overflow-hidden">
        <FloatingTokensBackground />
        <div className="container flex-1 flex flex-col items-center py-8 gap-6 relative">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-headline font-bold tracking-tighter">
                {t('HomePage.title')}
            </h1>
            <p className="max-w-2xl text-muted-foreground text-sm sm:text-base md:text-xl">
                {t('HomePage.subtitle')}
            </p>
          </div>
          <div className="w-full max-w-md flex flex-col items-center gap-6">
              <TradeNav />
              <MoralisSwapInterface cryptocurrencies={cryptoData} />
          </div>
        </div>
      </div>
      <HowToExchange />
      <Faq />
      <UkDisclaimer />
    </div>
  );
}


export default function MoralisPage() {
    const { t } = useLanguage();
    const [tokens, setTokens] = React.useState<Cryptocurrency[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        document.title = t('PageTitles.home');
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

    if (isLoading) {
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
    
  return <MoralisContent cryptoData={tokens} error={error} />;
}
