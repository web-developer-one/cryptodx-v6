
'use client';

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { CookiePolicyModal } from "./cookie-policy-modal";
import { PrivacyPolicyModal } from "./privacy-policy-modal";
import { TermsOfUseModal } from "./terms-of-use-modal";
import { SiteLogo } from "./site-logo";
import { useLanguage } from "@/hooks/use-language";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

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
        { name: "Pricing", href: "/pricing" },
        { name: t('Footer.blog'), href: "https://cryptomx.co/blog/" },
        { name: t('Footer.cookiePolicy'), href: "#" },
        { name: t('Footer.privacyPolicy'), href: "#" },
        { name: t('Footer.termsOfUse'), href: "#" },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-primary/50 bg-primary text-primary-foreground">
      <div className="container max-w-screen-2xl py-12">
        <div className="flex flex-row flex-wrap items-start justify-center gap-x-24 gap-y-8 text-center">
          {/* Column 1: Site Info */}
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center space-x-3">
              <SiteLogo className="h-8 w-8" />
              <span className="font-bold">{t('Header.siteName')}</span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              {t('Footer.subtitle')}
            </p>
            <a
              href="/CryptoDx_Whitepaper.md"
              download="CryptoDx_Whitepaper.pdf"
              className="text-sm text-primary-foreground/80 underline hover:text-primary-foreground mt-2"
            >
              Download our Whitepaper
            </a>
          </div>

          {/* The other columns */}
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
                    ) : link.name === t('Footer.blog') ? (
                      <Link
                        href={link.href}
                        className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.name}
                      </Link>
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
