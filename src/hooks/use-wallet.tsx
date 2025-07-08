
'use client';

import React, { useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from './use-language';

declare global {
    interface Window {
        ethereum: any;
    }
}

// Define the shape of the wallet context
interface WalletContextType {
  account: string | null;
  isActive: boolean;
  balances: Record<string, string> | null;
  connectWallet: (chainId?: string) => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

// Create the context with a default null value
const WalletContext = React.createContext<WalletContextType | null>(null);

// Create the provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [balances, setBalances] = React.useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { t } = useLanguage();

  const fetchBalances = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(address);
      const balanceEther = ethers.formatEther(balanceWei);
      
      // Mock other token balances for demonstration purposes
      const mockBalances: Record<string, string> = {
          ETH: balanceEther,
          USDC: (Math.random() * 5000 + 1000).toFixed(2), // 1k-6k USDC
          WBTC: (Math.random() * 0.1).toFixed(5), // 0-0.1 WBTC
          DOGE: (Math.random() * 100000).toFixed(0), // 0-100k DOGE
          SHIB: (Math.random() * 500000000).toFixed(0)
      };

      setBalances(mockBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setBalances(null);
    }
  };

  const disconnect = useCallback(() => {
    setAccount(null);
    setBalances(null);
    localStorage.setItem('explicitly_disconnected', 'true');
    toast({
        title: t('WalletConnect.walletDisconnected'),
        description: t('WalletConnect.walletDisconnectedDescription'),
    });
  }, [t]);
  
  const connectWallet = useCallback(async (chainId: string = '0x1') => {
    if (typeof window.ethereum === 'undefined') {
        toast({
            variant: "destructive",
            title: t('WalletConnect.walletNotFound'),
            description: t('WalletConnect.walletNotFoundDescription'),
        });
        return;
    }

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
        });
    } catch (switchError: any) {
        if (switchError.code === 4902) {
             toast({
                variant: "destructive",
                title: "Network Not Found in Wallet",
                description: "This network has not been added to your wallet. Please add it manually before connecting.",
            });
        } else {
             toast({
                variant: "destructive",
                title: "Network Switch Failed",
                description: "Could not switch to the selected network. Please try again.",
            });
        }
        console.error("Failed to switch network", switchError);
        return; // Stop the connection process if network switch fails
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            await fetchBalances(accounts[0]);
            localStorage.removeItem('explicitly_disconnected');
            toast({
                title: t('WalletConnect.walletConnected'),
                description: t('WalletConnect.walletConnectedDescription').replace('{account}', `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`),
            });
        }
    } catch (error) {
        console.error("User rejected request or an error occurred", error);
        toast({
            variant: "destructive",
            title: t('WalletConnect.connectionFailed'),
            description: t('WalletConnect.connectionFailedDescription'),
        });
    }
  }, [t]);

  useEffect(() => {
    if (typeof window.ethereum === 'undefined') {
        setIsLoading(false);
        return;
    };

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        await fetchBalances(accounts[0]);
        localStorage.removeItem('explicitly_disconnected');
        toast({
            title: t('WalletConnect.accountSwitched'),
            description: t('WalletConnect.accountSwitchedDescription').replace('{account}', `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`),
        });
      }
    };
    
    const handleChainChanged = () => {
        // Simple reload to ensure all components re-render with new network context
        window.location.reload();
    };

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
                await fetchBalances(accounts[0]);
            }
        } catch (error) {
            console.log("Could not check for existing connection", error);
        } finally {
            setIsLoading(false);
        }
    };

    checkExistingConnection();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, disconnect, t]);

  const value = {
    account,
    isActive: !!account,
    balances,
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
