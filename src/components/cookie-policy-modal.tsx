'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

export function CookiePolicyModal() {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set date on client to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const renderHTML = (str: string) => {
    return { __html: str };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-primary-foreground/80 transition-colors hover:text-primary-foreground text-sm">
          {t('Footer.cookiePolicy')}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('CookiePolicyModal.title')}</DialogTitle>
          <DialogDescription>
            {t('CookiePolicyModal.lastUpdated').replace('{date}', currentDate)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              {t('CookiePolicyModal.p1')}
            </p>

            <h3 className="font-semibold text-foreground">{t('CookiePolicyModal.h_whatAre')}</h3>
            <p>
              {t('CookiePolicyModal.p_whatAre1')}
            </p>
            <p>
              {t('CookiePolicyModal.p_whatAre2')}
            </p>

            <h3 className="font-semibold text-foreground">{t('CookiePolicyModal.h_whyUse')}</h3>
            <p>
             {t('CookiePolicyModal.p_whyUse')}
            </p>

            <h3 className="font-semibold text-foreground">{t('CookiePolicyModal.h_types')}</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li dangerouslySetInnerHTML={renderHTML(t('CookiePolicyModal.li_necessary'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('CookiePolicyModal.li_performance'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('CookiePolicyModal.li_analytics'))} />
            </ul>

            <h3 className="font-semibold text-foreground">{t('CookiePolicyModal.h_choices')}</h3>
            <p>
              {t('CookiePolicyModal.p_choices')}
            </p>
            
            <h3 className="font-semibold text-foreground">{t('CookiePolicyModal.h_changes')}</h3>
             <p>
              {t('CookiePolicyModal.p_changes')}
            </p>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">{t('CookiePolicyModal.dismiss')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
