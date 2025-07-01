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

const wallets = [
    { name: 'MetaMask', id: 'metamask' },
    { name: 'Coinbase Wallet', id: 'coinbase' },
    { name: 'WalletConnect', id: 'walletconnect' },
    { name: 'Ledger', id: 'ledger' },
];

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export function WalletConnect({ children }: { children?: React.ReactNode }) {
  const { account, isActive, connectMetaMask, disconnect } = useWallet();
  const [open, setOpen] = React.useState(false);

  const handleWalletClick = async (walletId: string) => {
    if (walletId === 'metamask') {
      await connectMetaMask();
      setOpen(false); // Close dialog after attempting connection
    } else {
      alert(`${walletId} connection is not implemented yet.`);
    }
  };

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
                    onClick={() => handleWalletClick(wallet.id)}
                >
                    <Image
                        src="https://placehold.co/56x56.png"
                        alt={`${wallet.name} logo`}
                        width={56}
                        height={56}
                        className="mr-4 rounded-md"
                        data-ai-hint={`${wallet.name.toLowerCase().split(' ')[0]} logo`}
                    />
                    {wallet.name}
                </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
