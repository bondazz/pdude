import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Saira } from 'next/font/google';
import { LOCALES, isValidLocale, getMascotImage } from '@/lib/i18n';
import { Locale } from '@/lib/types';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-3PPBJV27D2';

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
  const mascotImage = getMascotImage(locale);

  return (
    <html lang={locale} dir={localeConfig.dir} className={saira.variable} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons_ph/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons_ph/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons_ph/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Instant 0ms Preloads for Critical Images */}
        <link rel="preload" as="image" href="/images/background.webp" type="image/webp" fetchPriority="high" />
        <link rel="preload" as="image" href={mascotImage} type="image/webp" fetchPriority="high" />

        {/* Critical Instant Paint Inline CSS - Eliminates ANY white flash or layout jump on Hard Refresh */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            background-color: #0b0d13 !important;
            background-image: url('/images/background.webp') !important;
            background-repeat: repeat !important;
            background-size: 25% auto !important;
            background-attachment: scroll !important;
          }
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Saira:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={isRtl ? 'rtl-direction' : ''}>
        <Header locale={locale} />
        <main className="main-content">{children}</main>
        <Footer locale={locale} />

        {/* Google Analytics 4 (GA4) */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
