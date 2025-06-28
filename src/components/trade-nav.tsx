
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TradeNav() {
  const pathname = usePathname();

  return (
    <div className="w-full max-w-md">
        <Tabs value={pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="/" asChild>
                    <Link href="/">Swap</Link>
                </TabsTrigger>
                <TabsTrigger value="/limit" asChild>
                    <Link href="/limit">Limit</Link>
                </TabsTrigger>
                <TabsTrigger value="/buy" asChild>
                    <Link href="/buy">Buy</Link>
                </TabsTrigger>
                <TabsTrigger value="/sell" asChild>
                    <Link href="/sell">Sell</Link>
                </TabsTrigger>
                <TabsTrigger value="/spot" asChild>
                    <Link href="/spot">Spot</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    </div>
  );
}
