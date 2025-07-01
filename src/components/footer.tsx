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
    <footer className="w-full border-t border-border bg-[#f1fafd] text-foreground">
      <div className="container max-w-screen-2xl py-12">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-5 md:text-left">
          {/* Column 1: Site Info */}
          <div className="col-span-2 flex flex-col items-center gap-4 md:col-span-1 md:items-start">
            <Link href="/" className="flex items-center space-x-3">
              <SiteLogo className="h-8 w-8" />
              <span className="font-bold">CryptoDx</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Seamlessly swap your favorite tokens.
            </p>
          </div>

          {/* The other columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col items-center gap-3 md:items-start">
              <h4 className="text-base font-semibold">{section.title}</h4>
              <ul className="flex flex-col items-center gap-2 text-sm md:items-start">
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
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
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
        <Separator className="my-8 bg-border" />
        <div className="flex flex-col items-center justify-between text-sm text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} CryptoDx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
