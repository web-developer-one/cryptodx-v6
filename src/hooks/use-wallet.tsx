'use client';

import React from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

declare global {
    interface Window {
        ethereum: any;
    }
}

// Define the shape of the wallet context
interface WalletContextType {
  account: string | null;
  isActive: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

// Create the context with a default null value
const WalletContext = React.createContext<WalletContextType | null>(null);

// Create the provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Memoize the disconnect function
  const disconnect = React.useCallback(() => {
    setAccount(null);
    localStorage.setItem('explicitly_disconnected', 'true');
    toast({
        title: "Wallet Disconnected",
        description: "You have successfully disconnected your wallet.",
    });
  }, []);
  
  // Memoize the connect function
  const connectWallet = React.useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // Request account access
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            localStorage.removeItem('explicitly_disconnected');
            toast({
                title: "Wallet Connected",
                description: `Successfully connected to account: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
            });
        }
      } catch (error) {
        console.error("User rejected request or an error occurred", error);
        toast({
            variant: "destructive",
            title: "Connection Failed",
            description: "Could not connect to the wallet. The request may have been rejected.",
        });
      }
    } else {
        toast({
            variant: "destructive",
            title: "Wallet Not Found",
            description: "Please install a compatible browser wallet extension like MetaMask, Trust Wallet, or Coinbase Wallet.",
        });
    }
  }, []);

  // Effect to handle account and network changes
  React.useEffect(() => {
    if (typeof window.ethereum === 'undefined') {
        setIsLoading(false);
        return;
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // MetaMask is locked or the user has disconnected all accounts
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        localStorage.removeItem('explicitly_disconnected');
        toast({
            title: "Account Switched",
            description: `Switched to account: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
        });
      }
    };

    // Check for already connected account on component mount
    const checkExistingConnection = async () => {
        const explicitlyDisconnected = localStorage.getItem('explicitly_disconnected') === 'true';
        if (explicitlyDisconnected) {
            setIsLoading(false);
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_accounts', []);
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        } catch (error) {
            console.log("Could not check for existing connection", error);
        } finally {
            setIsLoading(false);
        }
    };

    checkExistingConnection();

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    // Cleanup listener
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [account, disconnect]);

  const value = {
    account,
    isActive: !!account,
    connectWallet,
    disconnect,
    isLoading,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Create a custom hook for easy access to the context
export const useWallet = () => {
  const context = React.useContext(WalletContext);
  if (context === null) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
