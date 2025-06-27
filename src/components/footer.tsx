import Link from "next/link";
import { Repeat } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerSections = [
  {
    title: "Trade",
    links: [
      { name: "Swap", href: "/" },
      { name: "Limit", href: "#" },
      { name: "Buy", href: "#" },
      { name: "Sell", href: "#" },
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
      { name: "View Positions", href: "#" },
      { name: "Create Position", href: "#" },
    ],
  },
  {
    title: "Spot",
    links: [
      { name: "Slippage", href: "#" },
      { name: "Changelly", href: "#" },
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
    <footer className="w-full border-t border-primary-foreground/10 bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          {/* Column 1: Site Info */}
          <div className="col-span-2 flex flex-col items-start gap-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Repeat className="h-8 w-8" />
              <span className="text-lg font-bold">Crypto Swap</span>
            </Link>
            <p className="text-sm text-primary-foreground/70">
              Seamlessly swap your favorite tokens.
            </p>
          </div>

          {/* The other columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h4 className="text-base font-semibold">{section.title}</h4>
              <ul className="flex flex-col gap-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8 bg-primary-foreground/10" />
        <div className="flex flex-col items-center justify-between text-sm text-primary-foreground/70 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Crypto Swap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
