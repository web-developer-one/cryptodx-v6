
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

export function TermsOfUseModal() {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set date on client to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-primary-foreground/80 transition-colors hover:text-primary-foreground text-sm">
          {t('Footer.termsOfUse')}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('TermsOfUseModal.title')}</DialogTitle>
          <DialogDescription>
             {t('TermsOfUseModal.lastUpdated').replace('{date}', currentDate)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t('TermsOfUseModal.p1')}</p>

            <h3 className="font-semibold text-foreground">{t('TermsOfUseModal.h_agreement')}</h3>
            <p>{t('TermsOfUseModal.p_agreement')}</p>

            <h3 className="font-semibold text-foreground">{t('TermsOfUseModal.h_eligibility')}</h3>
            <p>{t('TermsOfUseModal.p_eligibility')}</p>

            <h3 className="font-semibold text-foreground">{t('TermsOfUseModal.h_service')}</h3>
            <p>{t('TermsOfUseModal.p_service')}</p>
            
            <h3 className="font-semibold text-foreground">{t('TermsOfUseModal.h_prohibited')}</h3>
            <p>{t('TermsOfUseModal.p_prohibited')}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t('TermsOfUseModal.li_illegal')}</li>
              <li>{t('TermsOfUseModal.li_disrupt')}</li>
              <li>{t('TermsOfUseModal.li_circumvent')}</li>
              <li>{t('TermsOfUseModal.li_automated')}</li>
            </ul>

            <h3 className="font-semibold text-foreground">{t('TermsOfUseModal.h_disclaimers')}</h3>
            <p>{t('TermsOfUseModal.p_disclaimers')}</p>
            
            <h3 className="font-semibold text-foreground">{t('TermsOfUseModal.h_liability')}</h3>
             <p>{t('TermsOfUseModal.p_liability')}</p>

            <h3 className="font-semibold text-foreground">{t('TermsOfUseModal.h_governing')}</h3>
            <p>{t('TermsOfUseModal.p_governing')}</p>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">{t('TermsOfUseModal.dismiss')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
