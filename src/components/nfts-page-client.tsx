
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { NftsTable } from './nfts-table';
import type { NftCollection, SelectedCurrency, Cryptocurrency } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NftsNav } from './nfts-nav';
import { NftsPanels } from './nfts-panels';
import { ApiErrorCard } from './api-error-card';
import nftsData from '@/lib/nfts.json';
import { getLatestListings } from '@/lib/coinmarketcap';
import { Button } from './ui/button';
import { CardFooter } from './ui/card';
import { Input } from './ui/input';

const NFTS_PER_PAGE = 25;

const initialSupportedCurrencies: SelectedCurrency[] = [
    { symbol: 'USD', name: 'US Dollar', rate: 1 },
    { symbol: 'EUR', name: 'Euro', rate: 0.93 },
    { symbol: 'GBP', name: 'British Pound', rate: 0.79 },
    { symbol: 'JPY', name: 'Japanese Yen', rate: 157.2 },
    { symbol: 'AUD', name: 'Australian Dollar', rate: 1.51 },
    { symbol: 'CAD', name: 'Canadian Dollar', rate: 1.37 },
    { symbol: 'CHF', name: 'Swiss Franc', rate: 0.90 },
    { symbol: 'CNY', name: 'Chinese Yuan', rate: 7.25 },
    { symbol: 'INR', name: 'Indian Rupee', rate: 83.5 },
];

export function NftsPageClient({ view }: { view: 'list' | 'panels' }) {
  const { t } = useLanguage();
  const [collections, setCollections] = useState<NftCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [topCryptos, setTopCryptos] = useState<Cryptocurrency[]>([]);
  const [supportedCurrencies, setSupportedCurrencies] = useState<SelectedCurrency[]>(initialSupportedCurrencies);
  const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(initialSupportedCurrencies[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = t('PageTitles.nfts');
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data: cryptoData, error: cryptoError } = await getLatestListings();
            if (cryptoError) {
                setError(cryptoError);
            } else {
                setTopCryptos(cryptoData.slice(0, 9));
            }
            setCollections(nftsData as NftCollection[]);
        } catch (err) {
            setError('Failed to load page data.');
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [t]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery) {
      return collections;
    }
    return collections.filter(collection =>
      collection.collection_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collections, searchQuery]);
  
  const allCurrencies = useMemo(() => {
      const cryptoCurrencies: SelectedCurrency[] = topCryptos.map(c => ({
          symbol: c.symbol,
          name: c.name,
          rate: 1 / c.price, // Rate is how many of this currency per USD
      }));
      return [...initialSupportedCurrencies, ...cryptoCurrencies];
  }, [topCryptos]);

  const handleCurrencyChange = (symbol: string) => {
    const currency = allCurrencies.find((c) => c.symbol === symbol);
    if (currency) {
      setSelectedCurrency(currency);
    }
  };
  
  const totalPages = Math.ceil(filteredCollections.length / NFTS_PER_PAGE);
  const currentCollections = useMemo(() => {
    const startIndex = (currentPage - 1) * NFTS_PER_PAGE;
    const endIndex = startIndex + NFTS_PER_PAGE;
    return filteredCollections.slice(startIndex, endIndex);
  }, [filteredCollections, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };


  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-72" />
            <div className="flex gap-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-48" />
            </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
        <div className="w-full max-w-lg mt-6 mx-auto">
            <ApiErrorCard error={error} context="NFT Collections" />
        </div>
    );
  }

  return (
    <div className="container flex flex-col items-center py-8">
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold">{t('NftsPage.title')}</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <NftsNav />
                 <div className="w-full sm:w-[220px]">
                    <Input
                        placeholder={t('TokenExplorer.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select onValueChange={handleCurrencyChange} defaultValue={selectedCurrency.symbol}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t('PoolsClient.selectCurrency')} />
                    </SelectTrigger>
                    <SelectContent>
                        {initialSupportedCurrencies.map((currency) => (
                            <SelectItem key={currency.symbol} value={currency.symbol}>
                                {currency.symbol} - {currency.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select onValueChange={handleCurrencyChange} defaultValue={topCryptos.includes(selectedCurrency as any) ? selectedCurrency.symbol : undefined}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Crypto..." />
                    </SelectTrigger>
                    <SelectContent>
                        {topCryptos.map((currency) => (
                            <SelectItem key={currency.symbol} value={currency.symbol}>
                                {currency.symbol} - {currency.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        {view === 'list' ? (
             <NftsTable collections={currentCollections} currency={selectedCurrency} />
        ) : (
             <NftsPanels collections={currentCollections} currency={selectedCurrency} />
        )}
        {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between pt-6 border-t mt-6">
                <span className="text-sm text-muted-foreground">
                  {t('TokenExplorer.showing')
                    .replace('{start}', (((currentPage - 1) * NFTS_PER_PAGE) + 1).toString())
                    .replace('{end}', Math.min(currentPage * NFTS_PER_PAGE, filteredCollections.length).toString())
                    .replace('{total}', filteredCollections.length.toString())
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
      </div>
    </div>
  );
}
