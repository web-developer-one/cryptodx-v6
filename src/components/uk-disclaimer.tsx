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

export function UkDisclaimer() {
  const disclaimerText = "The CryptoMx web application is made available as a tool for users to engage with it at their own discretion. It does not constitute an endorsement or recommendation of cryptocurrency trading activities. CryptoMx does not advise or encourage users or prospective users to participate in cryptoasset trading, and the content of this website should not be interpreted as a recommendation, solicitation, or inducement to engage in such activities.";
  const panelText = disclaimerText.split('.')[0] + '. ';

  return (
    <section className="w-full py-8 bg-muted/50 border-t">
      <div className="container max-w-5xl px-4 md:px-6 flex items-center gap-4">
        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          UK disclaimer: {panelText}
          <Dialog>
            <DialogTrigger asChild>
              <button className="inline-block text-primary underline hover:text-primary/80 ml-1">
                Read more...
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Disclaimer for UK residents</DialogTitle>
              </DialogHeader>
              <div className="py-4 text-sm text-muted-foreground">
                <p>{disclaimerText}</p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button">Dismiss and Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </p>
      </div>
    </section>
  );
}
