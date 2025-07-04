import { getLatestListings } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { SwapInterface } from "@/components/swap-interface";
import { HowToExchange } from "@/components/how-to-exchange";
import { Faq } from "@/components/faq";
import { TradeNav } from "@/components/trade-nav";

export default async function Home() {
  const { data: cryptoData, error } = await getLatestListings();

  if (error) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8 gap-6">
        <ApiErrorCard error={error} context="Cryptocurrency Data" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-8 pt-8 md:pt-12">
      <div className="container flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tighter">
            Seamlessly Swap Your Crypto
        </h1>
        <p className="max-w-2xl text-muted-foreground md:text-xl">
            The easiest and most secure way to swap tokens in seconds.
        </p>
      </div>
      <div className="container flex flex-col items-center gap-6">
          <TradeNav />
          <SwapInterface cryptocurrencies={cryptoData} />
      </div>
      <HowToExchange />
      <Faq />
    </div>
  );
}
