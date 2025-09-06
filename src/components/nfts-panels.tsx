
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NftCollection, SelectedCurrency } from '@/lib/types';

export function NftsPanels({ collections }: { collections: NftCollection[], currency: SelectedCurrency }) {
  const router = useRouter();

  const handlePanelClick = (collection: NftCollection) => {
     window.open(`https://opensea.io/collection/${(collection.collection_title || '').replace(/\s+/g, '-').toLowerCase()}`, '_blank');
  };

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {collections.map((collection) => (
            <Card key={collection.rank} onClick={() => handlePanelClick(collection)} className="cursor-pointer hover:border-primary transition-colors flex flex-col">
                <CardHeader className="p-0">
                   <Image
                        src={collection.collection_image || 'https://placehold.co/400x400.png'}
                        alt={collection.collection_title || 'NFT Collection'}
                        width={400}
                        height={400}
                        className="rounded-t-lg aspect-square object-cover"
                    />
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold truncate">{collection.collection_title || 'Unnamed Collection'}</span>
                    </div>
                     <div className="text-sm text-muted-foreground">
                        Floor: {parseFloat(collection.floor_price).toFixed(2) ?? 'N/A'} ETH
                     </div>
                </CardContent>
            </Card>
        ))}
      </div>
  );
}
