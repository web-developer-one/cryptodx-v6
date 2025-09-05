

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Should not be sent to client
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
  pricePlan: 'Free' | 'Basic' | 'Advanced' | 'Administrator';
  avatar: string;
}

export interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  address?: string; // Optional top-level address for simplicity
  price: number; // in USD
  change24h: number; // percentage change in the last 24 hours
  logo?: string;
  cmcRank?: number;
  marketCap?: number;
  volume24h?: number;
  circulatingSupply?: number;
  platform: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  } | null;
}

export interface TokenDetails extends Cryptocurrency {
    cmcRank: number;
    marketCap: number;
    volume24h: number;
    circulatingSupply: number;
    totalSupply: number;
    maxSupply: number | null;
    dateAdded: string;
    low24h: number | null;
    high24h: number | null;
    urls: {
        website: string[];
        technical_doc: string[];
        explorer: string[];
        twitter: string[];
        reddit: string[];
    };
}

export interface Position {
  id: string;
  token0: Cryptocurrency;
  token1: Cryptocurrency;
  network: string;
  value: number; // in USD
  apr: number; // percentage
}

export interface LiquidityPool {
  id: string;
  token0: Cryptocurrency;
  token1: Cryptocurrency;
  network: string;
  tvl: number; // Total Value Locked in USD
  volume24h: number; // 24h trading volume in USD
}

export type TransactionType = 'Swap' | 'Add' | 'Remove';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export interface Transaction {
  id: string; // transaction hash
  type: TransactionType;
  status: TransactionStatus;
  token0: Cryptocurrency;
  token1: Cryptocurrency;
  amount0: number;
  amount1: number;
  account: string;
  timestamp: Date;
  value: number; // in USD
}

export interface SelectedCurrency {
    symbol: string;
    name: string;
    rate: number;
}

export interface NftCollection {
    id: string;
    name: string;
    logo: string;
    url: string;
    floorPrice?: number;
    transfers24h: number;
    transfers7d: number;
    uniqueHolders: number;
    totalSupply: number;
    isVerified?: boolean;
}
