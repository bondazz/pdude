import { LOCALES, getMascotImage } from './i18n';
import { CategoryItem, Locale, SiteItem } from './types';

export const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://pornhub.net.co';

export const HREFLANG_CODES: string[] = [
  'ar', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'he',
  'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'nl', 'no', 'pl',
  'pt', 'ro', 'ru', 'sl', 'sv', 'th', 'tr', 'vi', 'zh', 'az'
];

export function getFullUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_DOMAIN}${cleanPath}`;
}

export function generateHreflangAlternates(pathWithoutLocale: string) {
  const cleanPath = pathWithoutLocale.replace(/^\/?[a-z]{2}(\/|$)/, '').replace(/^\//, '');
  
  // English / default clean URL (Self Canonical x-default)
  const defaultUrl = cleanPath ? `${SITE_DOMAIN}/${cleanPath}` : `${SITE_DOMAIN}/`;

  const languages: Record<string, string> = {
    'x-default': defaultUrl,
  };

  HREFLANG_CODES.forEach((code) => {
    if (code === 'en') {
      languages['en'] = defaultUrl;
    } else {
      languages[code] = `${SITE_DOMAIN}/${code}${cleanPath ? `/${cleanPath}` : ''}`;
    }
  });

  return languages;
}

export function generateWebsiteSchema(locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_DOMAIN}/#organization`,
        name: 'The Porn Dude',
        url: `${SITE_DOMAIN}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_DOMAIN}${getMascotImage(locale)}`,
          width: 1024,
          height: 1024,
        },
        sameAs: [
          'https://twitter.com/pornhubnetco',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_DOMAIN}/#website`,
        url: `${SITE_DOMAIN}/`,
        name: 'The Porn Dude',
        description: 'The Porn Dude reviews the best adult sites & free tubes list of 2026. Handpicked, virus-free, and sorted by quality.',
        publisher: {
          '@id': `${SITE_DOMAIN}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_DOMAIN}/en/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function generateCategorySchema(
  category: CategoryItem,
  sites: SiteItem[],
  locale: Locale
) {
  const categoryPath = locale === 'en' ? `/${category.slug}` : `/${locale}/${category.slug}`;
  const categoryUrl = `${SITE_DOMAIN}${categoryPath}`;
  const homeUrl = `${SITE_DOMAIN}/`;

  const itemListElements = sites.map((site, index) => {
    const reviewPath = locale === 'en' ? `/review/${site.slug}` : `/${locale}/review/${site.slug}`;
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: site.name,
      url: `${SITE_DOMAIN}${reviewPath}`,
      item: {
        '@type': 'WebSite',
        name: site.name,
        url: site.url,
        description: site.shortDescription[locale] || site.shortDescription.en,
      },
    };
  });

  const faqElements = (category.faqs || []).map((faq) => ({
    '@type': 'Question',
    name: faq.question[locale] || faq.question.en,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer[locale] || faq.answer.en,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${categoryUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'PornDude',
            item: homeUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: category.name[locale] || category.name.en,
            item: categoryUrl,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${categoryUrl}#itemlist`,
        name: category.name[locale] || category.name.en,
        url: categoryUrl,
        numberOfItems: sites.length,
        itemListElement: itemListElements,
      },
      ...(faqElements.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${categoryUrl}#faq`,
              mainEntity: faqElements,
            },
          ]
        : []),
    ],
  };
}

export function generateReviewSchema(
  site: SiteItem,
  locale: Locale,
  category?: CategoryItem | null
) {
  const homeUrl = `${SITE_DOMAIN}/`;
  const categoryPath = category
    ? locale === 'en'
      ? `/${category.slug}`
      : `/${locale}/${category.slug}`
    : locale === 'en'
    ? '/categories'
    : `/${locale}/categories`;
  const categoryUrl = `${SITE_DOMAIN}${categoryPath}`;
  const categoryName = category ? category.name[locale] || category.name.en : 'Categories';

  const reviewPath = locale === 'en' ? `/review/${site.slug}` : `/${locale}/review/${site.slug}`;
  const reviewUrl = `${SITE_DOMAIN}${reviewPath}`;

  // Scaling rating safely to 1-5 scale per Google Product AggregateRating standards
  const rawRating = Number(site.rating) || 4.5;
  const rating5Scale = rawRating > 5 ? Number((rawRating / 2).toFixed(2)) : Number(rawRating.toFixed(2));
  const reviewVotes = Number(site.votesCount) || Number(site.reviewCount) || 15514;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${reviewUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'PornDude',
            item: homeUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: categoryName,
            item: categoryUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: site.name,
            item: reviewUrl,
          },
        ],
      },
      {
        '@type': 'Product',
        '@id': `${reviewUrl}#product`,
        name: site.name,
        description: site.shortDescription[locale] || site.shortDescription.en,
        image: `${SITE_DOMAIN}/api/screenshot?domain=${site.domain}`,
        brand: {
          '@type': 'Brand',
          name: site.name,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating5Scale,
          reviewCount: reviewVotes,
          bestRating: 5,
          worstRating: 1,
        },
        review: {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            '@id': `${SITE_DOMAIN}/about#editor`,
            name: 'The Porn Dude',
          },
          datePublished: '2026-01-01',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: Math.min(5, Math.max(1, Math.round(rating5Scale))),
            bestRating: 5,
            worstRating: 1,
          },
          reviewBody:
            site.longReview[locale] ||
            site.longReview.en ||
            site.shortDescription[locale] ||
            site.shortDescription.en,
        },
      },
    ],
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
