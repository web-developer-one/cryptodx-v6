
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
import Link from 'next/link';

const FormattedCurrency = ({ value, currency }: { value: string | number | null | undefined; currency: SelectedCurrency }) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (numericValue === null || numericValue === undefined || isNaN(numericValue)) {
        return <>N/A</>;
    }
    const convertedValue = numericValue * currency.rate;
    return <>{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.symbol, notation: 'compact', maximumFractionDigits: 2, }).format(convertedValue)}</>
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
              <TableHead className="text-right">{t('TokenExplorer.headerMarketCap')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => (
              <TableRow key={collection.rank}>
                <TableCell className="text-center font-medium text-muted-foreground">
                  {collection.rank}
                </TableCell>
                <TableCell>
                   <Link href={`https://opensea.io/collection/${(collection.collection_title || '').replace(/\s+/g, '-').toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <Image
                      src={collection.collection_image ? collection.collection_image : 'https://placehold.co/40x40.png'}
                      alt={collection.collection_title || 'NFT Collection'}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold group-hover:underline">{collection.collection_title || 'Unnamed Collection'}</span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {collection.floor_price ? `${parseFloat(collection.floor_price).toFixed(4)} ETH` : 'N/A'}
                </TableCell>
                 <TableCell className="text-right font-mono">
                    <FormattedCurrency value={collection.volume_usd} currency={currency} />
                </TableCell>
                <TableCell className="text-right font-mono">
                    <FormattedCurrency value={collection.market_cap_usd} currency={currency} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
