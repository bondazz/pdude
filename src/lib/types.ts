export type Locale = 'en' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'ru' | 'tr' | 'az' | 'ja' | 'zh' | 'ar';

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
  shortDescription: Record<Locale, string>;
  longReview: Record<Locale, string>;
  pros: Record<Locale, string[]>;
  cons: Record<Locale, string[]>;
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
  name: Record<Locale, string>;
  tagline: Record<Locale, string>;
  description: Record<Locale, string>;
  seoTitle: Record<Locale, string>;
  seoDescription: Record<Locale, string>;
  icon: string;
  colorRgb: string; // e.g. "255, 151, 1"
  hexColor: string; // e.g. "#ff9701"
  faqs: Array<{
    question: Record<Locale, string>;
    answer: Record<Locale, string>;
  }>;
}

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}
