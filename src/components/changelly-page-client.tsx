
'use client';

import { TradeNav } from "@/components/trade-nav";
import { ChangellySwapInterface } from "@/components/changelly-swap-interface";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";

export function ChangellyPageClient() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.changelly');
  }, [t]);

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      <ChangellySwapInterface />
    </div>
  );
}
