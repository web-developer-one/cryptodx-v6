
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDexCurrencies, getFiatCurrencies } from '@/lib/changelly';
import { ChangellySwap } from '@/components/changelly-swap';
import { ChangellyBuy } from '@/components/changelly-buy';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default async function ChangellyPage() {
  const [dexCurrencies, fiatCurrencies] = await Promise.all([
    getDexCurrencies(),
    getFiatCurrencies()
  ]);

  if (!dexCurrencies.length || !fiatCurrencies.length) {
    return (
        <div className="container flex-1 flex flex-col items-center justify-center py-8">
             <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="text-destructive" />
                        <span>Error</span>
                    </CardTitle>
                    <CardDescription>
                        Could not load Changelly data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        There was an issue fetching data from the Changelly API. Please
                        check your API keys in the .env file or try again later.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container py-8 flex justify-center">
      <Tabs defaultValue="swap" className="w-full max-w-lg">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="buy">Buy</TabsTrigger>
        </TabsList>
        <TabsContent value="swap" className="mt-6">
          <ChangellySwap currencies={dexCurrencies} />
        </TabsContent>
        <TabsContent value="buy" className="mt-6">
          <ChangellyBuy cryptoCurrencies={dexCurrencies} fiatCurrencies={fiatCurrencies} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
