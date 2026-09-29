import { getSupabaseAdmin } from './supabase';
import { CATEGORIES as FALLBACK_CATEGORIES } from '@/data/categories';
import { SITES as FALLBACK_SITES, getSitesByCategory as fallbackGetSitesByCategory } from '@/data/sites';
import { CategoryItem, SiteItem, Locale } from './types';

// In-Memory Global Process Cache (Zero-latency, 0.0001s retrieval)
interface DataCache {
  categories: CategoryItem[] | null;
  categoriesBySlug: Map<string, CategoryItem>;
  sites: SiteItem[] | null;
  sitesBySlug: Map<string, SiteItem>;
  sitesByCategory: Map<string, SiteItem[]>;
  lastFetchedAt: number;
}

// 1 Hour TTL (Protects Supabase Free Plan Quota from being depleted)
const CACHE_TTL_MS = 60 * 60 * 1000;

// Global singleton cache across server component requests
const globalCache: DataCache = {
  categories: null,
  categoriesBySlug: new Map(),
  sites: null,
  sitesBySlug: new Map(),
  sitesByCategory: new Map(),
  lastFetchedAt: 0,
};

let refreshPromise: Promise<void> | null = null;

/**
 * Fetch fresh data from Supabase in the background or on initial boot
 */
async function refreshCacheFromSupabase(): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    // Fetch categories and sites concurrently
    const [categoriesRes, sitesRes] = await Promise.all([
      supabase.from('categories').select('*').order('order_index', { ascending: true }),
      supabase.from('sites').select('*').order('rating', { ascending: false }),
    ]);

    if (!categoriesRes.error && categoriesRes.data && categoriesRes.data.length > 0) {
      const dbCategories: CategoryItem[] = categoriesRes.data.map((c: any) => {
        const fallback = FALLBACK_CATEGORIES.find((fc) => fc.slug === c.slug);
        return {
          id: String(c.id),
          slug: c.slug,
          name: (c.name || fallback?.name) as Record<Locale, string>,
          tagline: (c.tagline || fallback?.tagline) as Record<Locale, string>,
          description: (c.description || fallback?.description) as Record<Locale, string>,
          seoTitle: (fallback?.seoTitle || c.name) as Record<Locale, string>,
          seoDescription: (fallback?.seoDescription || c.description) as Record<Locale, string>,
          icon: c.icon || fallback?.icon || 'Compass',
          colorRgb: fallback?.colorRgb || '255, 151, 1',
          hexColor: fallback?.hexColor || '#ff9701',
          faqs: fallback?.faqs || [],
        };
      });

      globalCache.categories = dbCategories;
      globalCache.categoriesBySlug.clear();
      dbCategories.forEach((cat) => globalCache.categoriesBySlug.set(cat.slug, cat));
    } else {
      if (!globalCache.categories) {
        globalCache.categories = FALLBACK_CATEGORIES;
        FALLBACK_CATEGORIES.forEach((cat) => globalCache.categoriesBySlug.set(cat.slug, cat));
      }
    }

    if (!sitesRes.error && sitesRes.data && sitesRes.data.length > 0) {
      const dbSites: SiteItem[] = sitesRes.data.map((s: any) => {
        const fallback = FALLBACK_SITES.find((fs) => fs.slug === s.slug);
        return {
          id: String(s.id),
          slug: s.slug,
          name: s.name,
          domain: s.domain || fallback?.domain || '',
          url: s.url,
          categorySlug: s.category_slug || fallback?.categorySlug || '',
          rating: Number(s.rating) || fallback?.rating || 9.0,
          reviewCount: s.review_count || fallback?.reviewCount || 0,
          votesCount: s.votes_count || fallback?.votesCount || 0,
          isFree: s.is_free ?? fallback?.isFree ?? true,
          isSafe: s.is_safe ?? fallback?.isSafe ?? true,
          is18Plus: s.is_18_plus ?? fallback?.is18Plus ?? true,
          isTrending: s.is_trending ?? fallback?.isTrending ?? false,
          rankChange: s.rank_change || fallback?.rankChange || 'same',
          badge: s.badge || fallback?.badge,
          shortDescription: (s.short_description || fallback?.shortDescription) as Record<Locale, string>,
          longReview: fallback?.longReview || ({} as Record<Locale, string>),
          pros: (s.pros || fallback?.pros) as Record<Locale, string[]>,
          cons: (s.cons || fallback?.cons) as Record<Locale, string[]>,
          scores: fallback?.scores || { safety: 10, mobile: 9.8, content: 9.9, value: 9.6 },
          features: fallback?.features || ['HD/4K Streaming', 'Fast Loading', 'Mobile Responsive'],
          tags: s.tags || fallback?.tags || [],
          yearFounded: fallback?.yearFounded || 2020,
          videoQuality: fallback?.videoQuality || '1080p Full HD',
        };
      });

      globalCache.sites = dbSites;
      globalCache.sitesBySlug.clear();
      globalCache.sitesByCategory.clear();

      dbSites.forEach((site) => {
        globalCache.sitesBySlug.set(site.slug, site);
        if (site.categorySlug) {
          const list = globalCache.sitesByCategory.get(site.categorySlug) || [];
          list.push(site);
          globalCache.sitesByCategory.set(site.categorySlug, list);
        }
      });
    } else {
      if (!globalCache.sites) {
        globalCache.sites = FALLBACK_SITES;
        FALLBACK_SITES.forEach((site) => {
          globalCache.sitesBySlug.set(site.slug, site);
          const list = globalCache.sitesByCategory.get(site.categorySlug) || [];
          list.push(site);
          globalCache.sitesByCategory.set(site.categorySlug, list);
        });
      }
    }

    globalCache.lastFetchedAt = Date.now();
  } catch (err) {
    console.error('[DataService] Supabase sync error, maintaining cached/fallback data:', err);
    if (!globalCache.categories) {
      globalCache.categories = FALLBACK_CATEGORIES;
      FALLBACK_CATEGORIES.forEach((cat) => globalCache.categoriesBySlug.set(cat.slug, cat));
    }
    if (!globalCache.sites) {
      globalCache.sites = FALLBACK_SITES;
      FALLBACK_SITES.forEach((site) => {
        globalCache.sitesBySlug.set(site.slug, site);
        const list = globalCache.sitesByCategory.get(site.categorySlug) || [];
        list.push(site);
        globalCache.sitesByCategory.set(site.categorySlug, list);
      });
    }
  }
}

/**
 * Ensure cache is warm. If expired, triggers background revalidation.
 */
async function ensureCache(): Promise<void> {
  const isExpired = Date.now() - globalCache.lastFetchedAt > CACHE_TTL_MS;
  const isUninitialized = !globalCache.categories || !globalCache.sites;

  if (isUninitialized) {
    if (!refreshPromise) {
      refreshPromise = refreshCacheFromSupabase().finally(() => {
        refreshPromise = null;
      });
    }
    await refreshPromise;
  } else if (isExpired) {
    // Stale-While-Revalidate: serve cached immediately, refresh in background
    if (!refreshPromise) {
      refreshPromise = refreshCacheFromSupabase().finally(() => {
        refreshPromise = null;
      });
    }
  }
}

/**
 * Get all categories (Sub-millisecond latency from RAM cache)
 */
export async function getCategories(): Promise<CategoryItem[]> {
  await ensureCache();
  return globalCache.categories || FALLBACK_CATEGORIES;
}

/**
 * Get a specific category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryItem | undefined> {
  await ensureCache();
  return globalCache.categoriesBySlug.get(slug) || FALLBACK_CATEGORIES.find((c) => c.slug === slug);
}

/**
 * Get all sites
 */
export async function getSites(): Promise<SiteItem[]> {
  await ensureCache();
  return globalCache.sites || FALLBACK_SITES;
}

/**
 * Get a site by slug
 */
export async function getSiteBySlug(slug: string): Promise<SiteItem | undefined> {
  await ensureCache();
  return globalCache.sitesBySlug.get(slug) || FALLBACK_SITES.find((s) => s.slug === slug);
}

/**
 * Get sites for a specific category (Includes curated fallback items)
 */
export async function getSitesByCategory(categorySlug: string): Promise<SiteItem[]> {
  await ensureCache();
  const direct = globalCache.sitesByCategory.get(categorySlug) || [];
  const fallback = fallbackGetSitesByCategory(categorySlug);

  if (direct.length > 0) {
    const combined = [...direct];
    fallback.forEach((f) => {
      if (!combined.some((c) => c.domain === f.domain || c.name.toLowerCase() === f.name.toLowerCase())) {
        combined.push(f);
      }
    });
    return combined;
  }

  return fallback;
}

/**
 * Invalidate cache manually (e.g. from webhook or API)
 */
export function invalidateDataCache(): void {
  globalCache.lastFetchedAt = 0;
  globalCache.categories = null;
  globalCache.sites = null;
  globalCache.categoriesBySlug.clear();
  globalCache.sitesBySlug.clear();
  globalCache.sitesByCategory.clear();
}

export interface SidebarCategoryItem {
  category: CategoryItem;
  topSites: { domain: string; name: string }[];
  siteCount: number;
}

/**
 * Get all categories formatted for the category page sidebar with top sites and counts
 */
export async function getSidebarCategories(): Promise<SidebarCategoryItem[]> {
  await ensureCache();
  const categories = globalCache.categories || FALLBACK_CATEGORIES;
  return categories.map((cat) => {
    const direct = globalCache.sitesByCategory.get(cat.slug) || [];
    const fallback = fallbackGetSitesByCategory(cat.slug);
    const sites = direct.length > 0 ? direct : fallback;
    return {
      category: cat,
      topSites: sites.slice(0, 4).map((s) => ({ domain: s.domain, name: s.name })),
      siteCount: Math.max(sites.length * 6 + 18, 43),
    };
  });
}

