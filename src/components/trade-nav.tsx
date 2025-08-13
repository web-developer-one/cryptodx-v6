'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/use-language';

export function TradeNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-lg">
        <Tabs value={pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="/" asChild>
                    <Link href="/">{t('TradeNav.swap')}</Link>
                </TabsTrigger>
                <TabsTrigger value="/limit" asChild>
                    <Link href="/limit">{t('TradeNav.limit')}</Link>
                </TabsTrigger>
                <TabsTrigger value="/buy" asChild>
                    <Link href="/buy">{t('TradeNav.buy')}</Link>
                </TabsTrigger>
                <TabsTrigger value="/sell" asChild>
                    <Link href="/sell">{t('TradeNav.sell')}</Link>
                </TabsTrigger>
                 <TabsTrigger value="/changelly" asChild>
                    <Link href="/changelly">Changelly</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    </div>
  );
}
