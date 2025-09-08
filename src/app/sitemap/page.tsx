'use client';

import { useLanguage } from '@/hooks/use-language';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const siteSections = [
  {
    title: 'TradeNav.swap',
    links: [
      { name: 'TradeNav.swap', href: '/' },
      { name: 'TradeNav.limit', href: '/limit' },
      { name: 'TradeNav.buy', href: '/buy' },
      { name: 'TradeNav.sell', href: '/sell' },
    ],
  },
  {
    title: 'ExploreNav.title',
    links: [
      { name: 'ExploreNav.tokens', href: '/tokens' },
      { name: 'ExploreNav.pools', href: '/pools' },
      { name: 'ExploreNav.transactions', href: '/transactions' },
      { name: 'PageTitles.nfts', href: '/nfts' },
      { name: 'PageTitles.tradingBot', href: '/tradingbot' },
    ],
  },
  {
    title: 'Header.positions',
    links: [
      { name: 'PositionsNav.yourPositions', href: '/positions' },
      { name: 'PositionsNav.addLiquidity', href: '/pools/add' },
    ],
  },
  {
      title: 'Footer.site',
      links: [
          { name: 'PageTitles.pricing', href: '/pricing' },
          { name: 'PageTitles.login', href: '/login' },
          { name: 'PageTitles.register', href: '/register' },
      ]
  }
];

export default function SiteMapPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.sitemap');
  }, [t]);

  return (
    <div className="container flex-1 flex flex-col items-center py-12">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl">{t('PageTitles.sitemap')}</CardTitle>
          <CardDescription>
            A complete overview of all pages available on CryptoDx.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {siteSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="font-semibold text-lg">{t(section.title)}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {t(link.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
