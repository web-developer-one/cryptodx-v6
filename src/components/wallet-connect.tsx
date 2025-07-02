
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
            src="https://walletguide.walletconnect.network/_next/image?url=https%3A%2F%2Fapi.web3modal.com%2Fv2%2Fwallet-image%2F200x200%2Fa7f416de-aa03-4c5e-3280-ab49269aef00%3FprojectId%3Dad53ae497ee922ad9beb2ef78b1a7a6e%26st%3Dwallet-guide%26sv%3D1.0.0&w=256&q=75"
            alt="Bitcoin Wallet logo"
            width={56}
            height={56}
            className="rounded-md"
        />
    },
    { name: 'Ledger', id: 'ledger' },
];

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export function WalletConnect({ children }: { children?: React.ReactNode }) {
  const { account, isActive, connectMetaMask, disconnect, isLoading } = useWallet();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletClick = async (walletId: string, walletName: string) => {
    if (walletId === 'metamask') {
      await connectMetaMask();
      setOpen(false); // Close dialog after attempting connection
    } else {
      toast({
        variant: "destructive",
        title: "Not Implemented",
        description: `Connection to ${walletName} is not available yet.`,
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
