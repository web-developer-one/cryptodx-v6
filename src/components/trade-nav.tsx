'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TradeNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex justify-center">
        <Tabs value={pathname} className="w-auto">
            <TabsList>
                <Link href="/" passHref>
                    <TabsTrigger value="/">Swap</TabsTrigger>
                </Link>
                <Link href="/limit" passHref>
                    <TabsTrigger value="/limit">Limit</TabsTrigger>
                </Link>
                <Link href="/buy" passHref>
                    <TabsTrigger value="/buy">Buy</TabsTrigger>
                </Link>
                <Link href="/sell" passHref>
                    <TabsTrigger value="/sell">Sell</TabsTrigger>
                </Link>
            </TabsList>
        </Tabs>
    </div>
  );
}
