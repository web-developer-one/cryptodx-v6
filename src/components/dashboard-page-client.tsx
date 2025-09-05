
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';

import { useLanguage } from '@/hooks/use-language';
import { useWallet, networkConfigs } from '@/hooks/use-wallet';
import type { Cryptocurrency } from '@/lib/types';
import { getLatestListings } from '@/lib/coinmarketcap';
import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ApiErrorCard } from './api-error-card';

import { ArrowDown, ArrowUp, Send, RefreshCw, Search, ChevronDown, SendIcon, Loader2, Copy, Check, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';


const SendTokenDialog = ({ token }: { token: { symbol: string, address?: string, decimals: number }}) => {
    const { sendTokens, isSending } = useWallet();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');

    const handleSend = async () => {
        await sendTokens(token.address, recipient, amount, token.decimals);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Send {token.symbol}</DialogTitle>
                <DialogDescription>
                    Enter the recipient address and amount to send.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recipient" className="text-right">
                        To
                    </Label>
                    <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="col-span-3" placeholder="0x..." />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                        Amount
                    </Label>
                    <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="0.0" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSend} disabled={isSending}>
                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendIcon className="mr-2 h-4 w-4" />}
                     Send {token.symbol}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

const ReceiveTokenDialog = ({ address }: { address: string }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if(address) {
            QRCode.toDataURL(address, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
            .then((url: string) => setQrCodeUrl(url))
            .catch((err: any) => console.error("Failed to generate QR code", err));
        }
    }, [address]);

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        toast({ description: "Address copied to clipboard!" });
    };

    return (
         <DialogContent className="sm:max-w-xs">
            <DialogHeader>
                <DialogTitle>Receive</DialogTitle>
                <DialogDescription>
                    Scan this QR code or copy the address below.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center gap-4 p-4">
                {qrCodeUrl ? (
                    <Image src={qrCodeUrl} alt="Wallet QR Code" width={200} height={200} />
                ) : (
                    <Skeleton className="h-[200px] w-[200px]" />
                )}
                <div className="text-center text-sm text-muted-foreground break-all">{address}</div>
                <Button onClick={handleCopy} className="w-full"><Copy className="mr-2 h-4 w-4"/> Copy Address</Button>
            </div>
        </DialogContent>
    )
}


const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export function DashboardPageClient() {
  const { t } = useLanguage();
  const { account, balances, isBalancesLoading, selectedNetwork, setSelectedNetwork, isLoading: isWalletLoading } = useWallet();
  const [allTokens, setAllTokens] = useState<Cryptocurrency[]>([]);
  const [isTokensLoading, setIsTokensLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = t('PageTitles.dashboard');
  }, [t]);

  useEffect(() => {
    async function fetchTokens() {
        setIsTokensLoading(true);
        const { data, error } = await getLatestListings();
        if(error) {
            setError(error);
        } else {
            setAllTokens(data);
        }
        setIsTokensLoading(false);
    }
    fetchTokens();
  }, []);

  const { totalValue, totalChange, totalChangePercentage } = useMemo(() => {
    if (!balances || !allTokens.length) return { totalValue: 0, totalChange: 0, totalChangePercentage: 0 };
    
    let totalValue = 0;
    let yesterdayValue = 0;

    Object.values(balances).forEach(token => {
        const tokenInfo = allTokens.find(t => t.symbol === token.symbol);
        const price = tokenInfo?.price || 0;
        const change24h = tokenInfo?.change24h || 0;
        const balance = parseFloat(token.balance);

        const currentValue = balance * price;
        totalValue += currentValue;
        
        if (price > 0 && change24h !== -100) {
            const priceYesterday = price / (1 + change24h / 100);
            yesterdayValue += balance * priceYesterday;
        } else {
            yesterdayValue += currentValue;
        }
    });

    const totalChange = totalValue - yesterdayValue;
    const totalChangePercentage = yesterdayValue > 0 ? (totalChange / yesterdayValue) * 100 : 0;
    
    return { totalValue, totalChange, totalChangePercentage };
  }, [balances, allTokens]);

  const filteredBalances = useMemo(() => {
    if (!balances) return [];
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return Object.values(balances).filter(
      (token) =>
        token.name.toLowerCase().includes(lowercasedQuery) ||
        token.symbol.toLowerCase().includes(lowercasedQuery)
    );
  }, [balances, searchQuery]);


  const isLoading = isBalancesLoading || isTokensLoading || isWalletLoading;
  
  const nativeCurrencyBalance = useMemo(() => {
    return balances?.[selectedNetwork.nativeCurrency.symbol];
  }, [balances, selectedNetwork]);
  
  const nativeCurrencyValue = useMemo(() => {
    if(!nativeCurrencyBalance || !allTokens.length) return 0;
    const tokenInfo = allTokens.find(t => t.symbol === nativeCurrencyBalance.symbol);
    const price = tokenInfo?.price || 0;
    return parseFloat(nativeCurrencyBalance.balance) * price;

  }, [nativeCurrencyBalance, allTokens]);

  return (
    <div className="container py-8 space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="relative">
                <Input placeholder="Search for a token..." className="pr-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
        </div>

        <div className="flex gap-2">
            <Link href="/"><Button>Swap</Button></Link>
            <Link href="/buy"><Button variant="secondary">Buy</Button></Link>
            <Link href="/sell"><Button variant="secondary">Sell</Button></Link>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary">Send</Button>
                </DialogTrigger>
                 <SendTokenDialog token={{...selectedNetwork.nativeCurrency, address: undefined}}/>
             </Dialog>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary">Receive</Button>
                </DialogTrigger>
                 <ReceiveTokenDialog address={account || ''} />
             </Dialog>
            <Button variant="secondary">Stake</Button>
            <Button variant="secondary">Bridge</Button>
        </div>

        <Card>
            <CardContent className="p-6">
                <h2 className="text-sm text-muted-foreground">Decentralized accounts</h2>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-2">
                    {isLoading ? <Skeleton className="h-10 w-48" /> : (
                        <>
                            <p className="text-4xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <div className={cn("flex items-center text-sm font-medium", totalChange >= 0 ? "text-green-500" : "text-destructive")}>
                                {totalChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                ${Math.abs(totalChange).toFixed(2)} ({totalChangePercentage.toFixed(2)}%) Today
                            </div>
                        </>
                    )}
                </div>
                 <div className="flex items-center gap-4 mt-4">
                    <Button variant="outline" size="sm" className="font-mono">
                       {account ? truncateAddress(account) : <Skeleton className="h-5 w-24" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {selectedNetwork.logo && <Image src={selectedNetwork.logo} alt={selectedNetwork.chainName} width={16} height={16} className="rounded-full" />}
                          {selectedNetwork.chainName}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
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
                    </DropdownMenu>
                </div>
                 <div className="mt-4 text-sm text-muted-foreground">
                    <span className="font-semibold">{selectedNetwork.nativeCurrency.symbol} Balance:</span>
                    {isLoading ? <Skeleton className="inline-block h-4 w-20 ml-2" /> : ` $${nativeCurrencyValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
            </CardContent>
        </Card>
        
        {error && <ApiErrorCard error={error} context="Token Data" />}

        {isLoading ? (
            <Skeleton className="h-96 w-full" />
        ) : (
            <DashboardTable balances={filteredBalances} totalValue={totalValue} allTokens={allTokens} />
        )}

    </div>
  );
}
