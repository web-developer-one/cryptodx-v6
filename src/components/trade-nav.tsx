
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TradeNav() {
  const pathname = usePathname();
  const activeClass = "data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:bg-background dark:data-[state=active]:text-foreground";


  return (
    <div className="w-full max-w-md">
        <Tabs value={pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="/" asChild className={activeClass}>
                    <Link href="/">Swap</Link>
                </TabsTrigger>
                <TabsTrigger value="/limit" asChild className={activeClass}>
                    <Link href="/limit">Limit</Link>
                </TabsTrigger>
                <TabsTrigger value="/buy" asChild className={activeClass}>
                    <Link href="/buy">Buy</Link>
                </TabsTrigger>
                <TabsTrigger value="/sell" asChild className={activeClass}>
                    <Link href="/sell">Sell</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    </div>
  );
}
