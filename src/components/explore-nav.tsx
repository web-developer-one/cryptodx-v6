'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ExploreNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex justify-center">
      <div className="w-full max-w-lg">
        <Tabs value={pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <Link href="/tokens" passHref>
                    <TabsTrigger value="/tokens">List View</TabsTrigger>
                </Link>
                <Link href="/tokens/panels" passHref>
                    <TabsTrigger value="/tokens/panels">Panel View</TabsTrigger>
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
    </div>
  );
}
