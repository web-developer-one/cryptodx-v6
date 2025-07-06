
'use client'

import React from 'react';
import { WalletProvider } from '@/hooks/use-wallet';
import { LanguageProvider } from '@/hooks/use-language';
import { AuthProvider } from '@/hooks/use-auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
        <WalletProvider>
            <LanguageProvider>
            {children}
            </LanguageProvider>
        </WalletProvider>
    </AuthProvider>
  );
}
