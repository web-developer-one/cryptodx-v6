'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ExploreNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex justify-center">
        <Tabs value={pathname} className="w-auto">
            <TabsList>
                <Link href="/tokens" passHref>
                    <TabsTrigger value="/tokens">Tokens</TabsTrigger>
                </Link>
                <Link href="/pools" passHref>
                    <TabsTrigger value="/pools">Pools</TabsTrigger>
                </Link>
                <Link href="/transactions" passHref>
                    <TabsTrigger value="/transactions">Transactions</TabsTrigger>
                </Link>
            </TabsList>
        </Tabs>
    </div>
  );
}
