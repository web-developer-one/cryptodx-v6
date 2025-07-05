
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
  Cog,
  Loader2,
  Check,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  EyeOff,
  ShieldX,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { useReputation } from "@/hooks/use-reputation";
import { useLanguage } from "@/hooks/use-language";
import { languages } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAvatarById } from "./user-avatar-selector";


export function Header({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const { t, language, setLanguage, isLoading: isTranslating } = useLanguage();
  const { user, logout } = useAuth();

  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const menuItems = [
    {
      name: t('Header.trade'),
      icon: ArrowRightLeft,
      children: [
        { name: t('Footer.swap'), href: "/" },
        { name: t('Footer.limit'), href: "/limit" },
        { name: t('Footer.buy'), href: "/buy" },
        { name: t('Footer.sell'), href: "/sell" },
      ],
    },
    {
      name: t('Header.explore'),
      icon: Compass,
      children: [
        { name: t('Footer.tokens'), href: "/tokens" },
        { name: t('Footer.pools'), href: "/pools" },
        { name: t('Footer.transactions'), href: "/transactions" },
        { name: "Pricing", href: "/pricing" },
      ],
    },
    {
      name: t('Header.positions'),
      icon: Briefcase,
      children: [
        { name: t('Footer.viewPositions'), href: "/positions" },
        { name: t('Footer.createPosition'), href: "/pools/add" },
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
  const [hideSmallBalances, setHideSmallBalances] = React.useState(false);
  const [hideUnknownTokens, setHideUnknownTokens] = React.useState(true);
  const { isReputationCheckEnabled, toggleReputationCheck } = useReputation();
  
  React.useEffect(() => {
    // If cryptocurrencies load after initial render, update selected network
    if (networks.length > 0 && selectedNetwork.logo.includes('placehold')) {
        setSelectedNetwork(networks[0]);
    }
  }, [networks, selectedNetwork]);


  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/50 bg-primary text-primary-foreground">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <SiteLogo className="h-8 w-8" />
            <span className="hidden font-bold sm:inline-block">
              {t('Header.siteName')}
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {menuItems.map((item) => (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 px-3 font-medium text-primary-foreground/90 transition-colors hover:bg-white/10 hover:text-primary-foreground"
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
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r-border bg-card pr-0 pt-12 text-card-foreground">
              <nav className="flex flex-col gap-2 text-lg font-medium">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="mb-4 flex items-center gap-3 pl-4 text-lg font-semibold"
                  >
                    <SiteLogo className="h-8 w-8" />
                    <span>{t('Header.siteName')}</span>
                  </Link>
                </SheetClose>
                <Accordion type="multiple" className="w-full px-2">
                  {menuItems.map((item) => (
                    <AccordionItem
                      value={item.name}
                      key={item.name}
                      className="border-b-0"
                    >
                      <AccordionTrigger className="rounded-md px-2 py-3 text-base font-medium hover:bg-accent hover:no-underline [&[data-state=open]]:bg-accent">
                        <div className="flex items-center gap-4">
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground/80">
                            {item.name}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-3 pb-2 pl-10 pt-2">
                        {item.children.map((child) => (
                          <SheetClose asChild key={child.name}>
                            <Link
                              href={child.href}
                              className="text-base text-muted-foreground hover:text-foreground"
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 px-3 font-medium text-primary-foreground/90 transition-colors hover:bg-white/10 hover:text-primary-foreground"
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
            <Button variant="secondary">{t('Header.connectWallet')}</Button>
          </WalletConnect>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-full w-full">
                    <Image
                        src={getAvatarById(user.avatar).src}
                        alt={user.firstName || ''}
                        fill
                        className="object-cover"
                        unoptimized={!!(getAvatarById(user.avatar) as any).unoptimized}
                    />
                    <AvatarFallback>
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Link href="/login">
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-full w-full">
                      <AvatarFallback><UserIcon /></AvatarFallback>
                    </Avatar>
                  </Button>
              </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground/90 transition-colors hover:bg-white/10 hover:text-primary-foreground">
                {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Cog className="h-5 w-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>{t('Header.settings')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                <Label htmlFor="theme-toggle" className="font-normal cursor-pointer flex items-center gap-2">
                    {theme === 'light' ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                    <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                </Label>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                  disabled={!mounted}
                />
              </DropdownMenuItem>
               <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                <Label htmlFor="reputation-alert" className="font-normal cursor-pointer flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{t('Header.reputationAlert')}</span>
                </Label>
                <Switch
                  id="reputation-alert"
                  checked={isReputationCheckEnabled}
                  onCheckedChange={toggleReputationCheck}
                />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                <Label htmlFor="hide-small-balances" className="font-normal cursor-pointer flex items-center gap-2">
                  <EyeOff className="h-4 w-4" />
                  <span>{t('Header.hideSmallBalances')}</span>
                </Label>
                <Switch
                  id="hide-small-balances"
                  checked={hideSmallBalances}
                  onCheckedChange={setHideSmallBalances}
                />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                <Label htmlFor="hide-unknown-tokens" className="font-normal cursor-pointer flex items-center gap-2">
                  <ShieldX className="h-4 w-4" />
                  <span>{t('Header.hideUnknownTokens')}</span>
                </Label>
                <Switch
                  id="hide-unknown-tokens"
                  checked={hideUnknownTokens}
                  onCheckedChange={setHideUnknownTokens}
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/slippage" className="cursor-pointer flex items-center">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <span>{t('Header.slippage')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages className="mr-2 h-4 w-4" />
                  <span>{t('Header.language')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <ScrollArea className="h-72">
                    {languages.map((lang) => (
                      <DropdownMenuItem key={lang.code} onSelect={() => setLanguage(lang.code)}>
                        <Check className={`mr-2 h-4 w-4 ${language === lang.code ? "opacity-100" : "opacity-0"}`} />
                        {lang.displayName}
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
