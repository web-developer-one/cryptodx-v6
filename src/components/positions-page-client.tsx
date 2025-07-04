'use client';

import { ApiErrorCard } from "@/components/api-error-card";
import { YourPositions } from "@/components/your-positions";
import { PositionsNav } from "@/components/positions-nav";
import { useLanguage } from "@/hooks/use-language";
import type { Cryptocurrency } from "@/lib/types";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PositionsPageClientProps {
  cryptoData: Cryptocurrency[];
  error: string | null;
}

export function PositionsPageClient({ cryptoData, error }: PositionsPageClientProps) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.positions');
  }, [t]);

  const contentWidthClass = "w-full max-w-4xl";

  const renderContent = () => {
    if (error) {
      return (
        <div className="w-full max-w-md mt-6">
          <ApiErrorCard error={error} context="Cryptocurrency Data" />
        </div>
      );
    }
    
    if (cryptoData.length === 0) {
      return (
        <div className={`${contentWidthClass} mt-6`}>
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }
    
    return (
      <div className={contentWidthClass}>
        <YourPositions cryptocurrencies={cryptoData} />
      </div>
    );
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
