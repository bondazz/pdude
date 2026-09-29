export type Locale =
  | 'ar' | 'cs' | 'da' | 'de' | 'el' | 'en' | 'es' | 'fi' | 'fr' | 'he'
  | 'hi' | 'hr' | 'hu' | 'id' | 'it' | 'ja' | 'ko' | 'nl' | 'no' | 'pl'
  | 'pt' | 'ro' | 'ru' | 'sl' | 'sv' | 'th' | 'tr' | 'vi' | 'zh' | 'az';

export interface SiteItem {
  id: string;
  slug: string;
  name: string;
  domain: string;
  url: string;
  categorySlug: string;
  rating: number; // e.g. 9.8
  reviewCount: number;
  votesCount: number;
  isFree: boolean;
  isSafe: boolean;
  hasSale?: boolean;
  isAiFriendly?: boolean;
  isVrFriendly?: boolean;
  is18Plus?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  rankChange?: 'up' | 'down' | 'same';
  badge?: string;
  shortDescription: Partial<Record<Locale, string>> & { en: string };
  longReview: Partial<Record<Locale, string>> & { en: string };
  pros: Partial<Record<Locale, string[]>> & { en: string[] };
  cons: Partial<Record<Locale, string[]>> & { en: string[] };
  scores: {
    safety: number; // e.g. 10
    mobile: number; // e.g. 9.8
    content: number; // e.g. 9.9
    value: number; // e.g. 9.6
  };
  features: string[];
  tags: string[];
  yearFounded: number;
  videoQuality: string;
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: Partial<Record<Locale, string>> & { en: string };
  tagline: Partial<Record<Locale, string>> & { en: string };
  description: Partial<Record<Locale, string>> & { en: string };
  seoTitle: Partial<Record<Locale, string>> & { en: string };
  seoDescription: Partial<Record<Locale, string>> & { en: string };
  icon: string;
  colorRgb: string; // e.g. "255, 151, 1"
  hexColor: string; // e.g. "#ff9701"
  faqs: Array<{
    question: Partial<Record<Locale, string>> & { en: string };
    answer: Partial<Record<Locale, string>> & { en: string };
  }>;
}

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}
