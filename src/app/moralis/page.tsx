
'use client';

import { MoralisPageClient } from "@/components/moralis-page-client";
import { TradeNav } from "@/components/trade-nav";
import { useLanguage } from "@/hooks/use-language";
import { useEffect } from "react";
import { FloatingTokensBackground } from "@/components/floating-tokens-background";

export default function MoralisPage() {
    const { t } = useLanguage();

    useEffect(() => {
        document.title = t('PageTitles.moralisSwap');
    }, [t]);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
        <FloatingTokensBackground />
        <div className="container flex-1 flex flex-col items-center py-8 gap-6 z-10">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold">Moralis Swap</h1>
            </div>
            <TradeNav />
            <MoralisPageClient />
        </div>
    </div>
  );
}
