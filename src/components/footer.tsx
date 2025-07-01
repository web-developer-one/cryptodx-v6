import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { CookiePolicyModal } from "./cookie-policy-modal";
import { PrivacyPolicyModal } from "./privacy-policy-modal";
import { TermsOfUseModal } from "./terms-of-use-modal";
import { SiteLogo } from "./site-logo";

const footerSections = [
  {
    title: "Trade",
    links: [
      { name: "Swap", href: "/" },
      { name: "Limit", href: "/limit" },
      { name: "Buy", href: "/buy" },
      { name: "Sell", href: "/sell" },
    ],
  },
  {
    title: "Explore",
    links: [
      { name: "Tokens", href: "/tokens" },
      { name: "Pools", href: "/pools" },
      { name: "Transactions", href: "/transactions" },
    ],
  },
  {
    title: "Positions",
    links: [
      { name: "View Positions", href: "/positions" },
      { name: "Create Position", href: "/pools/add" },
    ],
  },
  {
    title: "Site",
    links: [
      { name: "Our Blog", href: "https://cryptomx.co/blog/" },
      { name: "Cookie Policy", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Use", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/50 bg-primary text-primary-foreground">
      <div className="container max-w-screen-2xl py-12">
        <div className="flex flex-row flex-wrap items-start justify-center gap-x-24 gap-y-8 text-center">
          {/* Column 1: Site Info */}
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center space-x-3">
              <SiteLogo className="h-8 w-8" />
              <span className="font-bold">CryptoDx</span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Seamlessly swap your favorite tokens.
            </p>
          </div>

          {/* The other columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col items-center gap-3">
              <h4 className="text-base font-semibold">{section.title}</h4>
              <ul className="flex flex-col items-center gap-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.name === "Cookie Policy" ? (
                      <CookiePolicyModal />
                    ) : link.name === "Privacy Policy" ? (
                      <PrivacyPolicyModal />
                    ) : link.name === "Terms of Use" ? (
                      <TermsOfUseModal />
                    ) : link.name === "Our Blog" ? (
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
          <p>&copy; {new Date().getFullYear()} CryptoDx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
