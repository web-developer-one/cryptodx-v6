
export interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  price: number; // in USD
  change24h: number; // percentage change in the last 24 hours
  logo?: string;
  cmcRank?: number;
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
