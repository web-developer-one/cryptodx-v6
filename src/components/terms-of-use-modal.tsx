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

export function TermsOfUseModal() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set date on client to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-primary-foreground/70 transition-colors hover:text-primary-foreground text-sm">
          Terms of Use
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Terms of Use</DialogTitle>
          <DialogDescription>
            Last updated: {currentDate}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Welcome to CryptoDx. These Terms of Use ("Terms") govern your access to and use of our website, services, and applications (collectively, the "Service"). Please read these Terms carefully before using the Service.
            </p>

            <h3 className="font-semibold text-foreground">1. Agreement to Terms</h3>
            <p>
              By using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Service. We may modify the Terms at any time, in our sole discretion. If we do so, we’ll let you know either by posting the modified Terms on the site or through other communications.
            </p>

            <h3 className="font-semibold text-foreground">2. Eligibility</h3>
            <p>
              You must be at least 18 years old to use the Service. By agreeing to these Terms, you represent and warrant to us that: (a) you are at least 18 years old; (b) you have not previously been suspended or removed from the Service; and (c) your registration and your use of the Service is in compliance with any and all applicable laws and regulations.
            </p>

            <h3 className="font-semibold text-foreground">3. The Service</h3>
            <p>
              CryptoDx is a decentralized exchange interface. We do not operate as a financial institution, nor do we provide any financial services. We are a software provider that allows users to interact with decentralized protocols. You are responsible for your own actions and for the security of your wallet.
            </p>
            
            <h3 className="font-semibold text-foreground">4. Prohibited Activities</h3>
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
              <li>Engaging in any activity that could interfere with, disrupt, negatively affect, or inhibit other users from fully enjoying the Service.</li>
              <li>Attempting to circumvent any content filtering techniques we employ, or attempting to access any service or area of the Service that you are not authorized to access.</li>
               <li>Using any robot, spider, crawler, scraper or other automated means or interface not provided by us to access the Service or to extract data.</li>
            </ul>

            <h3 className="font-semibold text-foreground">5. Disclaimers</h3>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. YOU ACKNOWLEDGE AND AGREE THAT YOU HAVE HAD WHATEVER OPPORTUNITY YOU DEEM NECESSARY TO INVESTIGATE THE SERVICE, LAWS, RULES, OR REGULATIONS THAT MAY BE APPLICABLE TO YOUR USE OF THE SERVICE AND THAT YOU ARE NOT RELYING UPON ANY STATEMENT OF LAW OR FACT MADE BY CRYPTODX RELATING TO THE SERVICE.
            </p>
            
            <h3 className="font-semibold text-foreground">6. Limitation of Liability</h3>
             <p>
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL CRYPTODX OR ITS AFFILIATES BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES OF ANY KIND.
            </p>

            <h3 className="font-semibold text-foreground">7. Governing Law</h3>
            <p>
                These Terms and any action related thereto will be governed by the laws of the jurisdiction in which the company is based, without regard to its conflict of laws provisions.
            </p>

          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Dismiss and Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
