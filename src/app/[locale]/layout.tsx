import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Saira } from 'next/font/google';
import { LOCALES, isValidLocale } from '@/lib/i18n';
import { Locale } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

const saira = Saira({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-saira',
  display: 'swap',
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({
    locale: locale.code,
  }));
}

export const viewport: Viewport = {
  themeColor: '#ff9701',
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';
  const localeConfig = LOCALES.find((l) => l.code === locale) || LOCALES[0];
  const isRtl = localeConfig.dir === 'rtl';

  return (
    <html lang={locale} dir={localeConfig.dir} className={saira.variable} suppressHydrationWarning>
      <head>
        <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Saira:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={isRtl ? 'rtl-direction' : ''}>
        <Header locale={locale} />
        <main className="main-content">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
