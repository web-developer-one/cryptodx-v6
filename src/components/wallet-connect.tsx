
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

const MetamaskLogo = () => (
    <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <path d="M251.17 121.35L130.84 252.5S89.33 214.88 64.21 189.29L2.51 122.24l26.43-1.12 25.13-43.53 10.68 33.43 27.21-15.34.42 41.51 13.25 10.37 25.1-1.39 8.32-26.68 18.52-3.05 13.9 14.58 29.83-1.65-2.07-28.95 24.87-17.38-2.52-30.88-12.28 12.3-25.92 6.53z" fill="#E17726"></path>
        <path d="M251.17 121.35L130.84 252.5S89.33 214.88 64.21 189.29L2.51 122.24l26.43-1.12 25.13-43.53 10.68 33.43 27.21-15.34.42 41.51 13.25 10.37 25.1-1.39 8.32-26.68 18.52-3.05 13.9 14.58 29.83-1.65-2.07-28.95 24.87-17.38-2.52-30.88-12.28 12.3-25.92 6.53z" fill="#E27625" opacity=".15"></path>
        <path d="m116.61 221.56-25.82-34.62-43.4-31.33 1.15-37.19-25.26-44.15-18.7-3.95.8 4.67 17.9 3.15 25.26 44.16-1.15 37.18 43.4 31.34 25.81 34.62-1.15-3.86z" fill="#E27625" opacity=".15"></path>
        <path d="m110.31 93.33a5.53 5.53 0 0 1 1.7-1.31l12.36-7.55a5.53 5.53 0 0 1 5.61 0l12.36 7.55a5.53 5.53 0 0 1 2.8 4.8v15.1a5.53 5.53 0 0 1-2.8 4.8l-12.36 7.55a5.53 5.53 0 0 1-5.61 0l-12.36-7.55a5.53 5.53 0 0 1-2.8-4.8V98.13a5.53 5.53 0 0 1 2.8-4.8z" fill="#233447"></path>
        <path d="m110.31 93.33-28.2 15.99-10.7-18.74L89.7 78.3z" fill="#E4762F"></path>
        <path d="m146.54 93.33 28.2 15.99 10.7-18.74L167.14 78.3z" fill="#E4762F"></path>
        <path d="m98.16 111.43 14.47 26.33-14.47 7.58z" fill="#E4762F"></path>
        <path d="m158.69 111.43-14.47 26.33 14.47 7.58z" fill="#E4762F"></path>
        <path d="M128.42 121.72 112.58 138l15.84 8.32 15.84-8.32z" fill="#E4762F"></path>
        <path d="m112.58 92.42 15.84 8.32 15.84-8.32-15.84-26.24Z" fill="#F6851B"></path>
        <path d="m81.4 70.59 18.28-9.59-10.7 18.73-18.28 9.59z" fill="#C0AD9E"></path>
        <path d="m175.45 70.59-18.28-9.59 10.7 18.73 18.28 9.59z" fill="#C0AD9E"></path>
        <path d="m128.42 121.72-14.47-7.58v15.16l14.47 26.33z" fill="#C0AD9E"></path>
        <path d="m128.42 121.72 14.47-7.58v15.16l-14.47 26.33z" fill="#C0AD9E"></path>
        <path d="M89.7 78.3 71.42 87.89l10.7 18.74-10.7 5.62v15.16l14.47-7.58V145l22.42 11.23L112.58 138l-14.16-25.79 14.16-7.44 15.84 8.32 15.84-8.32 14.16 7.44-14.16 25.79L144.26 156.23l22.42-11.23V121.72l14.47 7.58V114.1l-10.7-5.62 10.7-18.74L167.14 78.3z" opacity=".1" fill="#161616"></path>
        <path d="m112.58 138-14.16-25.79 14.16-7.44 15.84 8.32 15.84-8.32 14.16 7.44-14.16 25.79z" opacity=".2" fill="#FFFFFF"></path>
    </svg>
);


const wallets = [
    { name: 'MetaMask', id: 'metamask', logo: <MetamaskLogo /> },
    { name: 'Coinbase Wallet', id: 'coinbase' },
    { name: 'WalletConnect', id: 'walletconnect' },
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

  const handleWalletClick = async (walletId: string) => {
    if (walletId === 'metamask') {
      await connectMetaMask();
      setOpen(false); // Close dialog after attempting connection
    } else {
      toast({
        variant: "destructive",
        title: "Not Implemented",
        description: `Connection to this wallet is not available yet.`,
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
                    onClick={() => handleWalletClick(wallet.id)}
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
