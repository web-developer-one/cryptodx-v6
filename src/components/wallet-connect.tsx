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
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import React from 'react';
import { type Connector } from 'wagmi';

function WalletButton({ connector, onClick }: { connector: Connector; onClick: () => void }) {
    const walletHints: { [key: string]: string } = {
      "MetaMask": "metamask fox",
      "Coinbase Wallet": "coinbase logo",
      "WalletConnect": "walletconnect logo",
    };
    const defaultHint = "crypto wallet";
    const hint = walletHints[connector.name] || defaultHint;

    return (
        <Button
            variant="outline"
            className="h-14 justify-start p-4 text-lg"
            onClick={onClick}
            disabled={!connector.ready}
        >
            <Image
                src="https://placehold.co/32x32/008080/f0ffff.png"
                alt={`${connector.name} logo`}
                width={32}
                height={32}
                className="mr-4 rounded-md"
                data-ai-hint={hint}
            />
            {connector.name}
            {!connector.ready && ' (unsupported)'}
        </Button>
    );
}

export function WalletConnect({ children }: { children?: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()

  const [open, setOpen] = React.useState(false);

  if (isConnected) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                    {ensName ? `${ensName}` : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => disconnect()}>
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
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
            {connectors.map((connector) => (
                <DialogClose asChild key={connector.uid}>
                    <WalletButton
                        connector={connector}
                        onClick={() => connect({ connector })}
                    />
                </DialogClose>
            ))}
            {error && <p className="text-destructive text-sm text-center pt-2">{error.message}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
