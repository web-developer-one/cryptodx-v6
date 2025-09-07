
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NftCollection, SelectedCurrency } from '@/lib/types';

export function NftsPanels({ collections, currency }: { collections: NftCollection[], currency: SelectedCurrency }) {
  const router = useRouter();

  const handlePanelClick = (collection: NftCollection) => {
     window.open(`https://opensea.io/collection/${(collection.collection_title || '').replace(/\s+/g, '-').toLowerCase()}`, '_blank');
  };

  return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {collections.map((collection) => {
          const imageUrl = collection.collection_image && collection.collection_image !== 'missing_small.png' ? collection.collection_image : 'https://placehold.co/300x300.png';
          return (
            <Card key={collection.rank} onClick={() => handlePanelClick(collection)} className="cursor-pointer hover:border-primary transition-colors flex flex-col group overflow-hidden">
                <CardHeader className="p-4 overflow-hidden">
                   <Image
                        src={imageUrl}
                        alt={collection.collection_title || 'NFT Collection'}
                        width={300}
                        height={300}
                        className="rounded-md aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </CardHeader>
                <CardContent className="p-3 pt-0 flex-1 flex flex-col justify-between">
                    <div>
                        <span className="font-semibold truncate text-sm block">{collection.collection_title || 'Unnamed Collection'}</span>
                    </div>
                     <div className="text-xs text-muted-foreground pt-1">
                        Floor: {collection.floor_price ? `${parseFloat(collection.floor_price).toFixed(2)} ETH` : 'N/A'}
                     </div>
                </CardContent>
            </Card>
        )})}
      </div>
  );
}
