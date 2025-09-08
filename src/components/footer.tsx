
'use client';

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { CookiePolicyModal } from "./cookie-policy-modal";
import { PrivacyPolicyModal } from "./privacy-policy-modal";
import { TermsOfUseModal } from "./terms-of-use-modal";
import { SiteLogo } from "./site-logo";
import { useLanguage } from "@/hooks/use-language";
import { useUser } from "@/hooks/use-user";
import { useWallet } from "@/hooks/use-wallet";
import React from "react";

export function Footer() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useUser();
  const { isActive: isWalletConnected } = useWallet();
  const [year, setYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const footerSections = [
    {
      title: t('Footer.trade'),
      links: [
        { name: t('Footer.swap'), href: "/" },
        { name: t('Footer.limit'), href: "/limit" },
        { name: t('Footer.buy'), href: "/buy" },
        { name: t('Footer.sell'), href: "/sell" },
      ],
    },
    {
      title: t('Footer.explore'),
      links: [
        { name: t('Footer.tokens'), href: "/tokens" },
        { name: t('Footer.pools'), href: "/pools" },
        { name: t('Footer.transactions'), href: "/transactions" },
      ],
    },
    {
      title: t('Footer.positions'),
      links: [
        { name: t('Footer.viewPositions'), href: "/positions" },
        { name: t('Footer.createPosition'), href: "/pools/add" },
      ],
    },
    {
      title: t('Footer.site'),
      links: [
        { name: t('PageTitles.sitemap'), href: "/sitemap" },
        { name: t('Footer.pricing'), href: "/pricing" },
        { name: t('Footer.cookiePolicy'), href: "#" },
        { name: t('Footer.privacyPolicy'), href: "#" },
        { name: t('Footer.termsOfUse'), href: "#" },
      ],
    },
  ];
  
  return (
    <footer className="w-full border-t border-primary/50 bg-primary text-primary-foreground">
      <div className="container max-w-screen-2xl py-12">
        <div className="flex flex-col md:flex-row flex-wrap items-center md:items-start justify-center gap-x-24 gap-y-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center space-x-3">
              <SiteLogo className="h-8 w-8" />
              <span className="font-bold">{t('Header.siteName')}</span>
            </Link>
            <p className="text-sm text-primary-foreground/80 max-w-xs">
              {t('Footer.subtitle')}
            </p>
             <a
                href="https://cryptomx.co/blog/"
                className="text-sm text-primary-foreground underline hover:text-primary-foreground/80"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('Footer.blog')}
              </a>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col items-center gap-3">
              <h4 className="text-base font-semibold">{section.title}</h4>
              <ul className="flex flex-col items-center gap-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.name === t('Footer.cookiePolicy') ? (
                      <CookiePolicyModal />
                    ) : link.name === t('Footer.privacyPolicy') ? (
                      <PrivacyPolicyModal />
                    ) : link.name === t('Footer.termsOfUse') ? (
                      <TermsOfUseModal />
                    ) : (
                      <Link
                        href={link.href}
                        className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
                 {section.title === t('Footer.explore') && isAuthenticated && (
                    <li>
                        <Link href="/tradingbot" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">{t('PageTitles.tradingBot')}</Link>
                    </li>
                )}
                 {section.title === t('Footer.explore') && isWalletConnected && (
                    <li>
                        <Link href="/dashboard" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">{t('PageTitles.dashboard')}</Link>
                    </li>
                 )}
                 {section.title === t('Footer.site') && user?.pricePlan === 'Administrator' && (
                     <li>
                        <Link href="/users" className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">{t('PageTitles.users')}</Link>
                    </li>
                 )}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8 bg-primary-foreground/20" />
        <div className="flex flex-col items-center justify-center text-sm text-primary-foreground/80">
          <p>{t('Footer.copyright').replace('{year}', year.toString())}</p>
        </div>
      </div>
    </footer>
  );
}
