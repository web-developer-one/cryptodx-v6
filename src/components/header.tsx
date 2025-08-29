

"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { useRouter } from "next/navigation";
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
  EyeOff,
  ShieldX,
  Languages,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet-connect";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
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
import { SiteLogo } from "./site-logo";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { useLanguage } from "@/hooks/use-language";
import { languages } from "@/lib/i18n";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useWallet, networkConfigs } from "@/hooks/use-wallet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

function SettingsContent({ isMobile = false }) {
    const { t, language, setLanguage, isLoading: isTranslating } = useLanguage();
    const { user } = useUser();

    const [mounted, setMounted] = React.useState(false);
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
    const [hideSmallBalances, setHideSmallBalances] = React.useState(false);
    const [hideUnknownTokens, setHideUnknownTokens] = React.useState(true);

    React.useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            setTheme(storedTheme);
        } else {
            setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (mounted) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            localStorage.setItem('theme', theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const Wrapper = isMobile ? 'div' : DropdownMenuContent;
    const Item = isMobile ? 'div' : DropdownMenuItem;
    const LabelComponent = isMobile ? Label : DropdownMenuLabel;
    const Separator = isMobile ? 'hr' : DropdownMenuSeparator;
    const Sub = isMobile ? Accordion : DropdownMenuSub;
    const SubTrigger = isMobile ? AccordionTrigger : DropdownMenuSubTrigger;
    const SubContent = isMobile ? AccordionContent : DropdownMenuSubContent;

    return (
        <Wrapper {...(isMobile ? { className: "p-4" } : { align: "end", className: "w-64" })}>
            <LabelComponent {...(isMobile ? {} : { asChild: true })}>
                <h3 className={cn("text-lg font-semibold", !isMobile && "px-2 py-1.5 text-sm")}>
                    {t('Header.settings')}
                </h3>
            </LabelComponent>
            <Separator className={cn(!isMobile && "-mx-1 my-1 h-px bg-muted")} />

            <div className="space-y-1">
                <Item className={cn("flex items-center justify-between", isMobile ? "py-2" : "")} onSelect={isMobile ? undefined : (e) => e.preventDefault()}>
                    <Label htmlFor="theme-toggle" className="font-normal cursor-pointer flex items-center gap-2">
                        {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span>{theme === 'light' ? t('Header.LightMode') : t('Header.DarkMode')}</span>
                    </Label>
                    <Switch id="theme-toggle" checked={theme === 'dark'} onCheckedChange={toggleTheme} disabled={!mounted} />
                </Item>
                <Item className={cn("flex items-center justify-between", isMobile ? "py-2" : "")} onSelect={isMobile ? undefined : (e) => e.preventDefault()}>
                    <Label htmlFor="hide-small-balances" className="font-normal cursor-pointer flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        <span>{t('Header.hideSmallBalances')}</span>
                    </Label>
                    <Switch id="hide-small-balances" checked={hideSmallBalances} onCheckedChange={setHideSmallBalances} />
                </Item>
                <Item className={cn("flex items-center justify-between", isMobile ? "py-2" : "")} onSelect={isMobile ? undefined : (e) => e.preventDefault()}>
                    <Label htmlFor="hide-unknown-tokens" className="font-normal cursor-pointer flex items-center gap-2">
                        <ShieldX className="h-4 w-4" />
                        <span>{t('Header.hideUnknownTokens')}</span>
                    </Label>
                    <Switch id="hide-unknown-tokens" checked={hideUnknownTokens} onCheckedChange={setHideUnknownTokens} />
                </Item>
                <Item asChild={!isMobile}>
                    <Link href="/slippage" className="cursor-pointer flex items-center w-full">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        <span>{t('Header.slippage')}</span>
                    </Link>
                </Item>
            </div>
            <Separator className={cn(!isMobile && "-mx-1 my-1 h-px bg-muted", isMobile && "my-4")} />

             <Sub {...(isMobile ? {type: "single", collapsible: true} : {} as any)}>
                <AccordionItem value="language" className={cn(isMobile && "border-b-0")}>
                    <SubTrigger {...(isMobile ? {className: "py-0"} : {})}>
                        <div className="flex items-center">
                            <Languages className="mr-2 h-4 w-4" />
                            <span>{t('Header.language')}</span>
                        </div>
                    </SubTrigger>
                    <SubContent {...(isMobile ? {} : {className: "w-48"})}>
                        <ScrollArea className="h-72">
                            {languages.map((lang) => (
                                <Item key={lang.code} onClick={() => setLanguage(lang.code)} className={cn(isMobile && "py-2 pl-8")}>
                                    <Check className={`mr-2 h-4 w-4 ${language === lang.code ? "opacity-100" : "opacity-0"}`} />
                                    {lang.displayName}
                                </Item>
                            ))}
                        </ScrollArea>
                    </SubContent>
                </AccordionItem>
            </Sub>
        </Wrapper>
    );
}

export function Header() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, isLoading: isUserLoading } = useUser();
  const { selectedNetwork, setSelectedNetwork } = useWallet();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
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
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r-border bg-card pr-0 pt-12 text-card-foreground">
              <SheetHeader className="sr-only">
                <SheetTitle>Main Menu</SheetTitle>
              </SheetHeader>
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
                {selectedNetwork.logo ? (<Image
                  src={selectedNetwork.logo}
                  alt={`${selectedNetwork.chainName} logo`}
                  width={20}
                  height={20}
                  className="rounded-full"
                />) : <div className="h-5 w-5 rounded-full bg-secondary" />}
                <span className="hidden sm:inline">{selectedNetwork.chainName}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
                <DropdownMenuContent align="end">
                {Object.values(networkConfigs).map((network) => (
                    <DropdownMenuItem
                    key={network.chainId}
                    onClick={() => setSelectedNetwork(network)}
                    >
                    {network.logo && (<Image
                        src={network.logo}
                        alt={`${network.chainName} logo`}
                        width={20}
                        height={20}
                        className="mr-2 rounded-full"
                    />)}
                    {network.chainName}
                    </DropdownMenuItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>

          <WalletConnect>
            <Button variant="secondary">{t('Header.connectWallet')}</Button>
          </WalletConnect>
          
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground/90 transition-colors hover:bg-white/10 hover:text-primary-foreground">
                      <Cog className="h-5 w-5" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn(isMobile ? "w-[calc(100vw-32px)]" : "w-64")}>
                  <SettingsContent isMobile={isMobile} />
              </DropdownMenuContent>
          </DropdownMenu>
            
          {isUserLoading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                     <Avatar>
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('Header.myAccount')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>{t('Header.profile')}</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('Header.logout')}</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
          ) : (
               <Link href="/login" passHref>
                 <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarFallback>
                            <User className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                 </Button>
               </Link>
          )}
        </div>
      </div>
    </header>
  );
}
