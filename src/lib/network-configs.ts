
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
