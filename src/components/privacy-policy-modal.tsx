
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

export function PrivacyPolicyModal() {
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
          {t('Footer.privacyPolicy')}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('PrivacyPolicyModal.title')}</DialogTitle>
          <DialogDescription>
            {t('PrivacyPolicyModal.lastUpdated').replace('{date}', currentDate)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t('PrivacyPolicyModal.p1')}</p>

            <h3 className="font-semibold text-foreground">{t('PrivacyPolicyModal.h_interpretation')}</h3>
            <p>{t('PrivacyPolicyModal.p_interpretation')}</p>

            <h3 className="font-semibold text-foreground">{t('PrivacyPolicyModal.h_definitions')}</h3>
            <p>{t('PrivacyPolicyModal.p_definitions')}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_account'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_company'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_cookies'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_country'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_device'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_personalData'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_service'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_serviceProvider'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_usageData'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_website'))} />
              <li dangerouslySetInnerHTML={renderHTML(t('PrivacyPolicyModal.li_you'))} />
            </ul>

            <h3 className="font-semibold text-foreground">{t('PrivacyPolicyModal.h_collecting')}</h3>
            <h4 className="font-medium text-foreground">{t('PrivacyPolicyModal.h_types')}</h4>
            <h5 className="font-normal text-foreground">{t('PrivacyPolicyModal.h_personalData')}</h5>
            <p>{t('PrivacyPolicyModal.p_personalData')}</p>
            <h5 className="font-normal text-foreground">{t('PrivacyPolicyModal.h_usageData')}</h5>
            <p>{t('PrivacyPolicyModal.p_usageData')}</p>
            
            <h3 className="font-semibold text-foreground">{t('PrivacyPolicyModal.h_contact')}</h3>
            <p>{t('PrivacyPolicyModal.p_contact')}</p>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">{t('PrivacyPolicyModal.dismiss')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
