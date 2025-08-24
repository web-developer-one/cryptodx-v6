
'use client';

import { MoralisPageClient } from "@/components/moralis-page-client";
import { TradeNav } from "@/components/trade-nav";
import { useLanguage } from "@/hooks/use-language";
import { useEffect } from "react";

export default function MoralisPage() {
    const { t } = useLanguage();

    useEffect(() => {
        document.title = t('PageTitles.moralisSwap');
    }, [t]);

  return (
    <div className="container flex-1 flex flex-col items-center py-8">
      <div className="flex flex-col items-center w-full">
        <h1 className="text-3xl font-bold">Moralis Swap</h1>
        <div className="mt-6 w-full max-w-md">
            <TradeNav />
        </div>
      </div>
      <div className="mt-6 w-full">
        <MoralisPageClient />
      </div>
    </div>
  );
}
