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
  // Fetch data for shared components like the Header.
  // Individual pages will still fetch their own data as needed.
  let cryptoData = [];
  try {
    cryptoData = await getLatestListings();
  } catch (error) {
    console.error("Failed to fetch cryptocurrency data in root layout:", error);
    // Gracefully handle error by passing empty array.
    // Pages should have their own checks for this data.
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header cryptocurrencies={cryptoData || []} />
            <main className="flex-1 flex flex-col">{children}</main>
            <div className="w-full py-12 flex justify-center border-y bg-background">
              <div className="container">
                <MarketHighlights cryptocurrencies={cryptoData || []} />
              </div>
            </div>
            <Footer />
            <Toaster />
            <GdprModal />
          </div>
        </Providers>
      </body>
    </html>
  );
}
