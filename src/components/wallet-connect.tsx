'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import React from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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

export function WalletConnect({ children }: { children?: React.ReactNode }) {
  const { account, isActive, connectWallet, disconnect, isLoading } = useWallet();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletClick = async (walletId: string, walletName: string) => {
    // These wallets typically inject into window.ethereum and follow EIP-1193 standard.
    if (['metamask', 'trustwallet', 'coinbase'].includes(walletId)) {
      await connectWallet();
      setOpen(false); // Close dialog after attempting connection
    } else {
      // Bitcoin and Ledger wallets require different connection methods not supported by this app's current architecture.
      toast({
        variant: "destructive",
        title: "Not Implemented",
        description: `Connection to ${walletName} is not supported in this app. Please use MetaMask, Trust Wallet, or Coinbase Wallet.`,
      });
    }
  };
  
  if (!mounted) {
      return (
          <Button variant="secondary" disabled>Connect Wallet</Button>
      );
  }

  if (isActive && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            {truncateAddress(account)}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={disconnect}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="secondary">Connect Wallet</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect a wallet</DialogTitle>
          <DialogDescription>
            Choose your wallet from the list below to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-2">
            {wallets.map((wallet) => (
                <Button
                    key={wallet.name}
                    variant="outline"
                    className="h-20 justify-start p-4 text-lg"
                    onClick={() => handleWalletClick(wallet.id, wallet.name)}
                >
                    {wallet.logo ? (
                        <div className="mr-4 flex h-14 w-14 items-center justify-center">
                            {wallet.logo}
                        </div>
                    ) : (
                        <Image
                            src="https://placehold.co/56x56.png"
                            alt={`${wallet.name} logo`}
                            width={56}
                            height={56}
                            className="mr-4 rounded-md"
                            data-ai-hint={`${wallet.name.toLowerCase().split(' ')[0]} logo`}
                        />
                    )}
                    {wallet.name}
                </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
