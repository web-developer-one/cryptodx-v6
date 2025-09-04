
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
    },
};

type Balance = {
    name: string;
    symbol: string;
    logo: string;
    balance: string;
    usdValue: number;
    address?: string;
    decimals: number;
}
type Balances = Record<string, Balance>;


interface WalletContextType {
  account: string | null;
  isActive: boolean;
  balances: Balances | null;
  isBalancesLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  isConnecting: boolean;
  isSwapping: boolean;
  isSending: boolean;
  selectedNetwork: NetworkConfig;
  setSelectedNetwork: React.Dispatch<React.SetStateAction<NetworkConfig>>;
  performSwap: (fromToken: Cryptocurrency, toToken: Cryptocurrency, amount: string) => Promise<void>;
  sendTokens: (tokenAddress: string | undefined, recipient: string, amount: string, decimals: number) => Promise<void>;
}

const WalletContext = React.createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [balances, setBalances] = React.useState<Balances | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isSwapping, setIsSwapping] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [isBalancesLoading, setIsBalancesLoading] = React.useState(false);
  const [selectedNetwork, setSelectedNetwork] = React.useState<NetworkConfig>(networkConfigs['0x1']);
  const { t } = useLanguage();

  const fetchBalances = useCallback(async (address: string, network: NetworkConfig) => {
    setIsBalancesLoading(true);
    try {
      const response = await fetch(`/api/moralis/balances?address=${address}&chain=${network.chainId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balances from Moralis');
      }
      const data = await response.json();

      const nativeBalanceResponse = await new ethers.BrowserProvider(window.ethereum).getBalance(address);
      const nativeBalance = ethers.formatEther(nativeBalanceResponse);
      const nativeTokenPrice = 3500; // This should come from an oracle in a real app

      const processedBalances: Balances = {};
      
      // Add native balance first
      processedBalances[network.nativeCurrency.symbol] = {
          name: network.nativeCurrency.name,
          symbol: network.nativeCurrency.symbol,
          logo: network.logo || '',
          balance: nativeBalance,
          usdValue: parseFloat(nativeBalance) * nativeTokenPrice,
          decimals: 18,
          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' // Common address for native tokens
      };

      // Process ERC20 tokens from Moralis
      data.forEach((token: any) => {
          if (token.possible_spam) return; // Skip spam tokens
          
          processedBalances[token.symbol] = {
              name: token.name,
              symbol: token.symbol,
              logo: token.logo || `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.token_address}.png`,
              balance: ethers.formatUnits(token.balance, token.decimals),
              usdValue: token.usd_value,
              address: token.token_address,
              decimals: token.decimals,
          };
      });

      setBalances(processedBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not fetch wallet balances." });
      setBalances(null);
    } finally {
        setIsBalancesLoading(false);
    }
  }, []);

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
      // After successful switch, re-fetch balances for the new network
      if (account) {
        fetchBalances(account, network);
      }
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
        } catch (addError: any) {
           toast({ variant: "destructive", title: t('WalletConnect.addNetworkFailedTitle'), description: t('WalletConnect.addNetworkFailedDesc')});
        }
      } else if (switchError.code !== 4001) {
         toast({ variant: "destructive", title: t('WalletConnect.switchNetworkFailedTitle'), description: t('WalletConnect.switchNetworkFailedDesc')});
      }
    }
  }, [t, account, fetchBalances]);

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
            await fetchBalances(currentAccount, selectedNetwork);
            
            localStorage.removeItem('explicitly_disconnected');
            toast({
                title: t('WalletConnect.walletConnected'),
                description: t('WalletConnect.walletConnectedDescription').replace('{account}', `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`),
            });
        }
    } catch (error: any) {
        console.error("Connection failed", error);
        const isUserRejection = error.code === 4001 || (error.message && error.message.includes("User rejected"));
        if (!isUserRejection) {
            toast({ 
                variant: "destructive", 
                title: t('WalletConnect.connectionFailed'), 
                description: error.message || t('WalletConnect.connectionFailedDescription') 
            });
        }
    } finally {
        setIsConnecting(false);
    }
  }, [isConnecting, account, selectedNetwork, t, switchNetwork, fetchBalances]);

  useEffect(() => {
    if (account) {
        switchNetwork(selectedNetwork);
    }
  }, [selectedNetwork, account, switchNetwork]);
  
   const performSwap = useCallback(async (fromToken: Cryptocurrency, toToken: Cryptocurrency, amount: string) => {
    if (!account || typeof window.ethereum === 'undefined' || !selectedNetwork.uniswapRouterAddress) {
        toast({ variant: 'destructive', title: 'Wallet Not Connected', description: 'Please connect your wallet to perform a swap.' });
        return;
    }
    
    setIsSwapping(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const routerContract = new ethers.Contract(selectedNetwork.uniswapRouterAddress, uniswapV2RouterABI, signer);

    const fromIsNative = fromToken.symbol === selectedNetwork.nativeCurrency.symbol;
    const toIsNative = toToken.symbol === selectedNetwork.nativeCurrency.symbol;

    const fromAddress = fromIsNative ? selectedNetwork.wrappedNativeAddress : fromToken.platform?.token_address;
    const toAddress = toIsNative ? selectedNetwork.wrappedNativeAddress : toToken.platform?.token_address;
    
    if (!fromAddress || !toAddress) {
        toast({ variant: 'destructive', title: 'Invalid Token', description: 'One of the selected tokens does not have a valid address on this network.' });
        setIsSwapping(false);
        return;
    }
    
    const amountIn = ethers.parseUnits(amount, 18);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    try {
        if (!fromIsNative) {
            const fromTokenContract = new ethers.Contract(fromAddress, ['function approve(address spender, uint256 amount) external returns (bool)'], signer);
            const approveTx = await fromTokenContract.approve(selectedNetwork.uniswapRouterAddress, amountIn);
            toast({ title: 'Approval Required', description: 'Please approve the token spend in your wallet.' });
            await approveTx.wait();
            toast({ title: 'Approval Successful', description: 'Token spending approved. Now executing swap...' });
        }

        const path = [fromAddress, toAddress];
        let tx;

        if (fromIsNative) {
            tx = await routerContract.swapExactETHForTokens(0, path, account, deadline, { value: amountIn });
        } else if (toIsNative) {
            tx = await routerContract.swapExactTokensForETH(amountIn, 0, path, account, deadline);
        } else {
            tx = await routerContract.swapExactTokensForTokens(amountIn, 0, path, account, deadline);
        }

        toast({ title: 'Transaction Submitted', description: 'Your swap is being processed on the blockchain.' });
        await tx.wait();
        toast({ title: 'Swap Successful!', description: `Swapped ${amount} ${fromToken.symbol} for ${toToken.symbol}.` });
        
        await fetchBalances(account, selectedNetwork);

    } catch (error: any) {
        console.error("Swap failed", error);
        toast({ variant: 'destructive', title: 'Swap Failed', description: error.reason || error.message || 'An unknown error occurred during the swap.'});
    } finally {
        setIsSwapping(false);
    }
  }, [account, selectedNetwork, fetchBalances]);

  const sendTokens = useCallback(async (tokenAddress: string | undefined, recipient: string, amount: string, decimals: number) => {
    if (!account || typeof window.ethereum === 'undefined') {
        toast({ variant: 'destructive', title: 'Wallet Not Connected', description: 'Please connect your wallet to send tokens.' });
        return;
    }
    setIsSending(true);
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const amountToSend = ethers.parseUnits(amount, decimals);
        
        let tx;
        // Handle native currency transfer
        if (!tokenAddress || tokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            tx = await signer.sendTransaction({
                to: recipient,
                value: amountToSend
            });
        } else {
            // Handle ERC20 token transfer
            const tokenContract = new ethers.Contract(tokenAddress, ['function transfer(address to, uint256 amount) external returns (bool)'], signer);
            tx = await tokenContract.transfer(recipient, amountToSend);
        }

        toast({ title: 'Transaction Sent', description: 'Your transaction has been submitted.' });
        await tx.wait();
        toast({ title: 'Transaction Confirmed', description: 'Your tokens have been successfully sent.' });
        await fetchBalances(account, selectedNetwork);

    } catch (error: any) {
        console.error("Send failed:", error);
        toast({ variant: 'destructive', title: 'Send Failed', description: error.reason || error.message || 'An unknown error occurred.' });
    } finally {
        setIsSending(false);
    }
  }, [account, selectedNetwork, fetchBalances]);


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
        await fetchBalances(accounts[0], selectedNetwork);
        localStorage.removeItem('explicitly_disconnected');
        toast({
            title: t('WalletConnect.accountSwitched'),
            description: t('WalletConnect.accountSwitchedDescription').replace('{account}', `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`),
        });
      }
    };
    
    const handleChainChanged = (chainId: string) => {
        const newNetwork = Object.values(networkConfigs).find(n => n.chainId === chainId);
        if (newNetwork) {
            setSelectedNetwork(newNetwork);
        } else {
            console.warn(`Unsupported chain detected: ${chainId}`);
        }
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
                await fetchBalances(accounts[0], selectedNetwork);
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
  }, [account, disconnect, t, fetchBalances, selectedNetwork]);

  const value = {
    account,
    isActive: !!account,
    balances,
    isBalancesLoading,
    connectWallet,
    disconnect,
    isLoading,
    isConnecting,
    isSwapping,
    isSending,
    selectedNetwork,
    setSelectedNetwork,
    performSwap,
    sendTokens,
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
