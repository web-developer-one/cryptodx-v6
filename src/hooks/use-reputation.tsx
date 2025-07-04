'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ReputationContextType {
  isReputationCheckEnabled: boolean;
  toggleReputationCheck: (enabled: boolean) => void;
}

const ReputationContext = createContext<ReputationContextType | null>(null);

export function ReputationProvider({ children }: { children: React.ReactNode }) {
  const [isReputationCheckEnabled, setIsReputationCheckEnabled] = useState(true);

  useEffect(() => {
    // This effect runs only on the client-side to avoid hydration mismatch
    // by accessing localStorage.
    const savedPreference = localStorage.getItem('reputation_check_enabled');
    if (savedPreference !== null) {
      setIsReputationCheckEnabled(JSON.parse(savedPreference));
    }
  }, []);

  const toggleReputationCheck = useCallback((enabled: boolean) => {
    setIsReputationCheckEnabled(enabled);
    localStorage.setItem('reputation_check_enabled', JSON.stringify(enabled));
  }, []);

  const value = {
    isReputationCheckEnabled,
    toggleReputationCheck,
  };

  return (
    <ReputationContext.Provider value={value}>
      {children}
    </ReputationContext.Provider>
  );
}

export const useReputation = () => {
  const context = useContext(ReputationContext);
  if (context === null) {
    throw new Error('useReputation must be used within a ReputationProvider');
  }
  return context;
};
