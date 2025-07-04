
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translateTexts } from '@/ai/flows/translate-text';
import englishMessages from '../../messages/en.json';
import { useToast } from './use-toast';
import { get, set } from 'idb-keyval';
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
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Reads the initial language from localStorage. Safe for client components.
const getInitialLanguage = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('language') || 'en';
    }
    return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState(getInitialLanguage);
  const [translations, setTranslations] = useState<Translations>(englishMessages);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // This effect runs whenever the `language` state changes to load the correct translations.
  useEffect(() => {
    const loadTranslations = async () => {
      if (language === 'en') {
        setTranslations(englishMessages);
        return;
      }

      // Check cache first
      try {
        const cachedTranslations = await get(`translations_${language}`);
        if (cachedTranslations) {
          setTranslations(cachedTranslations);
          return;
        }
      } catch (e) {
        console.warn("Could not read from IndexedDB, proceeding with network request.", e)
      }

      const languageToTranslateTo = languages.find(l => l.code === language);
      if (!languageToTranslateTo) {
        console.error(`Language with code ${language} not found.`);
        return;
      }
      
      const languageNameForAI = languageToTranslateTo.englishName;
      const languageDisplayName = languageToTranslateTo.displayName;
      
      setIsLoading(true);
      try {
        const result = await translateTexts({
          texts: englishMessages,
          targetLanguage: languageNameForAI,
        });

        if (result && result.translations) {
          setTranslations(result.translations);
          await set(`translations_${language}`, result.translations);
        } else {
          throw new Error("AI did not return translations.");
        }
      } catch (error) {
        console.error("Translation failed:", error);
        toast({
          variant: "destructive",
          title: "Translation Error",
          description: `Could not translate to ${languageDisplayName}. Reverting to English.`,
        });
        setLanguageState('en'); // Revert to English on failure
        localStorage.setItem('language', 'en');
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language, toast]);


  // This is the function exposed to components (like the Header) to trigger a language change.
  const setLanguage = useCallback((langCode: string) => {
    if (langCode !== language && !isLoading) { // Only update if language is different and not already loading
        setLanguageState(langCode);
        localStorage.setItem('language', langCode);
    }
  }, [language, isLoading]);

  const t = useCallback((key: string): string => {
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      return String(value);
    }
    // Fallback to English if a specific translation is missing for the selected language.
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
