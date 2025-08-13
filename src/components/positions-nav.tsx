
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/use-language';

export function PositionsNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <Tabs value={pathname} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="/positions" asChild>
                <Link href="/positions">{t('PositionsNav.yourPositions')}</Link>
            </TabsTrigger>
            <TabsTrigger value="/pools/add" asChild>
                <Link href="/pools/add">{t('PositionsNav.addLiquidity')}</Link>
            </TabsTrigger>
             <TabsTrigger value="/positions/moralis" asChild>
                <Link href="/positions/moralis">{t('PositionsNav.moralis')}</Link>
            </TabsTrigger>
        </TabsList>
    </Tabs>
  );
}
