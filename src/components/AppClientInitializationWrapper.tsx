
"use client";

import type React from 'react';
import { useEffect } from 'react';
import { getHtmlLang, useI18n } from '@/contexts/i18nContext';

// This component wraps the main content and handles client-side i18n effects like updating lang and title.
export default function AppClientInitializationWrapper({ children }: { children: React.ReactNode }) {
  const { locale, isInitialized, t } = useI18n();

  useEffect(() => {
    if (isInitialized) {
      document.documentElement.lang = getHtmlLang(locale);
      const pageTitle = t('pageTitle');
      // Update title only if translation is found and it's not the key itself
      if (pageTitle && pageTitle !== 'pageTitle') { 
        document.title = pageTitle;
      }
    }
  }, [locale, isInitialized, t]);

  if (!isInitialized) {
    // Return null to prevent rendering children (like page.tsx) until i18n is ready.
    // page.tsx will handle its own loading display once i18n isInitialized.
    return null;
  }

  return <>{children}</>;
}

