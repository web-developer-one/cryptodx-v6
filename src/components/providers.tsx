
'use client'

import React from 'react';
import { WalletProvider } from '@/hooks/use-wallet';
import { ReputationProvider } from '@/hooks/use-reputation';
import { LanguageProvider } from '@/hooks/use-language';
import { AuthProvider } from '@/hooks/use-auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WalletProvider>
        <ReputationProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ReputationProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
