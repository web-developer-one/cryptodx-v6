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

export function CookiePolicyModal() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set date on client to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground transition-colors hover:text-foreground text-sm">
          Cookie Policy
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cookie Policy</DialogTitle>
          <DialogDescription>
            Last updated: {currentDate}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              This Cookie Policy explains how CryptoDx ("we", "us", and "our")
              uses cookies and similar technologies to recognize you when you
              visit our website. It explains what these technologies are and
              why we use them, as well as your rights to control our use of them.
            </p>

            <h3 className="font-semibold text-foreground">What are cookies?</h3>
            <p>
              A cookie is a small data file that is placed on your device when you
              visit a website. Cookies are widely used by website owners in order
              to make their websites work, or to work more efficiently, as well as
              to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, CryptoDx) are
              called "first-party cookies". Cookies set by parties other than the
              website owner are called "third-party cookies". Third-party cookies
              enable third-party features or functionality to be provided on or
              through the website (e.g., advertising, interactive content, and
              analytics). The parties that set these third-party cookies can
              recognize your computer both when it visits the website in question
              and also when it visits certain other websites.
            </p>

            <h3 className="font-semibold text-foreground">Why do we use cookies?</h3>
            <p>
              We use first-party and third-party cookies for several reasons. Some
              cookies are required for technical reasons in order for our Website
              to operate, and we refer to these as "essential" or "strictly
              necessary" cookies. Other cookies also enable us to track and
              target the interests of our users to enhance the experience on our
              Online Properties. Third parties serve cookies through our Website
              for advertising, analytics, and other purposes. This is described
              in more detail below.
            </p>

            <h3 className="font-semibold text-foreground">Types of Cookies We Use</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Strictly Necessary Cookies:</strong> These cookies are
                essential to provide you with services available through our
                Website and to enable you to use some of its features. Because
                these cookies are strictly necessary to deliver the Website to
                you, you cannot refuse them without impacting how our Website
                functions.
              </li>
              <li>
                <strong>Performance and Functionality Cookies:</strong> These
                cookies are used to enhance the performance and functionality of
                our Website but are non-essential to their use. However, without
                these cookies, certain functionality (like remembering your theme
                preference) may become unavailable.
              </li>
              <li>
                <strong>Analytics and Customization Cookies:</strong> These
                cookies collect information that is used either in aggregate form
                to help us understand how our Website is being used or how
                effective our marketing campaigns are, or to help us customize
                our Website for you.
              </li>
            </ul>

            <h3 className="font-semibold text-foreground">Your choices regarding cookies</h3>
            <p>
              You have the right to decide whether to accept or reject cookies.
              You can exercise your cookie preferences by setting or amending your
              web browser controls to accept or refuse cookies. If you choose to
                reject cookies, you may still use our website though your access
                to some functionality and areas of our website may be restricted.
                As the means by which you can refuse cookies through your web
                browser controls vary from browser-to-browser, you should visit
                your browser's help menu for more information.
            </p>
            
            <h3 className="font-semibold text-foreground">Changes to this Cookie Policy</h3>
             <p>
              We may update this Cookie Policy from time to time in order to
              reflect, for example, changes to the cookies we use or for other
              operational, legal, or regulatory reasons. Please therefore
              re-visit this Cookie Policy regularly to stay informed about our use
              of cookies and related technologies.
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
