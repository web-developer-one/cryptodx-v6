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
  const disclaimerText = "This web application is provided as a tool for users to interact with CryptoMx on their own initiative, with no endorsement or recommendation of cryptocurrency trading activities. In doing so, Uniswap is not recommending that users or potential users engage in cryptoasset trading activity, and users or potential users of the web application should not regard this webpage or its contents as involving any form of recommendation, invitation or inducement to deal in cryptoassets.";
  const [panelText, readMoreText] = disclaimerText.split("Uniswap");

  return (
    <section className="w-full py-8 bg-muted/50 border-t">
      <div className="container max-w-5xl px-4 md:px-6 flex items-start gap-4">
        <Info className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          UK disclaimer: {panelText}
          <Dialog>
            <DialogTrigger asChild>
              <button className="inline-block text-primary underline hover:text-primary/80">
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
