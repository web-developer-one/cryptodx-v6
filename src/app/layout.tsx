
'use client';

import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { GdprModal } from '@/components/gdpr-modal';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { MarketHighlights } from '@/components/market-highlights';
import { LiveUpdateNotifier } from '@/components/live-update-notifier';
import { Chatbot } from '@/components/chatbot';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
});

// Metadata can't be exported from a client component, but we can manage the document title.
// For full SEO, this would require a different architectural approach.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <div className="w-full py-12 flex justify-center border-y bg-background">
              <div className="container">
                <MarketHighlights />
              </div>
            </div>
            <Footer />
          </div>
          <Toaster />
          <GdprModal />
          <LiveUpdateNotifier />
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}

