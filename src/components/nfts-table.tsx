

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
import type { NftCollection } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function NftsTable({ collections }: { collections: NftCollection[] }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">{t('TokenExplorer.headerRank')}</TableHead>
              <TableHead>{t('NftsPage.collection')}</TableHead>
              <TableHead className="text-right">{t('NftsPage.transfers24h')}</TableHead>
              <TableHead className="text-right">{t('NftsPage.transfers7d')}</TableHead>
              <TableHead className="text-right">{t('NftsPage.uniqueHolders')}</TableHead>
              <TableHead className="text-right">{t('NftsPage.totalSupply')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection, index) => (
              <TableRow key={collection.id}>
                <TableCell className="text-center font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                   <Link href={collection.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <Image
                      src={collection.logo}
                      alt={collection.name}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold group-hover:underline">{collection.name}</span>
                        {collection.isVerified && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {collection.transfers24h.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono">
                   {collection.transfers7d.toLocaleString()}
                </TableCell>
                 <TableCell className="text-right font-mono">
                  {collection.uniqueHolders.toLocaleString()}
                </TableCell>
                 <TableCell className="text-right font-mono">
                  {collection.totalSupply.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
