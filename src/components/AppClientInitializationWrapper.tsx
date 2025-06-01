
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
     // Render a simple loading indicator while translations are being initialized.
     // The main page structure (html, body) is already rendered by RootLayout.
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
