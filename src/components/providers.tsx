'use client'

import { WalletProvider } from '@/hooks/use-wallet';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
}
