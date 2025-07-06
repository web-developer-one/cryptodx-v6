
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import englishMessages from '../messages/en.json';
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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always default to English initially to prevent hydration mismatch.
  const [language, setLanguageState] = useState('en');
  const [translations, setTranslations] = useState<Translations>(englishMessages);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // On initial client-side mount, detect and set the language.
  useEffect(() => {
    // This logic runs only once on the client.
    const savedLanguage = localStorage.getItem('language');
    let targetLanguage = 'en'; // Default language

    if (savedLanguage) {
      // A language was explicitly set by the user on a previous visit.
      targetLanguage = savedLanguage;
    } else {
      // For a first-time user, try to auto-detect from browser settings.
      const browserLangs = navigator.languages || [navigator.language];
      for (const lang of browserLangs) {
        // Check for an exact match first (e.g., 'zh-CN')
        const exactMatch = languages.find(l => l.code.toLowerCase() === lang.toLowerCase());
        if (exactMatch) {
          targetLanguage = exactMatch.code;
          break; // Found the best possible match
        }
        // If no exact match, check for a generic match (e.g., 'en' from 'en-US')
        const genericLang = lang.split('-')[0];
        const genericMatch = languages.find(l => l.code === genericLang);
        if (genericMatch) {
          targetLanguage = genericMatch.code;
          break; // Found a good enough match
        }
      }
    }
    
    // Set the determined language. This will trigger the translation loading effect if not 'en'.
    setLanguageState(targetLanguage);
    
    // If we auto-detected a language, save it so we don't have to detect it again.
    if (!savedLanguage) {
      localStorage.setItem('language', targetLanguage);
    }
  }, []); // Empty dependency array ensures this runs only once on mount.


  // This effect runs whenever the `language` state changes to load the correct translations.
  useEffect(() => {
    const loadTranslations = async () => {
      if (language === 'en') {
        setTranslations(englishMessages);
        setIsLoading(false); // Ensure loading is false for English
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
        setIsLoading(false); // Stop loading if language is invalid
        return;
      }
      
      const languageNameForAI = languageToTranslateTo.englishName;
      const languageDisplayName = languageToTranslateTo.displayName;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                texts: englishMessages,
                targetLanguage: languageNameForAI,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result && result.translations) {
          setTranslations(result.translations);
          await set(`translations_${language}`, result.translations);
        } else {
          throw new Error("API did not return translations.");
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
        setTranslations(englishMessages);
      } finally {
        setIsLoading(false);
      }
    };

    if (language) { // Only run if language is set
        loadTranslations();
    }
  }, [language, toast]);


  // This is the function exposed to components (like the Header) to trigger a language change.
  const setLanguage = useCallback((langCode: string) => {
    if (langCode !== language && !isLoading) { // Only update if language is different and not already loading
        localStorage.setItem('language', langCode);
        setLanguageState(langCode);
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
