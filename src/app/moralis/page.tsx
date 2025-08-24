
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
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
        <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold">Moralis Swap</h1>
        </div>
        <TradeNav />
        <MoralisPageClient />
    </div>
  );
}
