
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import englishMessages from '../messages/en.json';
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

const getNestedValue = (obj: Record<string, any>, path: string): string | undefined => {
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj as any);
  return typeof value === 'string' ? value : undefined;
};

// A mapping of language codes to their message files for dynamic import.
const messageImports: Record<string, () => Promise<{ default: Translations }>> = {
  en: () => import('../messages/en.json'),
  es: () => import('../messages/es.json'),
  fr: () => import('../messages/fr.json'),
  de: () => import('../messages/de.json'),
  pt: () => import('../messages/pt.json'),
  ru: () => import('../messages/ru.json'),
  ja: () => import('../messages/ja.json'),
  'zh-CN': () => import('../messages/zh-CN.json'),
  ko: () => import('../messages/ko.json'),
  ar: () => import('../messages/ar.json'),
  hi: () => import('../messages/hi.json'),
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en');
  const [translations, setTranslations] = useState<Translations>(englishMessages);
  const [isLoading, setIsLoading] = useState(false);

  // On initial client-side mount, detect and set the language preference.
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    let targetLanguage = 'en';

    if (savedLanguage && messageImports[savedLanguage]) {
      targetLanguage = savedLanguage;
    } else {
      const browserLangs = navigator.languages || [navigator.language];
      for (const lang of browserLangs) {
        const exactMatch = languages.find(l => l.code.toLowerCase() === lang.toLowerCase());
        if (exactMatch && messageImports[exactMatch.code]) {
          targetLanguage = exactMatch.code;
          break;
        }
        const genericLang = lang.split('-')[0];
        const genericMatch = languages.find(l => l.code === genericLang);
        if (genericMatch && messageImports[genericMatch.code]) {
          targetLanguage = genericMatch.code;
          break;
        }
      }
    }
    
    setLanguage(targetLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback(async (langCode: string) => {
    if (langCode === language && !isLoading) return;
    
    if (!messageImports[langCode]) {
      console.warn(`Language "${langCode}" is not supported. Defaulting to English.`);
      langCode = 'en';
    }

    setIsLoading(true);
    try {
      const module = await messageImports[langCode]();
      setTranslations(module.default);
      setLanguageState(langCode);
      localStorage.setItem('language', langCode);
    } catch (error) {
      console.error(`Failed to load language file for ${langCode}:`, error);
      setTranslations(englishMessages);
      setLanguageState('en');
      localStorage.setItem('language', 'en');
    } finally {
      setIsLoading(false);
    }
  }, [language, isLoading]);

  const t = useCallback((key: string): string => {
    // Look for translation in current language, fallback to English, then to the key itself.
    const value = getNestedValue(translations, key) || getNestedValue(englishMessages, key);
    return value || key;
  }, [translations]);

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

    