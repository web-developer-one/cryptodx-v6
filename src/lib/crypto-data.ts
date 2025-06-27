import type { Cryptocurrency } from '@/lib/types';

export const cryptocurrencies: Cryptocurrency[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 68000.50, change24h: 2.5 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3500.20, change24h: -1.2 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', price: 150.75, change24h: 5.8 },
  { id: 'usd-coin', name: 'USD Coin', symbol: 'USDC', price: 1.00, change24h: 0.01 },
  { id: 'tether', name: 'Tether', symbol: 'USDT', price: 1.00, change24h: -0.02 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.15, change24h: -3.1 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.45, change24h: 1.5 },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP', price: 0.52, change24h: 0.8 },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', price: 0.000028, change24h: 12.3 },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', price: 0.000011, change24h: -5.6 },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB', price: 0.000025, change24h: 7.1 },
];
