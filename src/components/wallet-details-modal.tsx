
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/hooks/use-wallet';
import { ArrowUpCircle, ArrowDownCircle, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ScrollArea } from './ui/scroll-area';

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const mockTokens = [
    { name: 'Ethereum', symbol: 'ETH', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', balance: '1.25', value: '4,500.00' },
    { name: 'USD Coin', symbol: 'USDC', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png', balance: '5,000.00', value: '5,000.00' },
];

export function WalletDetailsModal() {
  const { account, balances, disconnect } = useWallet();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);
  const [totalValue, setTotalValue] = useState('0.00');

  useEffect(() => {
    // Mock fetching token prices and calculating total value
    if (balances?.ETH) {
      const ethValue = parseFloat(balances.ETH) * 3600; // Mock ETH price
      const usdcValue = 5000; // from mockTokens
      setTotalValue((ethValue + usdcValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
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
                  {/* The default 'X' from DialogContent will serve as the close button */}
              </div>
          </DialogHeader>
          <div className="p-4 space-y-4">
              <div className="text-center">
                  <p className="text-3xl font-bold">${totalValue}</p>
                  <p className="text-sm text-muted-foreground">{balances?.ETH ? `${parseFloat(balances.ETH).toFixed(4)} ETH` : ''}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline"><ArrowUpCircle className="mr-2 h-4 w-4" /> {t('WalletDetailsModal.send')}</Button>
                  <Button variant="outline"><ArrowDownCircle className="mr-2 h-4 w-4" /> {t('WalletDetailsModal.receive')}</Button>
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
                        {mockTokens.map(token => (
                            <div key={token.symbol} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Image src={token.logo} width={40} height={40} alt={token.name} className="rounded-full" />
                                    <div>
                                        <p className="font-semibold">{token.name}</p>
                                        <p className="text-sm text-muted-foreground">{token.symbol}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{token.balance}</p>
                                    <p className="text-sm text-muted-foreground">${token.value}</p>
                                </div>
                            </div>
                        ))}
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
