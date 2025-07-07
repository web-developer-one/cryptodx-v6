
'use client'

import React from 'react';
import { WalletProvider } from '@/hooks/use-wallet';
import { LanguageProvider } from '@/hooks/use-language';
import { UserProvider } from '@/hooks/use-user';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <UserProvider>
        <WalletProvider>
            {children}
        </WalletProvider>
      </UserProvider>
    </LanguageProvider>
  );
}
