
"use client";

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

const MetaMaskIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 540 540" {...props}>
        <circle cx="270" cy="270" r="270" fill="#eae0da"/>
        <g fill="#e27625">
            <path d="m429.3 351.4-71-55.7-38.3 25-38.3-25-71 55.7 32.7-119-32.7-21.7 50.4-86.7 58 32 58-32 50.4 86.7-32.7 21.7z"/>
            <path d="m429.3 209.6-50.4-86.7-58 32-58-32-50.4 86.7 32.7 21.7-32.7 19.8 51.7 91.4 58.6 18.8 58.6-18.8 51.7-91.4-32.7-19.8z"/>
        </g>
        <path d="m358.2 407.1-71-55.7-38.2 25v-226l58 32 50.4-86.7 32.7 21.7-32.7 119z" fill="#f6851b"/>
        <g fill="#d6c0b3">
            <path d="m358.2 229.4-146.5 47.4 58.6 18.8 51.7-91.4z"/>
            <path d="m110.7 229.4 146.5 47.4-58.6 18.8-51.7-91.4z"/>
        </g>
        <path d="m270 338.5 58.6-18.8-146.5-47.4-32.7 19.8 51.7 91.4z" fill="#161616"/>
        <path d="m382.7 209.6-112.7 47-79.9-47 17.5-32.2 62.4 38.4 62.4-38.4z" fill="#763e1a"/>
        <g fill="#233447">
            <path d="m270 382.1v-126l-58-32-50.4 86.7 32.7 21.7 40-21.7 38.2 25z"/>
            <path d="M270 382.1v-126l58-32 50.4 86.7-32.7 21.7-40-21.7-38.2 25z"/>
        </g>
    </svg>
);

const wallets = [
    { name: 'MetaMask', id: 'metamask', icon: <MetaMaskIcon /> },
    { name: 'Coinbase Wallet', id: 'coinbase', hint: 'coinbase logo' },
    { name: 'WalletConnect', id: 'walletconnect', hint: 'walletconnect logo' },
    { name: 'Ledger', id: 'ledger', hint: 'ledger logo' },
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
                    className="h-14 justify-start p-4 text-lg"
                    onClick={() => handleWalletClick(wallet.id)}
                >
                    {wallet.icon ? (
                        <div className="mr-4 flex h-8 w-8 items-center justify-center">{wallet.icon}</div>
                    ) : (
                        <Image
                            src="https://placehold.co/32x32.png"
                            alt={`${wallet.name} logo`}
                            width={32}
                            height={32}
                            className="mr-4 rounded-md"
                            data-ai-hint={wallet.hint}
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
