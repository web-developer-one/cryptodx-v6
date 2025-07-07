
'use client'

import React from 'react';
import { WalletProvider } from '@/hooks/use-wallet';
import { LanguageProvider } from '@/hooks/use-language';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WalletProvider>
          {children}
      </WalletProvider>
    </LanguageProvider>
  );
}
