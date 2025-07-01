"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import {
  Menu,
  ArrowRightLeft,
  Compass,
  Briefcase,
  ChevronDown,
  SlidersHorizontal,
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
import type { Cryptocurrency } from "@/lib/types";
import { SiteLogo } from "./site-logo";

export function Header({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const menuItems = [
    {
      name: "Trade",
      icon: ArrowRightLeft,
      children: [
        { name: "Swap", href: "/" },
        { name: "Limit", href: "/limit" },
        { name: "Buy", href: "/buy" },
        { name: "Sell", href: "/sell" },
      ],
    },
    {
      name: "Explore",
      icon: Compass,
      children: [
        { name: "Tokens", href: "/tokens" },
        { name: "Pools", href: "/pools" },
        { name: "Transactions", href: "/transactions" },
      ],
    },
    {
      name: "Positions",
      icon: Briefcase,
      children: [
        { name: "View Positions", href: "/positions" },
        { name: "Create Positions", href: "/pools/add" },
      ],
    },
  ];

  const networkOptions = [
    { name: 'Ethereum', symbol: 'ETH' },
    { name: 'Solana', symbol: 'SOL' },
    { name: 'Polygon', symbol: 'MATIC' },
    { name: 'BNB Chain', symbol: 'BNB' },
  ];

  const networks = React.useMemo(() => {
    return networkOptions.map(opt => {
      const crypto = (cryptocurrencies || []).find(c => c.symbol === opt.symbol);
      return {
        name: opt.name,
        symbol: opt.symbol,
        logo: crypto?.logo || 'https://placehold.co/20x20.png',
      };
    });
  }, [cryptocurrencies]);

  const [selectedNetwork, setSelectedNetwork] = React.useState(networks[0]);
  
  React.useEffect(() => {
    // If cryptocurrencies load after initial render, update selected network
    if (networks.length > 0 && selectedNetwork.logo.includes('placehold')) {
        setSelectedNetwork(networks[0]);
    }
  }, [networks, selectedNetwork]);


  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-foreground/10 bg-primary text-primary-foreground">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <SiteLogo className="h-8 w-8" />
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
                    className="flex items-center gap-1.5 px-3 font-medium text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
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
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r-primary-foreground/10 bg-primary pr-0 pt-12 text-primary-foreground">
              <nav className="flex flex-col gap-2 text-lg font-medium">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="mb-4 flex items-center gap-3 pl-4 text-lg font-semibold"
                  >
                    <SiteLogo className="h-8 w-8" />
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
                      <AccordionTrigger className="rounded-md px-2 py-3 text-base font-medium hover:bg-primary-foreground/10 hover:no-underline [&[data-state=open]]:bg-primary-foreground/10">
                        <div className="flex items-center gap-4">
                          <item.icon className="h-5 w-5 text-primary-foreground/60" />
                          <span className="text-primary-foreground/80">
                            {item.name}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-3 pb-2 pl-10 pt-2">
                        {item.children.map((child) => (
                          <SheetClose asChild key={child.name}>
                            <Link
                              href={child.href}
                              className="text-base text-primary-foreground/60 hover:text-primary-foreground"
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
          <Link href="/slippage" passHref>
              <Button variant="ghost" className="flex items-center gap-1.5 px-3 font-medium text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Slippage</span>
              </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 px-3 font-medium text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Image
                  src={selectedNetwork.logo}
                  alt={`${selectedNetwork.name} logo`}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="hidden sm:inline">{selectedNetwork.name}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {networks.map((network) => (
                <DropdownMenuItem
                  key={network.name}
                  onClick={() => setSelectedNetwork(network)}
                >
                  <Image
                    src={network.logo}
                    alt={`${network.name} logo`}
                    width={20}
                    height={20}
                    className="mr-2 rounded-full"
                  />
                  {network.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <WalletConnect>
            <Button variant="secondary">Connect Wallet</Button>
          </WalletConnect>
          <ThemeToggle className="hover:bg-primary-foreground/10"/>
        </div>
      </div>
    </header>
  );
}
