
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translateTexts } from '@/ai/flows/translate-text';
import englishMessages from '@/messages/en.json';
import { useToast } from './use-toast';
import { get, set } from 'idb-keyval';

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
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en');
  const [translations, setTranslations] = useState<Translations>(englishMessages);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const setLanguage = useCallback(async (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    if (lang === 'en') {
      setTranslations(englishMessages);
      return;
    }
    
    // Check cache first
    try {
      const cachedTranslations = await get(`translations_${lang}`);
      if (cachedTranslations) {
        setTranslations(cachedTranslations);
        return;
      }
    } catch (e) {
      console.warn("Could not read from IndexedDB, proceeding with network request.", e)
    }


    setIsLoading(true);
    try {
      const result = await translateTexts({
        texts: englishMessages,
        targetLanguage: lang,
      });
      
      if (result && result.translations) {
        setTranslations(result.translations);
        await set(`translations_${lang}`, result.translations); // Cache the result
      } else {
        throw new Error("AI did not return translations.");
      }

    } catch (error) {
      console.error("Translation failed:", error);
      toast({
        variant: "destructive",
        title: "Translation Error",
        description: `Could not translate to ${lang}. Please try again later.`,
      });
      setLanguageState('en'); // Revert to English on failure
      setTranslations(englishMessages);
      localStorage.setItem('language', 'en');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const t = useCallback((key: string): string => {
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      return String(value);
    }
    // Fallback to English if translation is missing
    const fallbackValue = getNestedValue(englishMessages, key);
    return fallbackValue || key;
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
