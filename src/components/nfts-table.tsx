
'use client';

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import type { NftCollection, SelectedCurrency } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const FormattedCurrency = ({ value, currency, isEth = false }: { value: number | null | undefined; currency: SelectedCurrency; isEth?: boolean }) => {
    if (value === null || value === undefined) {
        return <>N/A</>;
    }
    if (isEth) {
        return <>{value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETH</>
    }
    const convertedValue = value * currency.rate;
    return <>{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.symbol }).format(convertedValue)}</>
};

export function NftsTable({ collections, currency }: { collections: NftCollection[], currency: SelectedCurrency }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">{t('TokenExplorer.headerRank')}</TableHead>
              <TableHead>{t('NftsPage.collection')}</TableHead>
              <TableHead className="text-right">{t('NftsPage.floorPrice')}</TableHead>
              <TableHead className="text-right">{t('TokenExplorer.headerVolume24h')}</TableHead>
              <TableHead className="text-right">{t('NftsPage.uniqueHolders')}</TableHead>
              <TableHead className="text-right">{t('NftsPage.totalSupply')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => (
              <TableRow key={collection.rank}>
                <TableCell className="text-center font-medium text-muted-foreground">
                  {collection.rank}
                </TableCell>
                <TableCell>
                   <Link href={`https://opensea.io/collection/${(collection.collection_name || '').replace(/\s+/g, '-').toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <Image
                      src={collection.collection_logo || 'https://placehold.co/40x40.png'}
                      alt={collection.collection_name || 'NFT Collection'}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold group-hover:underline">{collection.collection_name || 'Unnamed Collection'}</span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {collection.statistics_24h?.floor_price?.toFixed(2) ?? 'N/A'} ETH
                </TableCell>
                <TableCell className="text-right font-mono">
                    <FormattedCurrency value={collection.statistics_24h?.volume} currency={currency} isEth={currency.symbol === 'ETH'} />
                </TableCell>
                 <TableCell className="text-right font-mono">
                  {collection.distinct_owners?.toLocaleString() ?? 'N/A'}
                </TableCell>
                 <TableCell className="text-right font-mono">
                  {collection.total_supply?.toLocaleString() ?? 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
