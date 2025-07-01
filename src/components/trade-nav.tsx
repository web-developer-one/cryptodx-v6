'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TradeNav() {
  const pathname = usePathname();
  const activeTabClass = "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground";

  return (
    <div className="w-full max-w-md">
        <Tabs value={pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="/" asChild className={activeTabClass}>
                    <Link href="/">Swap</Link>
                </TabsTrigger>
                <TabsTrigger value="/limit" asChild className={activeTabClass}>
                    <Link href="/limit">Limit</Link>
                </TabsTrigger>
                <TabsTrigger value="/buy" asChild className={activeTabClass}>
                    <Link href="/buy">Buy</Link>
                </TabsTrigger>
                <TabsTrigger value="/sell" asChild className={activeTabClass}>
                    <Link href="/sell">Sell</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    </div>
  );
}
