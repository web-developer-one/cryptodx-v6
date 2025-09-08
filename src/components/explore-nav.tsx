'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/use-language';

export function ExploreNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  // Ensure "Tokens" tab is active for both list and panel views.
  const activeTab = pathname.startsWith('/tokens') ? '/tokens' : pathname;

  return (
    <div className="mb-6 flex justify-center">
      <div className="w-full max-w-lg">
        <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <Link href="/tokens" passHref>
                    <TabsTrigger value="/tokens">{t('ExploreNav.tokens')}</TabsTrigger>
                </Link>
                <Link href="/pools" passHref>
                    <TabsTrigger value="/pools">{t('ExploreNav.pools')}</TabsTrigger>
                </Link>
                <Link href="/transactions" passHref>
                    <TabsTrigger value="/transactions">{t('ExploreNav.transactions')}</TabsTrigger>
                </Link>
            </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
