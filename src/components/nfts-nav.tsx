
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/use-language';

export function NftsNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="mb-6 flex justify-center">
      <div className="w-full max-w-lg">
        <Tabs value={pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="/nfts" asChild>
                    <Link href="/nfts">{t('TokenExplorer.listView')}</Link>
                </TabsTrigger>
                <TabsTrigger value="/nfts/panels" asChild>
                    <Link href="/nfts/panels">{t('TokenExplorer.panelView')}</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
