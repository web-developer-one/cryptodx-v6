"use client";

import Link from "next/link";
import { Repeat, Menu, ArrowRightLeft, Compass, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function Header() {
  const menuItems = [
    { name: "Trade", href: "#", icon: ArrowRightLeft },
    { name: "Explore", href: "#", icon: Compass },
    { name: "Pool", href: "#", icon: Waves },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Repeat className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Crypto Swap
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 pt-12">
              <nav className="flex flex-col gap-6 text-lg font-medium">
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Repeat className="h-6 w-6 text-primary" />
                    <span>Crypto Swap</span>
                  </Link>
                  {menuItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-4 transition-colors hover:text-foreground/80 text-foreground/60"
                      >
                         <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <WalletConnect />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
