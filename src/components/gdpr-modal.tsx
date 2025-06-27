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

export function GdprModal() {
  const [isOpen, setIsOpen] = useState(false);

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
        className="rounded-t-lg sm:max-w-lg sm:bottom-8 sm:right-8 sm:left-auto sm:rounded-lg"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Our Commitment to Your Privacy (GDPR)</SheetTitle>
        </SheetHeader>
        <div className="py-4 text-sm text-muted-foreground space-y-4">
          <p>
            We value your privacy and are committed to protecting your personal
            data in compliance with GDPR.
          </p>
          <p>
            Under GDPR, you have rights regarding your personal data, including
            the right to access, correct, delete, or restrict its processing.
            You also have the right to data portability and to object to
            processing under certain conditions. By continuing to use our site,
            you acknowledge that you have read and understood our practices.
            For detailed information, please review our full Privacy Policy.
          </p>
        </div>
        <SheetFooter className="pt-4 border-t">
            <Button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto"
            >
              Dismiss and Close
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}