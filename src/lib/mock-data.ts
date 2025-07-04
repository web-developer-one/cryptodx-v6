
import type { Cryptocurrency, TokenDetails } from './types';

export const mockCryptoData: Cryptocurrency[] = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 68000.50, change24h: 1.5, cmcRank: 1, marketCap: 1300000000000, volume24h: 35000000000, circulatingSupply: 19700000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' },
  { id: 1027, name: 'Ethereum', symbol: 'ETH', price: 3500.25, change24h: -2.1, cmcRank: 2, marketCap: 420000000000, volume24h: 20000000000, circulatingSupply: 120000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
  { id: 825, name: 'Tether USDt', symbol: 'USDT', price: 1.00, change24h: 0.01, cmcRank: 3, marketCap: 110000000000, volume24h: 50000000000, circulatingSupply: 110000000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png' },
  { id: 1839, name: 'BNB', symbol: 'BNB', price: 580.70, change24h: 0.5, cmcRank: 4, marketCap: 85000000000, volume24h: 1500000000, circulatingSupply: 147000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
  { id: 5426, name: 'Solana', symbol: 'SOL', price: 150.10, change24h: 5.2, cmcRank: 5, marketCap: 68000000000, volume24h: 3000000000, circulatingSupply: 460000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png' },
  { id: 3408, name: 'USDC', symbol: 'USDC', price: 1.00, change24h: 0.00, cmcRank: 6, marketCap: 33000000000, volume24h: 7000000000, circulatingSupply: 33000000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
  { id: 52, name: 'XRP', symbol: 'XRP', price: 0.48, change24h: -1.2, cmcRank: 7, marketCap: 26000000000, volume24h: 1200000000, circulatingSupply: 55000000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png' },
  { id: 74, name: 'Dogecoin', symbol: 'DOGE', price: 0.15, change24h: 3.8, cmcRank: 8, marketCap: 21000000000, volume24h: 900000000, circulatingSupply: 144000000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png' },
  { id: 2010, name: 'Cardano', symbol: 'ADA', price: 0.45, change24h: -0.5, cmcRank: 9, marketCap: 16000000000, volume24h: 400000000, circulatingSupply: 35000000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png' },
  { id: 5805, name: 'Avalanche', symbol: 'AVAX', price: 35.50, change24h: 2.3, cmcRank: 10, marketCap: 13000000000, volume24h: 500000000, circulatingSupply: 390000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png' },
  { id: 5994, name: 'Shiba Inu', symbol: 'SHIB', price: 0.000025, change24h: 1.8, cmcRank: 11, marketCap: 14000000000, volume24h: 600000000, circulatingSupply: 589000000000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png' },
  { id: 1958, name: 'Chainlink', symbol: 'LINK', price: 17.80, change24h: 4.1, cmcRank: 14, marketCap: 10000000000, volume24h: 450000000, circulatingSupply: 587000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png' },
  { id: 3717, name: 'Polygon', symbol: 'MATIC', price: 0.72, change24h: -1.9, cmcRank: 18, marketCap: 7000000000, volume24h: 300000000, circulatingSupply: 9800000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png' },
  { id: 7083, name: 'Uniswap', symbol: 'UNI', price: 10.50, change24h: 0.8, cmcRank: 20, marketCap: 6000000000, volume24h: 200000000, circulatingSupply: 753000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png' },
  { id: 2, name: 'Litecoin', symbol: 'LTC', price: 85.00, change24h: 0.2, cmcRank: 22, marketCap: 6000000000, volume24h: 350000000, circulatingSupply: 74000000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2.png' },
  { id: 4943, name: 'Wrapped Bitcoin', symbol: 'WBTC', price: 68050.50, change24h: 1.5, cmcRank: 1, marketCap: 10000000000, volume24h: 200000000, circulatingSupply: 150000, logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png' }
];

export const getMockTokenDetails = (id: string | number): TokenDetails | null => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const basicData = mockCryptoData.find(token => token.id === numericId);

    if (!basicData) {
        return null;
    }

    // Generate some deterministic but fake detailed data
    const totalSupply = (basicData.circulatingSupply || 0) * 1.2;
    const maxSupply = ['BTC', 'LTC'].includes(basicData.symbol) ? totalSupply * 1.1 : null;
    const dateAdded = new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000); // Added within last 5 years

    return {
        ...basicData,
        totalSupply,
        maxSupply,
        dateAdded: dateAdded.toISOString(),
        low24h: basicData.price * (1 - Math.abs(basicData.change24h / 100) * 0.8),
        high24h: basicData.price * (1 + Math.abs(basicData.change24h / 100) * 0.8),
        urls: {
            website: [`https://coinmarketcap.com/currencies/${basicData.name.toLowerCase().replace(/\s/g, '-')}/`],
            technical_doc: [],
            explorer: [`https://etherscan.io/`], // Generic explorer
            twitter: [`https://twitter.com/`],
            reddit: [`https://www.reddit.com/r/${basicData.name.toLowerCase()}/`],
        },
    };
};
