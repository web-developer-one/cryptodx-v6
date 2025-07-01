import type {Metadata} from 'next';
import './globals.css';
import { getLatestListings } from '@/lib/coinmarketcap';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { GdprModal } from '@/components/gdpr-modal';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'CryptoDx | Seamless Token Exchange',
  description: 'Swap, trade, and manage your cryptocurrency assets with ease on our decentralized exchange platform.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header cryptocurrencies={cryptoData || []} />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <Toaster />
            <GdprModal />
          </div>
        </Providers>
      </body>
    </html>
  );
}
