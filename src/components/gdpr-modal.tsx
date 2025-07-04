'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

export function GdprModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // This effect runs only on the client-side to avoid hydration mismatch
    // by accessing localStorage.
    const gdprDismissed = localStorage.getItem('gdpr_consent_dismissed');
    if (!gdprDismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('gdpr_consent_dismissed', 'true');
    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // If the sheet is closed by any means (button, overlay click, Esc)
      // we mark it as dismissed permanently.
      handleDismiss();
    } else {
        setIsOpen(open);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-lg sm:max-w-5xl sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 sm:rounded-lg"
      >
        <SheetHeader className="text-left">
          <SheetTitle>{t('GdprModal.title')}</SheetTitle>
        </SheetHeader>
        <div className="py-4 text-sm text-muted-foreground space-y-4">
          <p>
            {t('GdprModal.body1')}
          </p>
          <p>
            {t('GdprModal.body2')}
          </p>
        </div>
        <SheetFooter className="pt-4 border-t">
            <Button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto"
            >
              {t('GdprModal.dismiss')}
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
