
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NftCollection } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function NftsPanels({ collections }: { collections: NftCollection[] }) {
  const router = useRouter();

  const handlePanelClick = (collectionUrl: string) => {
    window.open(collectionUrl, '_blank');
  };

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {collections.map((collection) => (
            <Card key={collection.id} onClick={() => handlePanelClick(collection.url)} className="cursor-pointer hover:border-primary transition-colors flex flex-col">
                <CardHeader className="p-0">
                   <Image
                        src={collection.logo}
                        alt={collection.name}
                        width={400}
                        height={400}
                        className="rounded-t-lg aspect-square object-cover"
                    />
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col justify-end">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{collection.name}</span>
                        {collection.isVerified && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                    </div>
                     <div className="text-sm text-muted-foreground">
                        Floor: {(collection.floorPrice || 0).toFixed(2)} ETH
                     </div>
                </CardContent>
            </Card>
        ))}
      </div>
  );
}
