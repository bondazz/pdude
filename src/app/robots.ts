import { MetadataRoute } from 'next';
import { SITE_DOMAIN } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot'],
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot'],
        allow: ['/', '/llms.txt'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_DOMAIN}/sitemap.xml`,
    host: SITE_DOMAIN,
  };
}
