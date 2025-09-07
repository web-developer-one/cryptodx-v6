

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NftCollection, SelectedCurrency } from '@/lib/types';
import { useEffect, useState } from 'react';


const FormattedFloorPrice = ({ collection, currency }: { collection: NftCollection, currency: SelectedCurrency }) => {
    const [formatted, setFormatted] = useState<string>('N/A');

    useEffect(() => {
        const floorPriceUsd = parseFloat(collection.floor_price_usd);
        if (isNaN(floorPriceUsd)) {
            setFormatted('N/A');
            return;
        }
        
        const convertedValue = floorPriceUsd * currency.rate;

        // Check if the currency is a well-known FIAT by symbol, otherwise assume crypto
        const isFiat = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'].includes(currency.symbol);

        if (isFiat) {
            setFormatted(
                new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: currency.symbol,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(convertedValue)
            );
        } else {
             // It's a crypto currency, show with symbol
            setFormatted(`${convertedValue.toLocaleString('en-US', {maximumFractionDigits: 4})} ${currency.symbol}`);
        }

    }, [collection, currency]);

    return <>{formatted}</>;
}


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
                <CardHeader className="p-0 overflow-hidden">
                     <div className="p-6 bg-secondary/30 rounded-t-md">
                        <div className="aspect-square relative overflow-hidden rounded-md">
                             <Image
                                src={imageUrl}
                                alt={collection.collection_title || 'NFT Collection'}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-2 flex-1 flex flex-col justify-between">
                    <div>
                        <span className="font-semibold truncate text-sm block leading-tight">{collection.collection_title || 'Unnamed Collection'}</span>
                    </div>
                     <div className="text-xs text-muted-foreground pt-1">
                        Floor: <span className="font-semibold text-foreground"><FormattedFloorPrice collection={collection} currency={currency} /></span>
                     </div>
                </CardContent>
            </Card>
        )})}
      </div>
  );
}


