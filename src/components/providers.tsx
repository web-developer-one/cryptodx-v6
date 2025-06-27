'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect, coinbaseWallet, injected } from 'wagmi/connectors'

const projectId = "3a0c242c73335025262c5c4dcb7c41f7";

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask({ dAppName: 'Crypto Swap' }),
    coinbaseWallet({ appName: 'Crypto Swap' }),
    walletConnect({ projectId, metadata: {
        name: 'Crypto Swap',
        description: 'Swap your favorite cryptocurrencies with ease and confidence.',
        url: 'https://example.com',
        icons: ['https://placehold.co/64x64.png']
    }}),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
