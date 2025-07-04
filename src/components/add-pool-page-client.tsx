'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { CreatePositionInterface } from "@/components/create-position-interface";
import { PositionsNav } from "@/components/positions-nav";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AddPoolPageClientProps {
  cryptoData: Cryptocurrency[];
  error: string | null;
}

export function AddPoolPageClient({ cryptoData, error }: AddPoolPageClientProps) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.addLiquidity');
  }, [t]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="w-full max-w-md mt-6">
          <ApiErrorCard error={error} context="Cryptocurrency Data" />
        </div>
      );
    }
    
    if (cryptoData.length === 0) {
      return <Skeleton className="h-[600px] w-full max-w-md" />;
    }
    
    return <CreatePositionInterface cryptocurrencies={cryptoData} />;
  };

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <div className="w-full max-w-md">
        <PositionsNav />
      </div>
      {renderContent()}
    </div>
  );
}
