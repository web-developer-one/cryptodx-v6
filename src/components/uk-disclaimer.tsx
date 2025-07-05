'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export function UkDisclaimer() {
  const { t } = useLanguage();

  return (
    <section className="w-full py-8 bg-muted/50 border-t">
      <div className="container max-w-5xl px-4 md:px-6 flex items-start gap-4">
        <Info className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          {t('UkDisclaimer.panelText')}
          {' '}
          <Dialog>
            <DialogTrigger asChild>
              <button className="inline-block text-primary underline hover:text-primary/80">
                {t('UkDisclaimer.readMore')}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{t('UkDisclaimer.modalTitle')}</DialogTitle>
              </DialogHeader>
              <div className="py-4 text-sm text-muted-foreground">
                <p>{t('UkDisclaimer.modalBody')}</p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button">{t('UkDisclaimer.modalButton')}</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </p>
      </div>
    </section>
  );
}
