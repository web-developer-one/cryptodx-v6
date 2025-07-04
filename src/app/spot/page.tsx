
'use client';

import { TradeNav } from "@/components/trade-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useEffect } from "react";

export default function SpotPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.spot');
  }, [t]);

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <TradeNav />
      <Card className="w-full max-w-md mt-6">
        <CardHeader>
          <CardTitle>{t('SpotPage.title')}</CardTitle>
          <CardDescription>
            {t('SpotPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center pt-6">
            {t('SpotPage.comingSoon')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
