import type { Cryptocurrency } from '@/lib/types';

export const cryptocurrencies: Cryptocurrency[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 68000.50 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3500.20 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', price: 150.75 },
  { id: 'usd-coin', name: 'USD Coin', symbol: 'USDC', price: 1.00 },
  { id: 'tether', name: 'Tether', symbol: 'USDT', price: 1.00 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.15 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.45 },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', price: 0.52 },
];
