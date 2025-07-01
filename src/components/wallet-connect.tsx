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

const MetaMaskIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 1024 1024" {...props}>
        <g transform="matrix(1, 0, 0, 1, 0, 0)">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path fill="#e27625" d="M790.39,493.385l-58.2-111.954l-68.521,43.087l-60.6-35.787l-60.6,35.787l-68.521-43.087 L415.748,493.385l54.854,16.862L415.748,527.11l89.3,142.271l107.352-60.6l107.352,60.6l89.3-142.271l-54.854-16.862 L790.39,493.385z"/>
                <path fill="#e27625" d="M836.567,273.749l-53.726,108.48L512,192.355L240.159,382.229L186.433,273.749L313.25,123.5L512,243.645 L710.75,123.5L836.567,273.749z"/>
                <path fill="#d6c0b3" d="M619.352,669.381L512,608.781l-107.352,60.6l53.726-108.48L240.159,382.229l271.841,189.874 L619.352,669.381z"/>
                <path fill="#d6c0b3" d="M404.648,669.381l107.352-60.6l107.352,60.6l-53.726-108.48L783.841,382.229L512,572.103 L404.648,669.381z"/>
                <path fill="#f6851b" d="M619.352,669.381l-53.726-108.48L240.159,382.229l-53.726,108.48l173.355,96.656L512,526.797 L619.352,669.381z"/>
                <path fill="#f6851b" d="M404.648,669.381l53.726-108.48l325.467-178.672l53.726,108.48l-173.355,96.656L512,526.797 L404.648,669.381z"/>
                <path fill="#763e1a" d="M783.841,382.229L512,572.103V243.645L710.75,123.5l73.091,149.874L837.567,273.749L783.841,382.229z"/>
                <path fill="#763e1a" d="M240.159,382.229L512,572.103V243.645L313.25,123.5l-73.091,149.874L186.433,273.749L240.159,382.229z"/>
                <path fill="#161616" opacity="0.1" d="M512,608.781V788.5l153.188-96.656L512,608.781z"/>
                <path fill="#161616" opacity="0.1" d="M512,608.781V788.5L358.812,691.844L512,608.781z"/>
                <path fill="#233447" d="M512,608.781v180.469L358.812,691.844L512,608.781z"/>
                <path fill="#233447" d="M512,608.781l-107.352,60.6l53.726-108.48L512,526.797V608.781z"/>
                <path fill="#233447" d="M512,608.781l107.352,60.6l-53.726-108.48L512,526.797V608.781z"/>
            </g>
        </g>
    </svg>
);

const CoinbaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="112" height="112" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="56" height="56" rx="28" fill="#0052FF"/>
        <rect x="16" y="16" width="24" height="24" rx="4" fill="white"/>
    </svg>
);

const WalletConnectIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="112" height="112" viewBox="0 0 256 166" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M68.528 165.321L0 82.6604L68.528 0L93.184 27.151L47.592 82.6604L93.184 138.17L68.528 165.321Z" fill="#3396FF"/>
        <path d="M187.472 0L256 82.6604L187.472 165.321L162.816 138.17L208.408 82.6604L162.816 27.151L187.472 0Z" fill="#3396FF"/>
        <path d="M91.808 12.9284L108.64 0L128 22.384L147.36 0L164.192 12.9284L128 53.5362L91.808 12.9284Z" fill="url(#paint0_linear_wc)"/>
        <path d="M91.808 152.392L108.64 165.32L128 142.936L147.36 165.32L164.192 152.392L128 111.784L91.808 152.392Z" fill="url(#paint1_linear_wc)"/>
        <defs>
        <linearGradient id="paint0_linear_wc" x1="128" y1="0" x2="128" y2="53.5362" gradientUnits="userSpaceOnUse">
        <stop stopColor="#59A5FF"/>
        <stop offset="1" stopColor="#3396FF"/>
        </linearGradient>
        <linearGradient id="paint1_linear_wc" x1="128" y1="111.784" x2="128" y2="165.32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#59A5FF"/>
        <stop offset="1" stopColor="#3396FF"/>
        </linearGradient>
        </defs>
    </svg>
);

const LedgerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="112" height="112" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M13 0L0 5.48564V16.4569C0 24.3141 13 30 13 30C13 30 26 24.3141 26 16.4569V5.48564L13 0Z" fill="black"/>
    </svg>
);


const wallets = [
    { name: 'MetaMask', id: 'metamask', icon: <MetaMaskIcon /> },
    { name: 'Coinbase Wallet', id: 'coinbase', icon: <CoinbaseIcon /> },
    { name: 'WalletConnect', id: 'walletconnect', icon: <WalletConnectIcon /> },
    { name: 'Ledger', id: 'ledger', icon: <LedgerIcon /> },
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
                    className="h-32 justify-start p-4 text-lg"
                    onClick={() => handleWalletClick(wallet.id)}
                >
                    {wallet.icon ? (
                        <div className="mr-4 flex h-28 w-28 items-center justify-center">{wallet.icon}</div>
                    ) : (
                        <Image
                            src="https://placehold.co/112x112.png"
                            alt={`${wallet.name} logo`}
                            width={112}
                            height={112}
                            className="mr-4 rounded-md"
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
