import { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n';
import { CATEGORIES } from '@/data/categories';
import { SITES } from '@/data/sites';
import { SITE_DOMAIN, generateHreflangAlternates } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Homepages per locale
  LOCALES.forEach((locale) => {
    sitemapEntries.push({
      url: `${SITE_DOMAIN}/${locale.code}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: generateHreflangAlternates(''),
      },
    });
  });

  // 2. Category pages per locale
  LOCALES.forEach((locale) => {
    CATEGORIES.forEach((cat) => {
      sitemapEntries.push({
        url: `${SITE_DOMAIN}/${locale.code}/${cat.slug}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9,
        alternates: {
          languages: generateHreflangAlternates(cat.slug),
        },
      });
    });
  });

  // 3. Review pages per locale
  LOCALES.forEach((locale) => {
    SITES.forEach((site) => {
      sitemapEntries.push({
        url: `${SITE_DOMAIN}/${locale.code}/review/${site.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: generateHreflangAlternates(`review/${site.slug}`),
        },
      });
    });
  });

  return sitemapEntries;
}
