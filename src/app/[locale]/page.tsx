import { getLatestListings } from "@/lib/coinmarketcap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { SwapInterface } from "@/components/swap-interface";
import { HowToExchange } from "@/components/how-to-exchange";
import { Faq } from "@/components/faq";
import { TradeNav } from "@/components/trade-nav";
import { useTranslations } from "next-intl";

function HomePageContent() {
  const t = useTranslations('HomePage');
  return (
    <div className="container flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tighter">
            {t('title')}
        </h1>
        <p className="max-w-2xl text-muted-foreground md:text-xl">
            {t('subtitle')}
        </p>
      </div>
  )
}


export default async function Home() {
  const cryptoData = await getLatestListings();

  if (!cryptoData || cryptoData.length === 0) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8 gap-6">
        <Card className="w-full max-w-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive" />
              <span>Error</span>
            </CardTitle>
            <CardDescription>
              Could not load cryptocurrency data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              There was an issue fetching data from the CoinMarketCap API. Please
              check your API key or try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-8 pt-8 md:pt-12">
      <HomePageContent />
      <div className="container flex flex-col items-center gap-6">
          <TradeNav />
          <SwapInterface cryptocurrencies={cryptoData} />
      </div>
      <HowToExchange />
      <Faq />
    </div>
  );
}
