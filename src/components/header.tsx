"use client";

import Link from "next/link";
import {
  Repeat,
  Menu,
  ArrowRightLeft,
  Compass,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Header() {
  const menuItems = [
    {
      name: "Trade",
      icon: ArrowRightLeft,
      children: [
        { name: "Swap", href: "#" },
        { name: "Limit", href: "#" },
        { name: "Buy", href: "#" },
        { name: "Sell", href: "#" },
      ],
    },
    {
      name: "Explore",
      icon: Compass,
      children: [
        { name: "Tokens", href: "#" },
        { name: "Pools", href: "#" },
        { name: "Transactions", href: "#" },
      ],
    },
    {
      name: "Positions",
      icon: Briefcase,
      children: [
        { name: "View Positions", href: "#" },
        { name: "Create Positions", href: "#" },
      ],
    },
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
          <nav className="flex items-center gap-2 text-sm">
            {menuItems.map((item) => (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 transition-colors hover:text-foreground/80 text-foreground/60 font-medium px-3"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.name} asChild>
                      <Link href={child.href}>{child.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
              <nav className="flex flex-col gap-2 text-lg font-medium">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold mb-4 pl-4"
                  >
                    <Repeat className="h-6 w-6 text-primary" />
                    <span>Crypto Swap</span>
                  </Link>
                </SheetClose>
                <Accordion type="multiple" className="w-full px-2">
                  {menuItems.map((item) => (
                    <AccordionItem
                      value={item.name}
                      key={item.name}
                      className="border-b-0"
                    >
                      <AccordionTrigger className="py-3 px-2 text-base font-medium hover:no-underline hover:bg-accent/50 rounded-md [&[data-state=open]]:bg-accent/50">
                        <div className="flex items-center gap-4">
                          <item.icon className="h-5 w-5 text-foreground/60" />
                          <span className="text-foreground/80">
                            {item.name}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-10 pt-2 pb-2 flex flex-col gap-3">
                        {item.children.map((child) => (
                          <SheetClose asChild key={child.name}>
                            <Link
                              href={child.href}
                              className="text-base text-foreground/60 hover:text-foreground/80"
                            >
                              {child.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
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
