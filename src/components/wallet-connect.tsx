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

const wallets = [
  { name: "MetaMask", icon: "metamask fox" },
  { name: "Coinbase Wallet", icon: "coinbase logo" },
  { name: "WalletConnect", icon: "wallet connect" },
  { name: "Ledger", icon: "ledger logo" },
];

interface WalletConnectProps {
    children?: React.ReactNode;
    onConnect?: () => void;
}

export function WalletConnect({ children, onConnect }: WalletConnectProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || <Button>Connect Wallet</Button>}
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
              onClick={onConnect}
            >
              <Image
                src="https://placehold.co/32x32/008080/f0ffff.png"
                alt={`${wallet.name} logo`}
                width={32}
                height={32}
                className="mr-4 rounded-md"
                data-ai-hint={wallet.icon}
              />
              {wallet.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
