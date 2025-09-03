
'use client';

import { TradeNav } from "@/components/trade-nav";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { ChangellyC2CInterface } from "@/components/changelly-c2c-interface";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export default function ChangellyPage() {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('PageTitles.changelly');
  }, [t]);

  return (
    <div className="container flex-1 flex flex-col items-center py-8 gap-6">
      <div className="w-full max-w-lg flex justify-center">
        <TradeNav />
      </div>
      <div className="flex-1 flex justify-center">
          <ChangellyC2CInterface />
      </div>
      <div className="w-full max-w-lg mt-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-xl font-bold">C2C API Integration Guide</AccordionTrigger>
            <AccordionContent className="space-y-4 text-muted-foreground">
              <p>
                This guide is designed for partners who are looking to integrate Changelly's Crypto-to-Crypto (C2C) API into their platforms, especially tailored for crypto wallets, crypto exchange services, and emerging projects with limited resources.
              </p>
              <p>
                The purpose of this guide is to provide clear, practical instructions and best practices for seamless API integration.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
