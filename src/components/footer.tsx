
'use client';

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { CookiePolicyModal } from "./cookie-policy-modal";
import { PrivacyPolicyModal } from "./privacy-policy-modal";
import { TermsOfUseModal } from "./terms-of-use-modal";
import { SiteLogo } from "./site-logo";
import { useLanguage } from "@/hooks/use-language";
import { useUser } from "@/hooks/use-user";

export function Footer() {
  const { t } = useLanguage();
  const { user } = useUser();
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
        { name: t('Footer.blog'), href: "https://cryptomx.co/blog/" },
        { name: t('Footer.pricing'), href: "/pricing" },
        { name: t('Footer.cookiePolicy'), href: "#" },
        { name: t('Footer.privacyPolicy'), href: "#" },
        { name: t('Footer.termsOfUse'), href: "#" },
      ],
    },
  ];
  
  const siteLinks = footerSections.find(s => s.title === t('Footer.site'))?.links || [];
  if (user?.pricePlan === 'Administrator') {
      const usersLinkExists = siteLinks.some(link => link.name === t('PageTitles.users'));
      if (!usersLinkExists) {
        // Insert after pricing
        const pricingIndex = siteLinks.findIndex(link => link.name === t('Footer.pricing'));
        siteLinks.splice(pricingIndex + 1, 0, { name: t('PageTitles.users'), href: "/users" });
      }
  }

  return (
    <footer className="w-full border-t border-primary/50 bg-primary text-primary-foreground">
      <div className="container max-w-screen-2xl py-12">
        <div className="flex flex-col items-center justify-center gap-y-8 text-center md:flex-row md:items-start md:justify-around">
          {/* Column 1: Site Info */}
          <div className="flex flex-col items-center gap-4 md:items-start md:text-left">
            <Link href="/" className="flex items-center space-x-3">
              <SiteLogo className="h-8 w-8" />
              <span className="font-bold">{t('Header.siteName')}</span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              {t('Footer.subtitle')}
            </p>
          </div>

          {/* The other columns */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-center sm:grid-cols-4 md:text-left">
            {footerSections.filter(s => s.title !== t('Footer.site')).map((section) => (
              <div key={section.title} className="flex flex-col items-center gap-3 md:items-start">
                <h4 className="text-base font-semibold">{section.title}</h4>
                <ul className="flex flex-col items-center gap-2 text-sm md:items-start">
                  {(section.title === t('Footer.site') ? siteLinks : section.links).map((link) => (
                    <li key={link.name}>
                      {link.name === t('Footer.cookiePolicy') ? (
                        <CookiePolicyModal />
                      ) : link.name === t('Footer.privacyPolicy') ? (
                        <PrivacyPolicyModal />
                      ) : link.name === t('Footer.termsOfUse') ? (
                        <TermsOfUseModal />
                      ) : link.name === 'Moralis Swap' ? (
                         <Link
                            href={link.href}
                            className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                          >
                            {link.name}
                          </Link>
                      ): link.name === t('Footer.blog') ? (
                        <a
                          href={link.href}
                          className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.name}
                        </a>
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
             {/* Site links as a separate block for alignment */}
             <div className="flex flex-col items-center gap-3 md:items-start">
                <h4 className="text-base font-semibold">{t('Footer.site')}</h4>
                <ul className="flex flex-col items-center gap-2 text-sm md:items-start">
                    {siteLinks.map((link) => (
                         <li key={link.name}>
                         {link.name === t('Footer.cookiePolicy') ? (
                           <CookiePolicyModal />
                         ) : link.name === t('Footer.privacyPolicy') ? (
                           <PrivacyPolicyModal />
                         ) : link.name === t('Footer.termsOfUse') ? (
                           <TermsOfUseModal />
                         ) : link.name === t('Footer.blog') ? (
                            <a
                                href={link.href}
                                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {link.name}
                            </a>
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
          </div>
        </div>
        <Separator className="my-8 bg-primary-foreground/20" />
        <div className="flex flex-col items-center justify-center text-sm text-primary-foreground/80">
          <p>{t('Footer.copyright').replace('{year}', year.toString())}</p>
        </div>
      </div>
    </footer>
  );
}
