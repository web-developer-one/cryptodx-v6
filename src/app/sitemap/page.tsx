'use client';

import { useLanguage } from '@/hooks/use-language';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRightLeft, Compass, Briefcase, User, Map, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { useWallet } from '@/hooks/use-wallet';

const siteSections = [
  {
    title: 'TradeNav.swap',
    icon: <ArrowRightLeft className="h-6 w-6 text-primary" />,
    links: [
      { name: 'TradeNav.swap', href: '/' },
      { name: 'TradeNav.limit', href: '/limit' },
      { name: 'TradeNav.buy', href: '/buy' },
      { name: 'TradeNav.sell', href: '/sell' },
    ],
  },
  {
    title: 'ExploreNav.title',
    icon: <Compass className="h-6 w-6 text-primary" />,
    links: [
      { name: 'ExploreNav.tokens', href: '/tokens' },
      { name: 'ExploreNav.pools', href: '/pools' },
      { name: 'ExploreNav.transactions', href: '/transactions' },
      { name: 'PageTitles.nfts', href: '/nfts' },
      { name: 'PageTitles.tradingBot', href: '/tradingbot', requiresAuth: true },
      { name: 'PageTitles.dashboard', href: '/dashboard', requiresWallet: true },
    ],
  },
  {
    title: 'Header.positions',
    icon: <Briefcase className="h-6 w-6 text-primary" />,
    links: [
      { name: 'PositionsNav.yourPositions', href: '/positions' },
      { name: 'PositionsNav.addLiquidity', href: '/pools/add' },
    ],
  },
  {
      title: 'Footer.site',
      icon: <User className="h-6 w-6 text-primary" />,
      links: [
          { name: 'PageTitles.pricing', href: '/pricing' },
          { name: 'PageTitles.login', href: '/login' },
          { name: 'PageTitles.register', href: '/register' },
          { name: 'PageTitles.profile', href: '/profile', requiresAuth: true },
          { name: 'PageTitles.users', href: '/users', requiresAdmin: true },
      ]
  }
];

export default function SiteMapPage() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useUser();
  const { isActive: isWalletConnected } = useWallet();

  useEffect(() => {
    document.title = t('PageTitles.sitemap');
  }, [t]);

  return (
    <div className="container flex-1 flex flex-col items-center py-12">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center items-center">
          <Map className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl">{t('PageTitles.sitemap')}</CardTitle>
          <CardDescription>
            A complete overview of all pages available on CryptoDx.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {siteSections.map((section) => (
              <div key={section.title} className="space-y-4 rounded-lg border p-4">
                <h3 className="font-bold text-xl flex items-center gap-3">
                    {section.icon}
                    {t(section.title)}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => {
                    const isAdmin = user?.pricePlan === 'Administrator';
                    if ((link.requiresAuth && !isAuthenticated) || (link.requiresWallet && !isWalletConnected) || (link.requiresAdmin && !isAdmin)) {
                        return null;
                    }
                    return (
                        <li key={link.href}>
                        <Link
                            href={link.href}
                            className={cn(
                                "flex items-center justify-between rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                            )}
                        >
                            <span>{t(link.name)}</span>
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                        </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
