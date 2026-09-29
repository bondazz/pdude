import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSiteBySlug, getCategoryBySlug, getSitesByCategory } from '@/lib/dataService';
import { SITES } from '@/data/sites';
import { LOCALES, getTranslation, isValidLocale } from '@/lib/i18n';
import { Locale } from '@/lib/types';
import { generateReviewSchema, generateHreflangAlternates, SITE_DOMAIN } from '@/lib/seo';
import Favicon from '@/components/Favicon';
import ReviewVote from '@/components/ReviewVote';
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Star,
  Award,
  Calendar,
  Tv,
  Globe,
  Tag,
  ArrowRight,
  Compass,
} from 'lucide-react';

export function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];

  LOCALES.forEach((locale) => {
    SITES.forEach((site) => {
      params.push({
        locale: locale.code,
        slug: site.slug,
      });
    });
  });

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';
  const site = await getSiteBySlug(resolvedParams.slug);

  if (!site) {
    return { title: 'Review Not Found' };
  }

  const title = `${site.name} Review 2026: Is It Safe & Worth It? | PornHub.net.co`;
  const description = site.shortDescription[locale] || site.shortDescription.en;

  return {
    title,
    description,
    alternates: {
      canonical: locale === 'en' ? `${SITE_DOMAIN}/review/${site.slug}` : `${SITE_DOMAIN}/${locale}/review/${site.slug}`,
      languages: generateHreflangAlternates(`review/${site.slug}`),
    },
    openGraph: {
      title,
      description,
      url: locale === 'en' ? `${SITE_DOMAIN}/review/${site.slug}` : `${SITE_DOMAIN}/${locale}/review/${site.slug}`,
      type: 'article',
      siteName: 'PornHub.net.co',
      images: [
        {
          url: `${SITE_DOMAIN}/api/screenshot?domain=${site.domain}`,
          width: 1200,
          height: 630,
          alt: `${site.name} Review`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';
  const site = await getSiteBySlug(resolvedParams.slug);

  if (!site) {
    notFound();
  }

  const [category, categorySites] = await Promise.all([
    getCategoryBySlug(site.categorySlug),
    getSitesByCategory(site.categorySlug),
  ]);
  const reviewSchema = generateReviewSchema(site, locale, category);

  const prosList = site.pros[locale] || site.pros.en || [];
  const consList = site.cons[locale] || site.cons.en || [];

  // Related alternative sites in the same category (up to 6 for a balanced grid)
  const alternatives = categorySites.filter((s) => s.slug !== site.slug).slice(0, 6);

  return (
    <>
      {/* Schema.org Review & AggregateRating JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      <div className="container portal-page-container">
        {/* Single Unified White Portal Card - Zero Fragmentation */}
        <div className="portal-card-wrapper review-unified-card">
          {/* Breadcrumb Navigation */}
          <nav className="portal-breadcrumb" aria-label="Breadcrumb">
            <span className="portal-breadcrumb-dot" style={{ backgroundColor: '#ff9701' }}></span>
            <Link href={`/${locale}`} className="portal-breadcrumb-home">
              PornDude
            </Link>
            <span className="portal-breadcrumb-separator">&gt;</span>
            {category && (
              <>
                <Link href={`/${locale}/${category.slug}`} className="portal-breadcrumb-home" style={{ color: '#64748b', fontWeight: 600 }}>
                  {category.name[locale] || category.name.en}
                </Link>
                <span className="portal-breadcrumb-separator">&gt;</span>
              </>
            )}
            <span className="portal-breadcrumb-active">
              {site.name} Review
            </span>
          </nav>

          {/* Hero Section: Site Logo, Title, Verified Status, Rating & CTA */}
          <div className="review-hero-section">
            <div className="review-hero-main">
              <div className="review-hero-avatar-box">
                <Favicon
                  domain={site.domain}
                  name={site.name}
                  size={58}
                  className="review-hero-avatar"
                />
              </div>

              <div className="review-hero-details">
                <div className="review-hero-badges-row">
                  <span className="review-badge-verified">
                    <ShieldCheck size={14} />
                    <span>Verified 100% Safe</span>
                  </span>
                  <span className="review-badge-category">
                    <Compass size={13} />
                    <span>{category ? (category.name[locale] || category.name.en) : 'Adult Site'}</span>
                  </span>
                  {site.isTrending && (
                    <span className="review-badge-trending">🔥 Trending</span>
                  )}
                </div>

                <h1 className="review-hero-title">
                  {site.name} Review 2026
                </h1>

                <p className="review-hero-tagline">
                  {site.shortDescription[locale] || site.shortDescription.en}
                </p>
              </div>
            </div>

            {/* Right Side: Rating Score & Action Button */}
            <div className="review-hero-cta-box">
              <div className="review-hero-score-badge">
                <div className="review-score-number">
                  <Star size={20} className="review-star-icon" />
                  <span>{site.rating}</span>
                  <span className="review-score-max">/10</span>
                </div>
                <div className="review-score-count">
                  {site.votesCount.toLocaleString()} votes ({site.reviewCount.toLocaleString()} reviews)
                </div>
              </div>

              <a
                href={site.url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="review-hero-visit-btn"
              >
                <span>Visit {site.name}</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Seamless Integrated Site Facts & Overview Bar (NOT separate!) */}
          <div className="review-facts-bar">
            <div className="review-fact-item">
              <span className="review-fact-label">
                <Globe size={13} />
                <span>Domain</span>
              </span>
              <span className="review-fact-value">{site.domain}</span>
            </div>

            <div className="review-fact-item">
              <span className="review-fact-label">
                <Award size={13} />
                <span>Access Model</span>
              </span>
              <span className="review-fact-value" style={{ color: site.isFree ? '#16a34a' : '#ea580c', fontWeight: 700 }}>
                {site.isFree ? '100% Free' : 'Premium Subscription'}
              </span>
            </div>

            <div className="review-fact-item">
              <span className="review-fact-label">
                <Tv size={13} />
                <span>Video Quality</span>
              </span>
              <span className="review-fact-value">{site.videoQuality || '1080p / 4K UHD'}</span>
            </div>

            <div className="review-fact-item">
              <span className="review-fact-label">
                <Calendar size={13} />
                <span>Founded</span>
              </span>
              <span className="review-fact-value">{site.yearFounded || '2007'}</span>
            </div>

            <div className="review-fact-item">
              <span className="review-fact-label">
                <ShieldCheck size={13} />
                <span>Safety Status</span>
              </span>
              <span className="review-fact-value" style={{ color: '#16a34a', fontWeight: 700 }}>
                Zero Malware
              </span>
            </div>
          </div>

          {/* Tags Cloud */}
          {site.tags.length > 0 && (
            <div className="review-tags-row">
              <span className="review-tags-label">
                <Tag size={13} />
                <span>Keywords:</span>
              </span>
              <div className="review-tags-chips">
                {site.tags.map((t) => (
                  <span key={t} className="review-tag-chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Score Meters Breakdown Grid */}
          <div className="review-scores-section">
            <h2 className="review-section-title">Performance & Trust Scores</h2>

            <div className="review-scores-grid">
              <div className="review-score-meter-card">
                <div className="review-meter-header">
                  <span>Safety & Privacy</span>
                  <span className="review-meter-val">{site.scores.safety} / 10</span>
                </div>
                <div className="review-meter-bar-track">
                  <div className="review-meter-bar-fill fill-safety" style={{ width: `${site.scores.safety * 10}%` }}></div>
                </div>
              </div>

              <div className="review-score-meter-card">
                <div className="review-meter-header">
                  <span>Mobile Experience</span>
                  <span className="review-meter-val">{site.scores.mobile} / 10</span>
                </div>
                <div className="review-meter-bar-track">
                  <div className="review-meter-bar-fill fill-mobile" style={{ width: `${site.scores.mobile * 10}%` }}></div>
                </div>
              </div>

              <div className="review-score-meter-card">
                <div className="review-meter-header">
                  <span>Content Quality</span>
                  <span className="review-meter-val">{site.scores.content} / 10</span>
                </div>
                <div className="review-meter-bar-track">
                  <div className="review-meter-bar-fill fill-content" style={{ width: `${site.scores.content * 10}%` }}></div>
                </div>
              </div>

              <div className="review-score-meter-card">
                <div className="review-meter-header">
                  <span>Value for Time</span>
                  <span className="review-meter-val">{site.scores.value} / 10</span>
                </div>
                <div className="review-meter-bar-track">
                  <div className="review-meter-bar-fill fill-value" style={{ width: `${site.scores.value * 10}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Column Pros & Cons */}
          <div className="review-pros-cons-grid">
            <div className="review-pros-box">
              <h3 className="review-pros-heading">
                <CheckCircle size={18} className="review-pro-icon" />
                <span>What We Liked (Pros)</span>
              </h3>
              <ul className="review-pros-list">
                {prosList.map((pro, i) => (
                  <li key={i}>
                    <span className="pros-bullet">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="review-cons-box">
              <h3 className="review-cons-heading">
                <XCircle size={18} className="review-con-icon" />
                <span>Room for Improvement (Cons)</span>
              </h3>
              <ul className="review-cons-list">
                {consList.map((con, i) => (
                  <li key={i}>
                    <span className="cons-bullet">✕</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Long Editorial Breakdown / Verdict */}
          <div className="review-editorial-section">
            <h2 className="review-section-title">
              ThePornDude&apos;s Editorial Verdict
            </h2>
            <div className="review-editorial-prose">
              <p>{site.longReview[locale] || site.longReview.en}</p>
            </div>
          </div>

          {/* Interactive Was This Helpful Vote */}
          <div className="review-vote-container">
            <ReviewVote locale={locale} initialVotes={site.votesCount} />
          </div>

          {/* Top Alternative Sites In Same Category - Identical to Category Page Card Design */}
          {alternatives.length > 0 && (
            <div className="review-alternatives-section">
              <h2 className="review-section-title">
                <Compass size={20} color="#ff9701" />
                <span>Top Alternatives to {site.name}</span>
              </h2>

              <div className="portal-sites-grid">
                {alternatives.map((alt, index) => (
                  <article key={alt.id} className="portal-site-card" data-site-id={alt.id}>
                    {/* 16:10 Aspect Ratio Screenshot Thumbnail Box */}
                    <div className="portal-card-thumb-wrapper">
                      {/* Censored/authentic preview screenshot */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/screenshot?domain=${alt.domain}`}
                        alt={`${alt.name} homepage screenshot`}
                        className="portal-card-thumb-img"
                        loading="lazy"
                        decoding="async"
                      />

                      {alt.badge && (
                        <span className="portal-card-badge">
                          {alt.badge}
                        </span>
                      )}

                      {/* Bottom Caption Bar Overlaid on Screenshot (Rank + Favicon + Site Name) */}
                      <div className="portal-card-bottom-bar">
                        <span className="portal-card-rank">{index + 1}</span>
                        <Favicon
                          domain={alt.domain}
                          name={alt.name}
                          size={16}
                          className="portal-card-favicon"
                        />
                        <span className="portal-card-name">{alt.name}</span>
                      </div>

                      {/* Hover Overlay with Action Buttons */}
                      <div className="portal-card-hover-overlay">
                        <Link
                          href={`/${locale}/review/${alt.slug}`}
                          className="portal-hover-btn portal-hover-btn-review"
                        >
                          <span>{getTranslation(locale, 'readReview') || 'Review'}</span>
                          <ArrowRight size={14} />
                        </Link>
                        <a
                          href={alt.url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="portal-hover-btn portal-hover-btn-visit"
                        >
                          <span>{getTranslation(locale, 'visitSite') || 'Visit'}</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>

                    {/* Short Excerpt Description Below Thumbnail */}
                    <p className="portal-card-description">
                      {alt.shortDescription[locale] || alt.shortDescription.en}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
