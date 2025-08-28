
'use client';

import React, { useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from './use-language';
import { uniswapV2RouterABI } from '@/lib/uniswap-v2-router-abi';
import type { Cryptocurrency } from '@/lib/types';


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
    uniswapRouterAddress?: string;
    wrappedNativeAddress?: string; // Address for WETH, WBNB, etc.
}

export const networkConfigs: Record<string, NetworkConfig> = {
    '0x1': {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
        uniswapRouterAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        wrappedNativeAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    },
    '0xa86a': {
        chainId: '0xa86a',
        chainName: 'Avalanche C-Chain',
        nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
        uniswapRouterAddress: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4', // TraderJoe Router
        wrappedNativeAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
    },
    '0xa4b1': {
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png',
        uniswapRouterAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', // SushiSwap Router
        wrappedNativeAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum
    },
    '0x2105': {
        chainId: '0x2105',
        chainName: 'Base Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/27740.png',
        uniswapRouterAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', // Uniswap V3 Router
        wrappedNativeAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
    },
    '0x38': {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
        uniswapRouterAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap Router
        wrappedNativeAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    },
    '0xa': {
        chainId: '0xa',
        chainName: 'OP Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png',
        uniswapRouterAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router on Optimism
        wrappedNativeAddress: '0x4200000000000000000000000000000000000006', // WETH on Optimism
    },
    '0x89': {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
        uniswapRouterAddress: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', // QuickSwap Router
        wrappedNativeAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
    },
    '0x144': {
        chainId: '0x144',
        chainName: 'zkSync Era Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.era.zksync.io'],
        blockExplorerUrls: ['https://explorer.zksync.io'],
        logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24093.png'
        // Note: zkSync uses a different swapping mechanism, Uniswap V2 router might not be applicable.
    },
};

// Define the shape of the wallet context
interface WalletContextType {
  account: string | null;
  isActive: boolean;
  balances: Record<string, string> | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  isConnecting: boolean;
  isSwapping: boolean;
  selectedNetwork: NetworkConfig;
  setSelectedNetwork: React.Dispatch<React.SetStateAction<NetworkConfig>>;
  performSwap: (fromToken: Cryptocurrency, toToken: Cryptocurrency, amount: string) => Promise<void>;
}

// Create the context with a default null value
const WalletContext = React.createContext<WalletContextType | null>(null);

// Create the provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [balances, setBalances] = React.useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isSwapping, setIsSwapping] = React.useState(false);
  const [selectedNetwork, setSelectedNetwork] = React.useState<NetworkConfig>(networkConfigs['0x1']);
  const { t } = useLanguage();

  const fetchBalances = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(address);
      const balanceEther = ethers.formatEther(balanceWei);
      
      const mockBalances: Record<string, string> = {
          ETH: balanceEther,
          USDC: (Math.random() * 5000 + 1000).toFixed(2),
          WBTC: (Math.random() * 0.1).toFixed(5),
          DOGE: (Math.random() * 100000).toFixed(0),
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
  
  const switchNetwork = useCallback(async (network: NetworkConfig) => {
    if (typeof window.ethereum === 'undefined') return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) { // Chain not added
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
        } catch (addError: any) {
           toast({ variant: "destructive", title: t('WalletConnect.addNetworkFailedTitle'), description: t('WalletConnect.addNetworkFailedDesc')});
        }
      } else if (switchError.code !== 4001) { // Ignore user rejection
         toast({ variant: "destructive", title: t('WalletConnect.switchNetworkFailedTitle'), description: t('WalletConnect.switchNetworkFailedDesc')});
      }
    }
  }, [t]);

  const connectWallet = useCallback(async () => {
    if (isConnecting || account) return;

    if (typeof window.ethereum === 'undefined') {
        toast({
            variant: "destructive",
            title: t('WalletConnect.walletNotFound'),
            description: t('WalletConnect.walletNotFoundDescription'),
        });
        return;
    }

    setIsConnecting(true);
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        const accounts = await provider.send('eth_requestAccounts', []);

        if (accounts.length > 0) {
            const currentAccount = accounts[0];
            setAccount(currentAccount);
            
            await switchNetwork(selectedNetwork);
            await fetchBalances(currentAccount);
            
            localStorage.removeItem('explicitly_disconnected');
            toast({
                title: t('WalletConnect.walletConnected'),
                description: t('WalletConnect.walletConnectedDescription').replace('{account}', `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`),
            });
        }
    } catch (error: any) {
        console.error("Connection failed", error);
        if (error.code !== 4001) { // User rejected the request
            toast({ 
                variant: "destructive", 
                title: t('WalletConnect.connectionFailed'), 
                description: error.message || t('WalletConnect.connectionFailedDescription') 
            });
        }
    } finally {
        setIsConnecting(false);
    }
  }, [isConnecting, account, selectedNetwork, t, switchNetwork]);

  useEffect(() => {
    if (account) {
        switchNetwork(selectedNetwork);
    }
  }, [selectedNetwork, account, switchNetwork]);
  
  const performSwap = useCallback(async (fromToken: Cryptocurrency, toToken: Cryptocurrency, amount: string) => {
    if (!account || !window.ethereum || !selectedNetwork.uniswapRouterAddress) {
        toast({ variant: 'destructive', title: 'Wallet Not Connected', description: 'Please connect your wallet to perform a swap.' });
        return;
    }
    
    const fromIsNative = fromToken.symbol === selectedNetwork.nativeCurrency.symbol;
    const fromAddress = fromIsNative ? selectedNetwork.wrappedNativeAddress : fromToken.address;
    const toAddress = toToken.address;

    if (!fromAddress || !toAddress) {
        toast({ variant: 'destructive', title: 'Invalid Token', description: 'One of the selected tokens does not have a valid address on this network.' });
        return;
    }

    setIsSwapping(true);
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const routerContract = new ethers.Contract(selectedNetwork.uniswapRouterAddress, uniswapV2RouterABI, signer);

        const amountIn = ethers.parseUnits(amount, 18); // Assuming 18 decimals for fromToken
        const path = [fromAddress, toAddress]; 
        const to = account;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

        const amountsOut = await routerContract.getAmountsOut(amountIn, path);
        const amountOutMin = amountsOut[1] * BigInt(99) / BigInt(100); // 1% slippage tolerance

        toast({ title: 'Transaction Submitted', description: 'Approving token spend...'});
        
        const tx = await routerContract.swapExactETHForTokens(
            amountOutMin,
            path,
            to,
            deadline,
            { value: amountIn }
        );
        
        toast({ title: 'Executing Swap', description: `Transaction hash: ${tx.hash}`});
        
        await tx.wait();

        toast({
            title: 'Swap Successful!',
            description: `Swapped ${amount} ${fromToken.symbol} for ${toToken.symbol}.`,
        });

        await fetchBalances(account);
        
    } catch (error: any) {
        console.error("Swap failed", error);
        toast({
            variant: 'destructive',
            title: 'Swap Failed',
            description: error.reason || error.message || 'An unknown error occurred during the swap.',
        });
    } finally {
        setIsSwapping(false);
    }
  }, [account, selectedNetwork, t]);


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
    isConnecting,
    isSwapping,
    selectedNetwork,
    setSelectedNetwork,
    performSwap,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = React.useContext(WalletContext);
  if (context === null) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
