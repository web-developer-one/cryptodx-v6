
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ApiErrorCard } from "./api-error-card";
import { Skeleton } from "./ui/skeleton";

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

const FormattedLargeCurrency = ({
  value,
  currency,
}: {
  value: number;
  currency: SelectedCurrency;
}) => {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    if (value === null || value === undefined) {
      setFormatted("N/A");
      return;
    }
    const convertedValue = value * currency.rate;
    setFormatted(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.symbol,
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(convertedValue)
    );
  }, [value, currency]);

  return <>{formatted || "N/A"}</>;
};

const generateSparklineData = (currentPrice: number, change24h: number) => {
    const data = [];
    // Simplified trend calculation for visual purposes
    const trend = change24h / 100 / 7; 
    let price = currentPrice / (1 + trend * 7); // Estimate a starting price

    for (let i = 0; i < 7; i++) {
        const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // Add volatility
        price *= (1 + trend) * randomFactor;
        data.push({ price });
    }
    data[6] = { price: currentPrice }; // Ensure the last point is the current price
    return data;
};

const Sparkline = ({ data, change24h }: { data: { price: number }[], change24h: number }) => {
  const strokeColor = change24h >= 0 ? "hsl(145 63% 49%)" : "hsl(var(--destructive))";
  
  if (!data || data.length === 0) {
      return <div className="h-10 w-[120px]" />;
  }

  return (
    <div className="h-10 w-[120px]">
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


export function TokenExplorer() {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(
    supportedCurrencies[0]
  );
  const [liveTokens, setLiveTokens] =
    useState<Cryptocurrency[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = t('PageTitles.tokens');
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const { data, error } = await getLatestListings();
        if (error) {
            setError(error);
        } else {
            setLiveTokens(data);
        }
        setIsLoading(false);
    }
    fetchData();

    const intervalId = setInterval(async () => {
      setIsUpdating(true);
      const { data: latestData } = await getLatestListings();
      if (latestData && latestData.length > 0) {
        setLiveTokens(latestData);
      }
      setIsUpdating(false);
    }, 30000); // Fetch every 30 seconds

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

  const handleRowClick = (tokenId: number) => {
    router.push(`/tokens/${tokenId}`);
  };

  const handleCurrencyChange = (symbol: string) => {
    const currency = supportedCurrencies.find((c) => c.symbol === symbol);
    if (currency) {
      setSelectedCurrency(currency);
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <div className="flex flex-1 items-center justify-end gap-4">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-9 w-48" />
                </div>
            </div>
            <Skeleton className="h-[600px] w-full" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="w-full max-w-lg mt-6 mx-auto">
            <ApiErrorCard error={error} context="Cryptocurrency Data" />
        </div>
    );
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {t('TokenExplorer.title')}
          {isUpdating && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          )}
        </h1>
        <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center md:justify-end gap-2 md:gap-4">
          <Link href="/tokens/panels" passHref>
            <Button variant="outline" className="w-full md:w-auto">{t('TokenExplorer.panelView')}</Button>
          </Link>
          <div className="w-full md:max-w-[220px]">
            <Input
              placeholder={t('TokenExplorer.search')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on new search
              }}
              className="h-9 text-sm"
            />
          </div>
          <div className="w-full md:max-w-[220px]">
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">{t('TokenExplorer.headerRank')}</TableHead>
                <TableHead>{t('TokenExplorer.headerName')}</TableHead>
                <TableHead className="text-right">{t('TokenExplorer.headerPrice')}</TableHead>
                <TableHead className="text-right">{t('TokenExplorer.headerChange24h')}</TableHead>
                <TableHead className="text-right">{t('TokenExplorer.headerMarketCap')}</TableHead>
                <TableHead className="text-right">{t('TokenExplorer.headerVolume24h')}</TableHead>
                <TableHead className="text-right">{t('TokenExplorer.headerAvailableSupply')}</TableHead>
                <TableHead className="text-right">{t('TokenExplorer.headerPriceGraph7d')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTokens.map((token) => (
                <TableRow
                  key={token.id}
                  onClick={() => handleRowClick(token.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {token.cmcRank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={token.logo || `https://placehold.co/32x32.png`}
                        alt={`${token.name} (${token.symbol}) logo`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{`${token.name} (${token.symbol})`}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <FormattedTokenPrice
                      price={token.price}
                      currency={selectedCurrency}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={cn(
                        "font-medium flex items-center justify-end gap-1",
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
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <FormattedLargeCurrency
                      value={token.marketCap ?? 0}
                      currency={selectedCurrency}
                    />
                  </TableCell>
                   <TableCell className="text-right font-mono">
                    <FormattedLargeCurrency
                      value={token.volume24h ?? 0}
                      currency={selectedCurrency}
                    />
                  </TableCell>
                   <TableCell className="text-right font-mono">
                    {token.circulatingSupply
                      ? `${token.circulatingSupply.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })} ${token.symbol}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <Sparkline data={generateSparklineData(token.price, token.change24h)} change24h={token.change24h} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between pt-6">
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
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
