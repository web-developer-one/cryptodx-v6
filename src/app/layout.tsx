
import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { getLatestListings } from '@/lib/coinmarketcap';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { GdprModal } from '@/components/gdpr-modal';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { MarketHighlights } from '@/components/market-highlights';
import { Chatbot } from '@/components/chatbot';
import { LiveAlertSystem } from '@/components/live-alert-system';

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

export const metadata: Metadata = {
  title: 'CryptoDx | Seamless Token Exchange',
  description: 'Swap, trade, and manage your cryptocurrency assets with ease on our decentralized exchange platform.',
  icons: {
    icon: '/Cdx-box-icon-none.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: cryptoData, error } = await getLatestListings();
  // In the root layout, we don't render an error page.
  // We pass an empty array if data fetching fails, and child pages will show specific errors.
  const finalCryptoData = error ? [] : cryptoData;
  
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header cryptocurrencies={finalCryptoData} />
            <main className="flex-1 flex flex-col">{children}</main>
            <div className="w-full py-12 flex justify-center border-y bg-background">
              <div className="container">
                <MarketHighlights cryptocurrencies={finalCryptoData} />
              </div>
            </div>
            <Footer />
            <Toaster />
            <GdprModal />
            <Chatbot />
            <LiveAlertSystem />
          </div>
        </Providers>
      </body>
    </html>
  );
}
