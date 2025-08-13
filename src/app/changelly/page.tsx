
'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent } from '@/components/ui/card';

export default function ChangellyPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.changelly');
  }, [t]);

  const widgetUrl = "https://widget.changelly.com?from=btc&to=eth&amount=0.1&address=&fromDefault=btc&toDefault=eth&merchant_id=9ZJKwWl1A23lMd36&payment_id=&v=3";

  return (
    <div className="container flex-1 flex flex-col items-center py-8">
      <Card className="w-full h-[650px] max-w-lg shadow-2xl overflow-hidden">
        <CardContent className="p-0 h-full">
          <iframe
            src={widgetUrl}
            width="100%"
            height="100%"
            frameBorder="none"
            className="h-full"
            allow="camera"
            title="Changelly Widget"
          />
        </CardContent>
      </Card>
    </div>
  );
}
