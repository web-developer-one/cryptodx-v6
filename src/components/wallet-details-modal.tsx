
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/hooks/use-wallet';
import { ArrowUpCircle, ArrowDownCircle, Copy, Check, SendIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { Label } from './ui/label';
import QRCode from 'qrcode';

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

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

export function WalletDetailsModal() {
  const { account, balances, disconnect, selectedNetwork, isBalancesLoading } = useWallet();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);
  const [totalValue, setTotalValue] = useState('0.00');

  useEffect(() => {
    if (balances) {
      const total = Object.values(balances).reduce((acc, token) => acc + (token.usdValue || 0), 0);
      setTotalValue(total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  }, [balances]);

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setIsCopied(true);
      toast({ description: t('TransactionsTable.copyHash') });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };
  
  return (
      <DialogContent className="sm:max-w-md p-0 gap-0 flex flex-col">
          <DialogHeader className="p-4 border-b">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <Image src="/avatars/male-01-avatar.png" width={24} height={24} alt="avatar" className="rounded-full" />
                      <span className="font-semibold">{truncateAddress(account || '')}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                          {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                  </div>
              </div>
          </DialogHeader>
          <div className="p-4 space-y-4">
              <div className="text-center">
                  <p className="text-3xl font-bold">${totalValue}</p>
                   {balances && balances[selectedNetwork.nativeCurrency.symbol] && (
                        <p className="text-sm text-muted-foreground">{parseFloat(balances[selectedNetwork.nativeCurrency.symbol].balance).toFixed(4)} {selectedNetwork.nativeCurrency.symbol}</p>
                   )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline"><ArrowUpCircle className="mr-2 h-4 w-4" /> {t('WalletDetailsModal.send')}</Button>
                    </DialogTrigger>
                    <SendTokenDialog token={{...selectedNetwork.nativeCurrency, address: undefined, decimals: 18}}/>
                 </Dialog>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline"><ArrowDownCircle className="mr-2 h-4 w-4" /> {t('WalletDetailsModal.receive')}</Button>
                    </DialogTrigger>
                     <ReceiveTokenDialog address={account || ''} />
                 </Dialog>
              </div>
          </div>
          <Tabs defaultValue="tokens" className="w-full flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 rounded-none border-t border-b">
                  <TabsTrigger value="tokens">{t('WalletDetailsModal.tokens')}</TabsTrigger>
                  <TabsTrigger value="pools" disabled>{t('WalletDetailsModal.pools')}</TabsTrigger>
                  <TabsTrigger value="activity" disabled>{t('WalletDetailsModal.activity')}</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-64">
                <TabsContent value="tokens" className="p-4">
                    <div className="space-y-4">
                        {isBalancesLoading ? (
                             Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                            ))
                        ) : balances && Object.keys(balances).length > 0 ? (
                            Object.values(balances).filter(token => token.symbol !== 'MCAT').map(token => (
                                <div key={token.symbol} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Image src={token.logo || 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png'} width={40} height={40} alt={token.name} className="rounded-full" />
                                        <div>
                                            <p className="font-semibold">{token.name}</p>
                                            <p className="text-sm text-muted-foreground">{token.symbol}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{parseFloat(token.balance).toLocaleString('en-US', {maximumFractionDigits: 4})}</p>
                                        <p className="text-sm text-muted-foreground">${(token.usdValue || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">No tokens found.</p>
                        )}
                    </div>
                </TabsContent>
              </ScrollArea>
          </Tabs>
          <DialogFooter className="p-4 border-t mt-auto">
             <DialogClose asChild>
                <Button variant="outline" className="w-full" onClick={handleDisconnect}>
                    {t('WalletDetailsModal.disconnect')}
                </Button>
             </DialogClose>
          </DialogFooter>
      </DialogContent>
  );
}
