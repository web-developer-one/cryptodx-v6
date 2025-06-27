export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  price: number; // in USD
  change24h: number; // percentage change in the last 24 hours
}
