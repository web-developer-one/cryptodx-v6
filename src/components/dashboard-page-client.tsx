
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';

import { useLanguage } from '@/hooks/use-language';
import { useWallet } from '@/hooks/use-wallet';
import type { Cryptocurrency } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ApiErrorCard } from './api-error-card';
import { DashboardTable } from './dashboard-table';
import { networkConfigs } from '@/lib/network-configs';

import { ArrowDown, ArrowUp, Send, RefreshCw, Search, ChevronDown, SendIcon, Loader2, Copy, Check, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';


export const SendTokenDialog = ({ token }: { token: { symbol: string, address?: string, decimals: number }}) => {
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


export function DashboardPageClient() {
  const { t } = useLanguage();
  const { account, balances, isBalancesLoading, selectedNetwork, setSelectedNetwork, isLoading: isWalletLoading, error: walletError } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = t('PageTitles.dashboard');
  }, [t]);

  const isLoading = isWalletLoading || isBalancesLoading;

  const { totalValue, formattedBalances } = useMemo(() => {
    if (!balances) return { totalValue: 0, formattedBalances: [] };
    
    let total = 0;
    const formatted = Object.values(balances).map(token => {
        total += token.usdValue || 0;
        return token;
    });

    formatted.sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));
    
    return { totalValue: total, formattedBalances: formatted };
  }, [balances]);

  const filteredBalances = useMemo(() => {
    if (!formattedBalances) return [];
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return formattedBalances.filter(
      (token) =>
        token.name.toLowerCase().includes(lowercasedQuery) ||
        token.symbol.toLowerCase().includes(lowercasedQuery)
    );
  }, [formattedBalances, searchQuery]);

  const handleCopy = () => {
    if (account) {
        navigator.clipboard.writeText(account);
        setIsCopied(true);
        toast({ description: "Address copied to clipboard!" });
        setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const nativeCurrencyBalance = useMemo(() => {
    return balances?.[selectedNetwork.nativeCurrency.symbol];
  }, [balances, selectedNetwork]);
  
  const nativeCurrencyValue = useMemo(() => {
    return nativeCurrencyBalance?.usdValue || 0;
  }, [nativeCurrencyBalance]);

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
            <Link href="/buy"><Button>Buy</Button></Link>
            <Link href="/sell"><Button>Sell</Button></Link>
             <Dialog>
                <DialogTrigger asChild>
                    <Button>Send</Button>
                </DialogTrigger>
                 <SendTokenDialog token={{...selectedNetwork.nativeCurrency, address: undefined, decimals: 18}}/>
             </Dialog>
             <Dialog>
                <DialogTrigger asChild>
                    <Button>Receive</Button>
                </DialogTrigger>
                 <ReceiveTokenDialog address={account || ''} />
             </Dialog>
            <Button>Stake</Button>
            <Button>Bridge</Button>
            <Link href="/nfts"><Button>NFTs</Button></Link>
        </div>

        <Card>
            <CardContent className="p-6">
                <h2 className="text-sm text-muted-foreground">Decentralized accounts</h2>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-2">
                    {isLoading ? <Skeleton className="h-10 w-48" /> : (
                        <>
                            <p className="text-4xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </>
                    )}
                </div>
                 <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1 border rounded-md p-1 pr-2 bg-secondary">
                        <span className="font-mono text-sm pl-2">{account || '...'}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                             {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                    </div>
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
        
        {walletError && <ApiErrorCard error={walletError} context="Wallet Data" />}

        {isLoading ? (
            <Skeleton className="h-96 w-full" />
        ) : (
            <DashboardTable balances={filteredBalances} totalValue={totalValue} />
        )}

    </div>
  );
}
