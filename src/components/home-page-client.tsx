
'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { HowToExchange } from "@/components/how-to-exchange";
import { Faq } from "@/components/faq";
import { TradeNav } from "@/components/trade-nav";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UkDisclaimer } from "@/components/uk-disclaimer";
import { MoralisSwapInterface } from "./moralis-swap-interface";
import { FloatingTokensBackground } from "./floating-tokens-background";

interface HomePageClientProps {
  cryptoData: Cryptocurrency[];
  error: string | null;
}

export function HomePageClient({ cryptoData, error }: HomePageClientProps) {
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
            <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tighter">
                {t('HomePage.title')}
            </h1>
            <p className="max-w-2xl text-muted-foreground md:text-xl">
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
