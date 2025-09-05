

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

// Mock data generation
const generateMockNfts = (): NftCollection[] => {
  const collections = [
    { name: 'CryptoPunks', url: 'https://www.larvalabs.com/cryptopunks', logo: 'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8deZM3KAK2TkvRHaAhi8BOUQ4oIYffectN2GASpDlpLFSWAfxG51CxHdN4ADTrustLZBPgv3g?w=500&auto=format', isVerified: true },
    { name: 'Bored Ape Yacht Club', url: 'https://www.boredapeyachtclub.com/', logo: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wGAI7tALvrhcsH_L?w=500&auto=format', isVerified: true },
    { name: 'Azuki', url: 'https://www.azuki.com/', logo: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mIVSoB2dxp4pMNocHGoa4iVoCatalog?w=500&auto=format', isVerified: true },
    { name: 'Pudgy Penguins', url: 'https://pudgypenguins.com/', logo: 'https://i.seadn.io/gae/yNi-3H_6l_tUNqN0I4yB_Qk_vstmbTlljd-4d4bEw_wP3yK1mO0qS7op-k-m-iXh3hU0wz0_f35ELFp8DHAEDsXoGzY42EaU6pB_?w=500&auto=format', isVerified: false },
    { name: 'Doodles', url: 'https://doodles.app/', logo: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztLS83DM?w=500&auto=format', isVerified: true },
    { name: 'Moonbirds', url: 'https://www.moonbirds.xyz/', logo: 'https://i.seadn.io/gae/H-3da5-4d3v_55c1cd_kH9y3sQp1NZe3lK4V38_2s__vi_av_s_cp_rC-9bH2gZf_s9moMh_A9_t_s-A?w=500&auto=format', isVerified: false },
    { name: 'CloneX', url: 'https://clonex.rtfkt.com/', logo: 'https://i.seadn.io/gae/XN0XuD8Uh3jy4vBenS-bCkR4JQH_i5Abw_s5wQ5gdYpQaIlS3G_pFGp2NFh_5Hj_j_46Qv6eg_xp5DPAEgCgGzWF2w_g9bAGo5hJ?w=500&auto=format', isVerified: true },
    { name: 'Meebits', url: 'https://meebits.larvalabs.com/', logo: 'https://i.seadn.io/gae/7pcD-221keA3e8aN-4c4Y_bH44d2e-R1i-9pZp5m_s_f_z-Z_v-Z_u-y_Q-Q_r_t_s_f?w=500&auto=format', isVerified: false },
  ];

  return collections.map((col, index) => ({
    id: (index + 1).toString(),
    name: col.name,
    logo: col.logo,
    url: col.url,
    isVerified: col.isVerified,
    transfers24h: Math.floor(Math.random() * 500) + 50,
    transfers7d: Math.floor(Math.random() * 3000) + 500,
    uniqueHolders: Math.floor(Math.random() * 5000) + 1000,
    totalSupply: 10000 + index * 100,
  }));
};

const supportedCurrencies: SelectedCurrency[] = [
    { symbol: 'USD', name: 'US Dollar', rate: 1 },
    { symbol: 'ETH', name: 'Ethereum', rate: 1/3500 },
];

export function NftsPageClient() {
  const { t } = useLanguage();
  const [collections, setCollections] = useState<NftCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency>(supportedCurrencies[0]);

  useEffect(() => {
    document.title = t('PageTitles.nfts');
    const mockData = generateMockNfts();
    setCollections(mockData);
    setIsLoading(false);
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

  return (
    <div className="container py-8">
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
      <NftsTable collections={collections} />
    </div>
  );
}
