'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PositionsNav() {
  const pathname = usePathname();

  return (
    <Tabs value={pathname} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="/positions" asChild>
                <Link href="/positions">Your Positions</Link>
            </TabsTrigger>
            <TabsTrigger value="/pools" asChild>
                <Link href="/pools">Add Liquidity</Link>
            </TabsTrigger>
        </TabsList>
    </Tabs>
  );
}
