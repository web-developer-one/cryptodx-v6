
'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import React from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { WalletDetailsModal } from './wallet-details-modal';

const wallets = [
    {
        name: 'MetaMask',
        id: 'metamask',
        logo: <Image
            src="https://walletguide.walletconnect.network/_next/image?url=https%3A%2F%2Fapi.web3modal.com%2Fv2%2Fwallet-image%2F200x200%2Feebe4a7f-7166-402f-92e0-1f64ca2aa800%3FprojectId%3Dad53ae497ee922ad9beb2ef78b1a7a6e%26st%3Dwallet-guide%26sv%3D1.0.0&w=256&q=75"
            alt="MetaMask logo"
            width={56}
            height={56}
            className="rounded-md"
        />
    },
    {
        name: 'Trust Wallet',
        id: 'trustwallet',
        logo: <Image
            src="https://walletguide.walletconnect.network/_next/image?url=https%3A%2F%2Fapi.web3modal.com%2Fv2%2Fwallet-image%2F200x200%2F7677b54f-3486-46e2-4e37-bf8747814f00%3FprojectId%3Dad53ae497ee922ad9beb2ef78b1a7a6e%26st%3Dwallet-guide%26sv%3D1.0.0&w=256&q=75"
            alt="Trust Wallet logo"
            width={56}
            height={56}
            className="rounded-md"
        />
    },
    { 
        name: 'Coinbase Wallet', 
        id: 'coinbase',
        logo: <Image
            src="https://walletguide.walletconnect.network/_next/image?url=https%3A%2F%2Fapi.web3modal.com%2Fv2%2Fwallet-image%2F200x200%2Fa5ebc364-8f91-4200-fcc6-be81310a0000%3FprojectId%3Dad53ae497ee922ad9beb2ef78b1a7a6e%26st%3Dwallet-guide%26sv%3D1.0.0&w=256&q=75"
            alt="Coinbase Wallet logo"
            width={56}
            height={56}
            className="rounded-md"
        />
    },
    {
        name: 'Binance Wallet',
        id: 'binancewallet',
        logo: <Image
            src="https://walletguide.walletconnect.network/_next/image?url=https%3A%2F%2Fapi.web3modal.com%2Fv2%2Fwallet-image%2F200x200%2Febac7b39-688c-41e3-7912-a4fefba74600%3FprojectId%3Dad53ae497ee922ad9beb2ef78b1a7a6e%26st%3Dwallet-guide%26sv%3D1.0.0&w=256&q=75"
            alt="Binance Wallet logo"
            width={56}
            height={56}
            className="rounded-md"
        />
    },
    { 
        name: 'Bitcoin Wallet', 
        id: 'bitcoin',
        logo: <Image
            src="https://walletguide.walletconnect.network/_next/image?url=https%3A%2F%2Fapi.web3modal.com%2Fv2%2Fwallet-image%2F200x200%2Ff5b26eef-c5e8-421a-e379-ae010b4a7400%3FprojectId%3Dad53ae497ee922ad9beb2ef78b1a7a6e%26st%3Dwallet-guide%26sv%3D1.0.0&w=256&q=75"
            alt="Bitcoin Wallet logo"
            width={56}
            height={56}
            className="rounded-md"
        />
    },
    { 
        name: 'Ledger Live', 
        id: 'ledger',
        logo: <Image
            src="https://walletguide.walletconnect.network/_next/image?url=https%3A%2F%2Fapi.web3modal.com%2Fv2%2Fwallet-image%2F200x200%2Fa7f416de-aa03-4c5e-3280-ab49269aef00%3FprojectId%3Dad53ae497ee922ad9beb2ef78b1a7a6e%26st%3Dwallet-guide%26sv%3D1.0.0&w=256&q=75"
            alt="Ledger Live logo"
            width={56}
            height={56}
            className="rounded-md"
        />
    },
];

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export function WalletConnect({ children, chainId }: { children?: React.ReactNode, chainId: string }) {
  const { account, isActive, connectWallet } = useWallet();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletClick = async (walletId: string, walletName: string) => {
    if (['metamask', 'trustwallet', 'coinbase', 'binancewallet'].includes(walletId)) {
      await connectWallet(chainId);
      setDialogOpen(false); 
    } else {
      toast({
        variant: "destructive",
        title: t('WalletConnect.notImplemented').split('.')[0],
        description: t('WalletConnect.notImplemented').replace('{walletName}', walletName),
      });
    }
  };
  
  if (!mounted) {
      return (
          <Button variant="secondary" disabled>{t('Header.connectWallet')}</Button>
      );
  }

  if (isActive && account) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">
            {truncateAddress(account)}
          </Button>
        </DialogTrigger>
        <WalletDetailsModal />
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="secondary">{t('Header.connectWallet')}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('WalletConnect.title')}</DialogTitle>
          <DialogDescription>{t('WalletConnect.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
            {wallets.map((wallet) => (
            <button
                key={wallet.name}
                className="flex flex-col items-center justify-start gap-2 p-2 rounded-lg hover:bg-accent transition-colors text-center"
                onClick={() => handleWalletClick(wallet.id, wallet.name)}
            >
                {wallet.logo}
                <span className="text-xs font-medium">{wallet.name}</span>
            </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
