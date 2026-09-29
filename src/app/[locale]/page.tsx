import React from 'react';
import type { Metadata } from 'next';
import { getCategories, getSitesByCategory } from '@/lib/dataService';
import { getTranslation, isValidLocale } from '@/lib/i18n';
import { Locale } from '@/lib/types';
import { generateHreflangAlternates, generateWebsiteSchema, SITE_DOMAIN } from '@/lib/seo';
import CategoryCard from '@/components/CategoryCard';
import ScrollSpy from '@/components/ScrollSpy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';

  const title = 'Best Porn Sites & Free Porn Tubes List of 2026! | PornHub.net.co';
  const description = 'PornHub.net.co reviews the world\'s best porn sites of 2026. Hand-picked safe free porn sites and premium porn websites sorted by quality!';

  return {
    title,
    description,
    keywords: [
      'best porn sites 2026',
      'pornhub.net.co',
      'pornhub.net.co directory',
      'free porn tube sites',
      'safe adult websites',
      'hd porn sites',
      'vr porn',
      'ai porn sites',
      'live cam sites',
      'top premium porn',
    ],
    metadataBase: new URL(SITE_DOMAIN),
    alternates: {
      canonical: locale === 'en' ? `${SITE_DOMAIN}/` : `${SITE_DOMAIN}/${locale}`,
      languages: generateHreflangAlternates(''),
    },
    openGraph: {
      title,
      description,
      url: locale === 'en' ? `${SITE_DOMAIN}/` : `${SITE_DOMAIN}/${locale}`,
      siteName: 'PornHub.net.co',
      type: 'website',
      images: [
        {
          url: `${SITE_DOMAIN}/images/thepornhub_net_co.webp`,
          width: 1024,
          height: 1024,
          alt: 'PornHub.net.co Reviews 2026',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';
  const websiteSchema = generateWebsiteSchema();

  // Retrieve cached categories and sites in < 1ms
  const categories = await getCategories();

  // Map category sites concurrently from in-memory cache
  const sitesEntries = await Promise.all(
    categories.map(async (cat) => [cat.slug, await getSitesByCategory(cat.slug)] as const)
  );
  const sitesMap = new Map(sitesEntries);

  // Distribute categories into 4 masonry columns for organic varied downward heights
  const columnCount = 4;
  const columns: Array<typeof categories> = Array.from({ length: columnCount }, () => []);
  categories.forEach((category, index) => {
    columns[index % columnCount].push(category);
  });

  return (
    <>
      {/* Schema.org WebSite & Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <main className="main">
        {/* The Authentic 4-Column Categories Grid Container */}
        <div className="categories-grid container" role="region" aria-label="Adult Site Categories">
          {columns.map((colCategories, colIdx) => (
            <div
              key={colIdx}
              className={`category-column category-column-${colIdx + 1}`}
              style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
            >
              {colCategories.map((category) => {
                const categorySites = sitesMap.get(category.slug) || [];
                return (
                  <CategoryCard
                    key={category.slug}
                    category={category}
                    sites={categorySites}
                    locale={locale}
                    columnIndex={colIdx + 1}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Floating Circular Progress Scrollspy Button */}
        <ScrollSpy />
      </main>
    </>
  );
}
