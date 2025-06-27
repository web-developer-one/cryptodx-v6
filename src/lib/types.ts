export interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  price: number; // in USD
  change24h: number; // percentage change in the last 24 hours
  logo?: string;
}
