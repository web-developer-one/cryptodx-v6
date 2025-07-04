'use client';

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Cryptocurrency, SelectedCurrency } from "@/lib/types";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLatestListings } from "@/lib/coinmarketcap";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";

const TOKENS_PER_PAGE = 20;

const supportedCurrencies: SelectedCurrency[] = [
  { symbol: "USD", name: "US Dollar", rate: 1 },
  { symbol: "EUR", name: "Euro", rate: 0.93 },
  { symbol: "GBP", name: "British Pound", rate: 0.79 },
  { symbol: "JPY", name: "Japanese Yen", rate: 157.2 },
  { symbol: "AUD", name: "Australian Dollar", rate: 1.51 },
  { symbol: "CAD", name: "Canadian Dollar", rate: 1.37 },
  { symbol: "CHF", name: "Swiss Franc", rate: 0.9 },
  { symbol: "CNY", name: "Chinese Yuan", rate: 7.25 },
  { symbol: "INR", name: "Indian Rupee", rate: 83.5 },
];

const FormattedTokenPrice = ({
  price,
  currency,
}: {
  price: number;
  currency: SelectedCurrency;
}) => {
  const [formattedPrice, setFormattedPrice] = useState<string>("");

  useEffect(() => {
    const convertedPrice = price * currency.rate;
    setFormattedPrice(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.symbol,
        minimumFractionDigits: 2,
        maximumFractionDigits: convertedPrice < 1 ? 6 : 2,
      }).format(convertedPrice)
    );
  }, [price, currency]);

  return <>{formattedPrice}</>;
};

const generateSparklineData = (currentPrice: number, change24h: number) => {
    const data = [];
    const trend = change24h / 100 / 7; 
    let price = currentPrice / (1 + trend * 7); 

    for (let i = 0; i < 7; i++) {
        const randomFactor = 1 + (Math.random() - 0.5) * 0.1;
        price *= (1 + trend) * randomFactor;
        data.push({ price });
    }
    data[6] = { price: currentPrice };
    return data;
};

const Sparkline = ({ data, change24h }: { data: { price: number }[], change24h: number }) => {
  const strokeColor = change24h >= 0 ? "hsl(145 63% 49%)" : "hsl(var(--destructive))";
  
  if (!data || data.length === 0) {
      return <div className="h-10 w-full" />;
  }

  return (
    <div className="h-10 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke={strokeColor}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};


export function TokenPanels({
  cryptocurrencies,
}: {
  cryptocurrencies: Cryptocurrency[];
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(
    supportedCurrencies[0]
  );
  const [liveTokens, setLiveTokens] =
    useState<Cryptocurrency[]>(cryptocurrencies);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      setIsUpdating(true);
      const { data: latestData } = await getLatestListings();
      if (latestData && latestData.length > 0) {
        setLiveTokens(latestData);
      }
      setIsUpdating(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) {
      return liveTokens;
    }
    return liveTokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [liveTokens, searchQuery]);

  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort(
      (a, b) => (a.cmcRank || Infinity) - (b.cmcRank || Infinity)
    );
  }, [filteredTokens]);

  const totalPages = Math.ceil(sortedTokens.length / TOKENS_PER_PAGE);

  const currentTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * TOKENS_PER_PAGE;
    const endIndex = startIndex + TOKENS_PER_PAGE;
    return sortedTokens.slice(startIndex, endIndex);
  }, [sortedTokens, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePanelClick = (tokenId: number) => {
    router.push(`/tokens/${tokenId}`);
  };

  const handleCurrencyChange = (symbol: string) => {
    const currency = supportedCurrencies.find((c) => c.symbol === symbol);
    if (currency) {
      setSelectedCurrency(currency);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            {t('TokenPanels.title')}
            {isUpdating && <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />}
        </h1>
        <div className="flex flex-1 items-center justify-end gap-4">
            <Link href="/tokens" passHref>
              <Button variant="outline">{t('TokenExplorer.listView')}</Button>
            </Link>
            <div className="w-full max-w-sm">
              <Input
                placeholder={t('TokenExplorer.search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 text-sm"
              />
            </div>
            <div className="w-full max-w-[220px]">
              <Select
                onValueChange={handleCurrencyChange}
                defaultValue={selectedCurrency.symbol}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t('PoolsClient.selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                  {supportedCurrencies.map((currency) => (
                    <SelectItem key={currency.symbol} value={currency.symbol}>
                      <div className="flex items-center gap-2">
                        <span>
                          {currency.symbol} - {currency.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {currentTokens.map((token) => (
            <Card key={token.id} onClick={() => handlePanelClick(token.id)} className="cursor-pointer hover:border-primary transition-colors flex flex-col">
                <CardHeader className="flex-row items-center gap-3 space-y-0 p-4">
                    <Image
                        src={token.logo || `https://placehold.co/40x40.png`}
                        alt={`${token.name} (${token.symbol}) logo`}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <div className="flex-1">
                        <CardTitle className="text-base">{`${token.name} (${token.symbol})`}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
                    <div className="mb-2">
                        <Sparkline data={generateSparklineData(token.price, token.change24h)} change24h={token.change24h} />
                    </div>
                    <div className="text-lg font-bold">
                        <FormattedTokenPrice
                          price={token.price}
                          currency={selectedCurrency}
                        />
                    </div>
                    <div
                      className={cn(
                        "font-medium text-sm flex items-center gap-1",
                        token.change24h >= 0
                          ? "text-green-500"
                          : "text-destructive"
                      )}
                    >
                      {token.change24h >= 0 ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                      <span>{Math.abs(token.change24h).toFixed(2)}%</span>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
       {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6">
            <span className="text-sm text-muted-foreground">
               {t('TokenExplorer.showing')
                .replace('{start}', (((currentPage - 1) * TOKENS_PER_PAGE) + 1).toString())
                .replace('{end}', Math.min(currentPage * TOKENS_PER_PAGE, sortedTokens.length).toString())
                .replace('{total}', sortedTokens.length.toString())
              }
            </span>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                {t('TokenExplorer.previous')}
              </Button>
              <span className="text-sm font-medium">
                {t('TokenExplorer.page')
                  .replace('{current}', currentPage.toString())
                  .replace('{total}', totalPages.toString())
                }
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                {t('TokenExplorer.next')}
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
