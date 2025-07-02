import { getLatestListings } from '@/lib/coinmarketcap';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { GdprModal } from '@/components/gdpr-modal';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { MarketHighlights } from '@/components/market-highlights';
import { Chatbot } from '@/components/chatbot';
import { LiveAlertSystem } from '@/components/live-alert-system';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';


export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const cryptoData = await getLatestListings();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header cryptocurrencies={cryptoData} />
            <main className="flex-1 flex flex-col">{children}</main>
            <div className="w-full py-12 flex justify-center border-y bg-background">
              <div className="container">
                <MarketHighlights cryptocurrencies={cryptoData} />
              </div>
            </div>
            <Footer />
            <Toaster />
            <GdprModal />
            <Chatbot />
            <LiveAlertSystem />
          </div>
        </Providers>
    </NextIntlClientProvider>
  );
}
