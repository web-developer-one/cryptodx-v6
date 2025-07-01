'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ExploreNav() {
  const pathname = usePathname();
  // Ensure "Tokens" tab is active for both list and panel views.
  const activeTab = pathname.startsWith('/tokens') ? '/tokens' : pathname;
  const activeClass = "data-[state=active]:bg-primary/10 data-[state=active]:text-primary";

  return (
    <div className="mb-6 flex justify-center">
      <div className="w-full max-w-lg">
        <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <Link href="/tokens" passHref>
                    <TabsTrigger value="/tokens" className={activeClass}>Tokens</TabsTrigger>
                </Link>
                <Link href="/pools" passHref>
                    <TabsTrigger value="/pools" className={activeClass}>Pools</TabsTrigger>
                </Link>
                <Link href="/transactions" passHref>
                    <TabsTrigger value="/transactions" className={activeClass}>Transactions</TabsTrigger>
                </Link>
            </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
