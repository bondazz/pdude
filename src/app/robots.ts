import { MetadataRoute } from 'next';
import { SITE_DOMAIN } from '@/lib/seo';

const customDisallowRules = [
  '/api/',
  '/cdn-cgi/',
  '/go/*',
  '/out/*',
  '/json/*',
  '/*/json/*',
  '/ar/ar/',
  '/az/az/',
  '/cs/cs/',
  '/da/da/',
  '/de/de/',
  '/el/el/',
  '/en/en/',
  '/es/es/',
  '/fi/fi/',
  '/fr/fr/',
  '/he/he/',
  '/hi/hi/',
  '/hr/hr/',
  '/hu/hu/',
  '/id/id/',
  '/it/it/',
  '/ja/ja/',
  '/ko/ko/',
  '/nl/nl/',
  '/no/no/',
  '/pl/pl/',
  '/pt/pt/',
  '/ro/ro/',
  '/ru/ru/',
  '/sl/sl/',
  '/sv/sv/',
  '/th/th/',
  '/tr/tr/',
  '/vi/vi/',
  '/zh/zh/',
  '/*?ref=',
  '/*&ref=',
  '/*?utm_',
  '/*&utm_',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: customDisallowRules,
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot'],
        allow: '/',
        disallow: customDisallowRules,
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot'],
        allow: ['/', '/llms.txt'],
        disallow: customDisallowRules,
      },
    ],
    sitemap: `${SITE_DOMAIN}/sitemap.xml`,
    host: SITE_DOMAIN,
  };
}
