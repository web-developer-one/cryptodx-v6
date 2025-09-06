
'use client';

import React, { useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from './use-language';
import { uniswapV2RouterABI } from '@/lib/uniswap-v2-router-abi';
import type { Cryptocurrency } from '@/lib/types';
import { networkConfigs, type NetworkConfig } from '@/lib/network-configs';

export { networkConfigs, type NetworkConfig };


declare global {
    interface Window {
        ethereum: any;
    }
}

type Balance = {
    name: string;
    symbol: string;
    logo?: string;
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
  error: string | null;
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
  const [error, setError] = React.useState<string | null>(null);
  const { t } = useLanguage();

  const fetchBalances = useCallback(async (address: string, network: NetworkConfig) => {
    setIsBalancesLoading(true);
    setBalances(null);
    setError(null);
    try {
      const response = await fetch(`/api/moralis/balances?address=${address}&chain=${network.chainId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch balances with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid balance data format');
      }

      const processedBalances: Balances = data.reduce((acc, token) => {
        acc[token.symbol] = {
          name: token.name,
          symbol: token.symbol,
          logo: token.logo,
          balance: token.balance,
          usdValue: token.usdValue,
          address: token.token_address,
          decimals: token.decimals,
        };
        return acc;
      }, {} as Balances);

      setBalances(processedBalances);
    } catch (error: any) {
      console.error("Failed to fetch balances:", error);
      setError("Could not fetch wallet balances.");
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
  }, [account, selectedNetwork, fetchBalances, t]);

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
        if (!tokenAddress || tokenAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            tx = await signer.sendTransaction({
                to: recipient,
                value: amountToSend
            });
        } else {
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
    error,
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
