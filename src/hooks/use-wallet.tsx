
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

export interface NetworkConfig {
    chainId: string;
    chainName: string;
    nativeCurrency: { name: string; symbol: string; decimals: number; };
    rpcUrls: string[];
    blockExplorerUrls: string[];
    logo?: string;
}

export const networkConfigs: Record<string, NetworkConfig> = {
    '0x1': {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://rpc.ankr.com/eth'],
        blockExplorerUrls: ['https://etherscan.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    },
    '0xe708': {
        chainId: '0xe708',
        chainName: 'Linea',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://rpc.linea.build'],
        blockExplorerUrls: ['https://lineascan.build'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', // Using ETH logo for now
    },
    '0xa86a': {
        chainId: '0xa86a',
        chainName: 'Avalanche C-Chain',
        nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png'
    },
    '0xa4b1': {
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://explorer.arbitrum.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png'
    },
    '0x2105': {
        chainId: '0x2105',
        chainName: 'Base Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/27740.png'
    },
    '0x38': {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
    },
    '0xa': {
        chainId: '0xa',
        chainName: 'OP Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimism.etherscan.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png'
    },
    '0x89': {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: { name: 'Polygon', symbol: 'MATIC', decimals: 18 }, // Note: Symbol is MATIC for compatibility
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png'
    },
    '0x144': {
        chainId: '0x144',
        chainName: 'zkSync Era Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.era.zksync.io'],
        blockExplorerUrls: ['https://explorer.zksync.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24093.png'
    },
};

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
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            const networkToAdd = networkConfigs[chainId];
            if (networkToAdd) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [networkToAdd],
                    });
                } catch (addError) {
                    toast({
                        variant: "destructive",
                        title: t('WalletConnect.addNetworkFailedTitle'),
                        description: t('WalletConnect.addNetworkFailedDesc'),
                    });
                    console.error("Failed to add network", addError);
                    return; // Stop if adding fails
                }
            } else {
                toast({
                    variant: "destructive",
                    title: t('WalletConnect.networkNotSupportedTitle'),
                    description: t('WalletConnect.networkNotSupportedDesc'),
                });
                return; // Stop if network config is missing
            }
        } else {
             toast({
                variant: "destructive",
                title: t('WalletConnect.switchNetworkFailedTitle'),
                description: t('WalletConnect.switchNetworkFailedDesc'),
            });
            console.error("Failed to switch network", switchError);
            return; // Stop the connection process if network switch fails
        }
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
