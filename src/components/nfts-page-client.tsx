

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

// Mock data generation
const generateMockNfts = (): NftCollection[] => {
  const collections = [
    { name: 'CryptoPunks', url: 'https://www.larvalabs.com/cryptopunks', logo: 'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8deZM3KAK2TkvRHaAhi8BOUQ4oIYffectN2GASpDlpLFSWAfxG51CxHdN4ADTrustLZBPgv3g?w=500&auto=format', isVerified: true },
    { name: 'Bored Ape Yacht Club', url: 'https://www.boredapeyachtclub.com/', logo: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wGAI7tALvrhcsH_L?w=500&auto=format', isVerified: true },
    { name: 'Azuki', url: 'https://www.azuki.com/', logo: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mIVSoB2dxp4pMNocHGoa4iVoCatalog?w=500&auto=format', isVerified: true },
    { name: 'Pudgy Penguins', url: 'https://pudgypenguins.com/', logo: 'https://i.seadn.io/gae/yNi-3H_6l_tUNqN0I4yB_Qk_vstmbTlljd-4d4bEw_wP3yK1mO0qS7op-k-m-iXh3hU0wz0_f35ELFp8DHAEDsXoGzY42EaU6pB_?w=500&auto=format', isVerified: true },
    { name: 'Doodles', url: 'https://doodles.app/', logo: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztLS83DM?w=500&auto=format', isVerified: true },
    { name: 'Moonbirds', url: 'https://www.moonbirds.xyz/', logo: 'https://i.seadn.io/gae/H-3da5-4d3v_55c1cd_kH9y3sQp1NZe3lK4V38_2s__vi_av_s_cp_rC-9bH2gZf_s9moMh_A9_t_s-A?w=500&auto=format', isVerified: true },
    { name: 'CloneX', url: 'https://clonex.rtfkt.com/', logo: 'https://i.seadn.io/gae/XN0XuD8Uh3jy4vBenS-bCkR4JQH_i5Abw_s5wQ5gdYpQaIlS3G_pFGp2NFh_5Hj_j_46Qv6eg_xp5DPAEgCgGzWF2w_g9bAGo5hJ?w=500&auto=format', isVerified: true },
    { name: 'Meebits', url: 'https://meebits.larvalabs.com/', logo: 'https://i.seadn.io/gae/7pcD-221keA3e8aN-4c4Y_bH44d2e-R1i-9pZp5m_s_f_z-Z_v-Z_u-y_Q-Q_r_t_s_f?w=500&auto=format', isVerified: true },
    { name: 'Mutant Ape Yacht Club', url: 'https://boredapeyachtclub.com/#/mayc', logo: 'https://i.seadn.io/gae/lHexKRMpw-aoSyB1WdFBff5yfANLReFxHzt1DOj_sg7mS14yARpuvYcUtsyyx-Nkpk6WTcUPFoG53Vnss9XPbyAxoGTGV7jwLVrm?w=500&auto=format', isVerified: true },
    { name: 'VeeFriends', url: 'https://veefriends.com/', logo: 'https://i.seadn.io/gae/b67J2A1P-w_t_y_g-A_y_e_f_O_u_R_j_C_k_W_w_c_t_b_a_h_Q_v_x_N_w_S_n_a_k_e_F_t_?w=500&auto=format', isVerified: true },
    { name: 'The Sandbox', url: 'https://www.sandbox.game/', logo: 'https://i.seadn.io/gae/SXH8tW1siikB80rwT-B4I_ePAY22z1sS3nK-w3Y-X2sLz-w-g_t_z-f_c-e_a_b_c_d_e?w=500&auto=format', isVerified: true },
    { name: 'Decentraland', url: 'https://decentraland.org/', logo: 'https://i.seadn.io/gae/7g_k_u_a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_q_r_s_t_u_v_w_x_y_z_a_b_c_d_e_f_g_h_i?w=500&auto=format', isVerified: true },
    { name: 'Cool Cats', url: 'https://www.coolcats.com/', logo: 'https://i.seadn.io/gae/p_h_a_n_t_a_s_y_p_a_n_t_h_e_r_s?w=500&auto=format', isVerified: true },
    { name: 'World of Women', url: 'https://www.worldofwomen.art/', logo: 'https://i.seadn.io/gae/h_h_a_s_h_m_a_s_k_s?w=500&auto=format', isVerified: true },
    { name: 'Nouns', url: 'https://nouns.wtf/', logo: 'https://i.seadn.io/gae/0_x_N_o_u_n_s_W_T_F_0_x_N_o_u_n_s_W_T_F_0_x_N_o_u_n_s_W_T_F?w=500&auto=format', isVerified: true },
    { name: 'Chromie Squiggle', url: 'https://www.artblocks.io/project/0', logo: 'https://i.seadn.io/gae/0_x_A_r_t_B_l_o_c_k_s_0_x_A_r_t_B_l_o_c_k_s_0_x_A_r_t_B_l_o_c_k_s?w=500&auto=format', isVerified: true },
    { name: 'DeGods', url: 'https://degods.com/', logo: 'https://i.seadn.io/gae/s_o_l_a_n_a_M_o_n_k_e_y_B_u_s_i_n_e_s_s?w=500&auto=format', isVerified: true },
    { name: 'y00ts', url: 'https://www.y00ts.com/', logo: 'https://i.seadn.io/gae/y_0_0_t_s?w=500&auto=format', isVerified: true },
    { name: 'Milady Maker', url: 'https://miladymaker.net/', logo: 'https://i.seadn.io/gae/M_i_l_a_d_y_M_a_k_e_r?w=500&auto=format', isVerified: true },
    { name: 'Mfers', url: 'https://mfers.art/', logo: 'https://i.seadn.io/gae/m_f_e_r_s?w=500&auto=format', isVerified: true },
  ];

  return collections.map((col, index) => ({
    id: (index + 1).toString(),
    name: col.name,
    logo: col.logo,
    url: col.url,
    isVerified: col.isVerified,
    floorPrice: Math.random() * 20 + 0.5,
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

export function NftsPageClient({ view }: { view: 'list' | 'panels' }) {
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
             <NftsTable collections={collections} />
        ) : (
             <NftsPanels collections={collections} />
        )}
      </div>
    </div>
  );
}
