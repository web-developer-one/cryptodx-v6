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
      { name: "Our Blog", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Use", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-secondary/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Column 1: Site Info */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <Repeat className="h-8 w-8 text-primary" />
              <span className="font-bold text-lg">Crypto Swap</span>
            </Link>
          </div>

          {/* The other columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h4 className="font-semibold text-base">{section.title}</h4>
              <ul className="flex flex-col gap-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Crypto Swap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
