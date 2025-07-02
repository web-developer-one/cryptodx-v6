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
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next-intl/client";
import { useParams } from "next/navigation";


export function Header({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const menuItems = [
    {
      name: t("trade"),
      icon: ArrowRightLeft,
      children: [
        { name: "Swap", href: "/" },
        { name: "Limit", href: "/limit" },
        { name: "Buy", href: "/buy" },
        { name: "Sell", href: "/sell" },
      ],
    },
    {
      name: t("explore"),
      icon: Compass,
      children: [
        { name: "Tokens", href: "/tokens" },
        { name: "Pools", href: "/pools" },
        { name: "Transactions", href: "/transactions" },
      ],
    },
    {
      name: t("positions"),
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
  
  const languages = [
    { name: 'English', code: 'en' }, { name: 'Español', code: 'es' },
    { name: 'Français', code: 'fr' }, { name: 'Deutsch', code: 'de' },
    { name: 'Italiano', code: 'it' }, { name: 'Português', code: 'pt' },
    { name: 'Русский', code: 'ru' }, { name: '日本語', code: 'ja' },
    { name: '中文 (简体)', code: 'zh-CN' }, { name: '한국어', code: 'ko' },
    { name: 'العربية', code: 'ar' }, { name: 'हिन्दी', code: 'hi' },
    { name: 'Bengali', code: 'bn' }, { name: 'Indonesian', code: 'id' },
    { name: 'Dutch', code: 'nl' }, { name: 'Turkish', code: 'tr' },
    { name: 'Polish', code: 'pl' }, { name: 'Swedish', code: 'sv' },
    { name: 'Vietnamese', code: 'vi' }, { name: 'Thai', code: 'th' },
    { name: 'Greek', code: 'el' }, { name: 'Hebrew', code: 'he' },
    { name: 'Czech', code: 'cs' }, { name: 'Romanian', code: 'ro' },
    { name: 'Ukrainian', code: 'uk' },
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
  const selectedLanguage = languages.find(lang => lang.code === params.locale) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    router.push(pathname, {locale: langCode});
  };
  
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
              {t("siteName")}
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
                    <span>{t('siteName')}</span>
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
          <Link href="/slippage" passHref>
              <Button variant="ghost" className="flex items-center gap-1.5 px-3 font-medium text-primary-foreground/90 transition-colors hover:bg-white/10 hover:text-primary-foreground">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('slippage')}</span>
              </Button>
          </Link>
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
            <Button variant="secondary">{t('connectWallet')}</Button>
          </WalletConnect>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground/90 transition-colors hover:bg-white/10 hover:text-primary-foreground">
                <Cog className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>{t('settings')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                <Label htmlFor="hide-small-balances" className="font-normal cursor-pointer">{t('hideSmallBalances')}</Label>
                <Switch
                  id="hide-small-balances"
                  checked={hideSmallBalances}
                  onCheckedChange={setHideSmallBalances}
                />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between">
                <Label htmlFor="hide-unknown-tokens" className="font-normal cursor-pointer">{t('hideUnknownTokens')}</Label>
                <Switch
                  id="hide-unknown-tokens"
                  checked={hideUnknownTokens}
                  onCheckedChange={setHideUnknownTokens}
                />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>{t('language')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <ScrollArea className="h-72">
                    {languages.map((lang) => (
                      <DropdownMenuItem key={lang.code} onSelect={() => handleLanguageChange(lang.code)}>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
               <DropdownMenuItem disabled>
                <div className="flex justify-between w-full text-xs">
                    <span>{t('selected')}:</span>
                    <span>{selectedLanguage.name}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-10 h-10 flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
