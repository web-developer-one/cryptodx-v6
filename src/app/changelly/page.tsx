
'use client';

import { TradeNav } from "@/components/trade-nav";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";

export default function ChangellyPage() {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('PageTitles.changelly');
  }, [t]);

  const widgetUrl = "https://widget.changelly.com?from=*&to=*&amount=0.1&address=&fromDefault=btc&toDefault=eth&merchant_id=9ZJKwWl1A23lMd36&payment_id=&v=3";

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <div className="w-full max-w-lg flex justify-center">
        <TradeNav />
      </div>
      <div className="w-full max-w-lg flex-1">
          <iframe
              src={widgetUrl}
              width="100%"
              height="600px"
              frameBorder="0"
              allow="camera"
          >Cant load widget</iframe>
      </div>
    </div>
  );
}
