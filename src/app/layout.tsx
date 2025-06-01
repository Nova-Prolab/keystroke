
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from '@/contexts/i18nContext';
import AppClientInitializationWrapper from '@/components/AppClientInitializationWrapper';

export const metadata: Metadata = {
  title: 'Keystroke Insights', // Default title, can be updated by page component
  description: 'Analyze your typing speed and accuracy.', // Default description
};

const defaultLocale = 'en'; // Match defaultLocale in i18nContext

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Default lang attribute, will be updated client-side by AppClientInitializationWrapper
    <html lang={defaultLocale} suppressHydrationWarning> 
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased overflow-x-hidden">
        <I18nProvider>
          <AppClientInitializationWrapper>
            {children}
          </AppClientInitializationWrapper>
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
