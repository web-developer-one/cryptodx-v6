
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import englishMessages from '../messages/en.json';
import { useToast } from './use-toast';
import { languages } from '@/lib/i18n';

type Translations = Record<string, any>;

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  translations: Translations;
  isLoading: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Helper function to access nested properties of an object using a dot-separated string.
const getNestedValue = (obj: Record<string, any>, path: string): string | undefined => {
  // Use `any` for the accumulator to allow traversing from object to primitive.
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj as any);
  // Ensure the final value is a string, otherwise it's not a valid translation.
  return typeof value === 'string' ? value : undefined;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always default to English initially to prevent hydration mismatch.
  const [language, setLanguageState] = useState('en');
  const [translations, setTranslations] = useState<Translations>(englishMessages);
  const isLoading = false; // API translation is disabled.

  // On initial client-side mount, detect and set the language preference.
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    let targetLanguage = 'en';

    if (savedLanguage) {
      targetLanguage = savedLanguage;
    } else {
      const browserLangs = navigator.languages || [navigator.language];
      for (const lang of browserLangs) {
        const exactMatch = languages.find(l => l.code.toLowerCase() === lang.toLowerCase());
        if (exactMatch) {
          targetLanguage = exactMatch.code;
          break;
        }
        const genericLang = lang.split('-')[0];
        const genericMatch = languages.find(l => l.code === genericLang);
        if (genericMatch) {
          targetLanguage = genericMatch.code;
          break;
        }
      }
    }
    
    setLanguageState(targetLanguage);
    if (!savedLanguage) {
      localStorage.setItem('language', targetLanguage);
    }
  }, []);

  // This is the function exposed to components to trigger a language change.
  const setLanguage = useCallback((langCode: string) => {
    localStorage.setItem('language', langCode);
    setLanguageState(langCode);
    // In this simplified version, we just log that the language has changed.
    // All text will remain in English as API translation is disabled.
    console.log(`Language preference changed to ${langCode}. UI will remain in English.`);
  }, []);

  const t = useCallback((key: string): string => {
    // Always use English messages as the translation feature is disabled.
    const value = getNestedValue(englishMessages, key);
    return value || key;
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    translations,
    isLoading,
    t,
  }), [language, setLanguage, translations, isLoading, t]);


  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
