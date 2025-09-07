

'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { NftsTable } from './nfts-table';
import type { NftCollection, SelectedCurrency } from '@/lib/types';
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

const supportedCurrencies: SelectedCurrency[] = [
    { symbol: 'USD', name: 'US Dollar', rate: 1 },
    { symbol: 'EUR', name: 'Euro', rate: 0.93 },
    { symbol: 'GBP', name: 'British Pound', rate: 0.79 },
    { symbol: 'JPY', name: 'Japanese Yen', rate: 157.2 },
    { symbol: 'AUD', name: 'Australian Dollar', rate: 1.51 },
    { symbol: 'CAD', name: 'Canadian Dollar', rate: 1.37 },
    { symbol: 'CHF', name: 'Swiss Franc', rate: 0.90 },
    { symbol: 'CNY', name: 'Chinese Yuan', rate: 7.25 },
    { symbol: 'INR', name: 'Indian Rupee', rate: 83.5 },
    { symbol: 'ETH', name: 'Ethereum', rate: 1/3500 },
];

export function NftsPageClient({ view }: { view: 'list' | 'panels' }) {
  const { t } = useLanguage();
  const [collections, setCollections] = useState<NftCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(supportedCurrencies[0]);

  useEffect(() => {
    document.title = t('PageTitles.nfts');
    const fetchNfts = () => {
        setIsLoading(true);
        // Simulate a fetch since we're reading a local file
        setTimeout(() => {
            try {
                // In a real app, you might still fetch this from a static endpoint
                // but for this implementation, we directly use the imported JSON.
                setCollections(nftsData as NftCollection[]);
            } catch (err) {
                 setError('Failed to load local NFT data.');
            } finally {
                setIsLoading(false);
            }
        }, 500); // Simulate network delay
    }
    fetchNfts();
  }, [t]);

  const handleCurrencyChange = (symbol: string) => {
    const currency = supportedCurrencies.find((c) => c.symbol === symbol);
    if (currency) {
      setSelectedCurrency(currency);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-10 w-48" />
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
      <NftsNav />
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold">{t('NftsPage.title')}</h1>
            <div className="w-full md:w-auto md:max-w-[180px]">
            <Select onValueChange={handleCurrencyChange} defaultValue={selectedCurrency.symbol}>
                <SelectTrigger>
                <SelectValue placeholder={t('PoolsClient.selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                {supportedCurrencies.map((currency) => (
                    <SelectItem key={currency.symbol} value={currency.symbol}>
                    <div className="flex items-center gap-2">
                        <span>{currency.name}</span>
                    </div>
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>
        {view === 'list' ? (
             <NftsTable collections={collections} currency={selectedCurrency} />
        ) : (
             <NftsPanels collections={collections} currency={selectedCurrency} />
        )}
      </div>
    </div>
  );
}
