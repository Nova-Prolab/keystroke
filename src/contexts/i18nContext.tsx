
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

const locales = ['en', 'es', 'pt'] as const;
type Locale = typeof locales[number];
const defaultLocale: Locale = 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number | React.ReactNode>) => any; // Allow ReactNode for rich text
  translations: Record<string, any>;
  isInitialized: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getBrowserLocale = (): Locale => {
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    if (locales.includes(browserLang as Locale)) {
      return browserLang as Locale;
    }
  }
  return defaultLocale;
};

export const I18nProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialLocale = getBrowserLocale();
    setLocaleState(initialLocale);
  }, []);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsInitialized(false); // Set to false while loading new translations
      try {
        const module = await import(`@/locales/${locale}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Failed to load translations for locale: ${locale}`, error);
        if (locale !== defaultLocale) {
          try {
            const fallbackModule = await import(`@/locales/${defaultLocale}.json`);
            setTranslations(fallbackModule.default);
            setLocaleState(defaultLocale); // Fallback to default locale
          } catch (fallbackError) {
            console.error(`Failed to load fallback translations for locale: ${defaultLocale}`, fallbackError);
            setTranslations({}); // Empty translations if default also fails
          }
        } else {
            setTranslations({});
        }
      } finally {
        setIsInitialized(true);
      }
    };

    loadTranslations();
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number | React.ReactNode>): any => {
    if (!isInitialized || !translations) return key; 
    
    let translation = key.split('.').reduce((obj, k) => obj && obj[k], translations);
    
    if (typeof translation !== 'string') {
      console.warn(`Translation key "${key}" not found or not a string for locale "${locale}".`);
      return key;
    }
    
    if (params) {
      Object.keys(params).forEach(paramKey => {
        const value = params[paramKey];
        // This basic replacement won't work well if params[paramKey] is a ReactNode.
        // For complex cases, consider a library or component-based approach like <Trans>.
        // For now, assuming params are mostly strings/numbers for simple replacement.
        if (typeof value === 'string' || typeof value === 'number') {
          translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
        }
      });
    }
    return translation;
  }, [translations, locale, isInitialized]);

  const value = useMemo(() => ({
    locale,
    setLocale,
    t,
    translations,
    isInitialized
  }), [locale, setLocale, t, translations, isInitialized]);

  // Render children immediately; context will update once initialized
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const getHtmlLang = (locale: Locale): string => {
    return locale;
};
