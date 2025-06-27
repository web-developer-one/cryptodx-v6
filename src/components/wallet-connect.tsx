"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import React from 'react';

const wallets = [
    { name: 'MetaMask', hint: 'metamask fox' },
    { name: 'Coinbase Wallet', hint: 'coinbase logo' },
    { name: 'WalletConnect', hint: 'walletconnect logo' },
    { name: 'Ledger', hint: 'ledger logo' },
];

export function WalletConnect({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

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
                <DialogClose asChild key={wallet.name}>
                    <Button
                        variant="outline"
                        className="h-14 justify-start p-4 text-lg"
                    >
                        <Image
                            src="https://placehold.co/32x32.png"
                            alt={`${wallet.name} logo`}
                            width={32}
                            height={32}
                            className="mr-4 rounded-md"
                            data-ai-hint={wallet.hint}
                        />
                        {wallet.name}
                    </Button>
                </DialogClose>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
