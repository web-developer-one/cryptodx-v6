
'use client';

import { MoralisPageClient } from "@/components/moralis-page-client";
import { useLanguage } from "@/hooks/use-language";
import { useEffect } from "react";

export default function MoralisPage() {
    const { t } = useLanguage();

    useEffect(() => {
        document.title = t('PageTitles.moralisSwap');
    }, [t]);

  return (
    <div className="container flex-1 flex flex-col items-center justify-center py-8">
      <h1 className="text-3xl font-bold mb-6">Moralis Swap</h1>
      <MoralisPageClient />
    </div>
  );
}
