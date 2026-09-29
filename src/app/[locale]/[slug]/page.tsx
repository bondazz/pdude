import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getSitesByCategory, getSidebarCategories } from '@/lib/dataService';
import { CATEGORIES } from '@/data/categories';
import { LOCALES, getTranslation, isValidLocale } from '@/lib/i18n';
import { Locale } from '@/lib/types';
import { generateCategorySchema, generateHreflangAlternates, SITE_DOMAIN } from '@/lib/seo';
import Favicon from '@/components/Favicon';
import CategoryIcon from '@/components/CategoryIcon';
import CategoryDisclaimer from '@/components/CategoryDisclaimer';
import CategoryLocaleSelector from '@/components/CategoryLocaleSelector';
import { Bell, ArrowRight, ExternalLink, HelpCircle, Check, ChevronRight } from 'lucide-react';

// Revalidate every 60 seconds (Fast dynamic SSR from database)
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';
  const category = await getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const title = category.seoTitle[locale] || category.name[locale];
  const description = category.seoDescription[locale] || category.description[locale];

  return {
    title: `${title} | PornHub.net.co`,
    description,
    alternates: {
      canonical: locale === 'en' ? `${SITE_DOMAIN}/${category.slug}` : `${SITE_DOMAIN}/${locale}/${category.slug}`,
      languages: generateHreflangAlternates(category.slug),
    },
    openGraph: {
      title: `${title} | PornHub.net.co`,
      description,
      url: locale === 'en' ? `${SITE_DOMAIN}/${category.slug}` : `${SITE_DOMAIN}/${locale}/${category.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';

  const [category, sidebarCategories] = await Promise.all([
    getCategoryBySlug(resolvedParams.slug),
    getSidebarCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const categorySites = await getSitesByCategory(category.slug);
  const categorySchema = generateCategorySchema(category, categorySites, locale);

  const disclaimerFullText =
    "PornHub.net.co reviews third-party porn tube sites and adult destinations. We do not host, stream, or control any content. Homepage thumbnails of the reviewed sites are censored and used solely for identification purposes under fair use. All links direct to the official websites. This site is for adults (18+) only. Users should be aware that external links may lead to explicit content requiring age verification.";

  return (
    <>
      {/* Schema.org CollectionPage + ItemList + FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />

      <div className="container portal-page-container">
        {/* Main White Rounded Portal Card Matching Reference Screenshot */}
        <div className="portal-card-wrapper" style={{ ['--category-hex' as any]: category.hexColor, ['--category-rgb' as any]: category.colorRgb }}>
          {/* Breadcrumb Row */}
          <nav className="portal-breadcrumb" aria-label="Breadcrumb">
            <span className="portal-breadcrumb-dot" style={{ backgroundColor: category.hexColor }}></span>
            <Link href={`/${locale}`} className="portal-breadcrumb-home">
              PornDude
            </Link>
            <span className="portal-breadcrumb-separator">&gt;</span>
            <span className="portal-breadcrumb-active">
              <span className="portal-breadcrumb-icon">
                <CategoryIcon slug={category.slug} size={15} />
              </span>
              <span>{category.name[locale] || category.name.en}</span>
            </span>
          </nav>

          {/* Header Title Section with Notification Bell */}
          <div className="portal-header-section">
            <div className="portal-title-row">
              <div className="portal-title-with-icon">
                <span className="portal-header-icon-badge" style={{ color: category.hexColor }}>
                  <CategoryIcon slug={category.slug} size={28} />
                </span>
                <h1 className="portal-h1-title">
                  {category.seoTitle[locale] || category.name[locale]}
                </h1>
              </div>

              {/* Notification Bell Badge Button */}
              <button type="button" className="portal-notif-bell-btn" aria-label="Notifications">
                <Bell size={18} color="#ff9701" />
              </button>
            </div>

            {/* Editorial Disclaimer Accordion / Expander Box */}
            <CategoryDisclaimer disclaimerText={disclaimerFullText} />
          </div>

          {/* Subtle Horizontal Divider */}
          <div className="portal-divider" />

          {/* Language Selector Dropdown Row Above Sidebar */}
          <div className="portal-filter-row">
            <CategoryLocaleSelector currentLocale={locale} currentSlug={category.slug} />
          </div>

          {/* Two-Column Portal Layout (Left Sidebar + Right Main Grid) */}
          <div className="portal-columns-layout">
            {/* Left Sidebar: Categories Navigation List */}
            <aside className="portal-sidebar" aria-label="All Categories Navigation">
              <div className="portal-sidebar-list custom-scrollbar">
                {sidebarCategories.map((item) => {
                  const isActive = item.category.slug === category.slug;

                  return (
                    <Link
                      key={item.category.id}
                      href={`/${locale}/${item.category.slug}`}
                      className={`portal-sidebar-row ${isActive ? 'is-active' : ''}`}
                      title={item.category.name[locale] || item.category.name.en}
                    >
                      <div className="portal-sidebar-indicator">
                        {isActive ? (
                          <Check size={13} className="portal-sidebar-check" />
                        ) : (
                          <span
                            className="portal-sidebar-dot"
                            style={{ backgroundColor: item.category.hexColor }}
                          />
                        )}
                      </div>

                      <span className="portal-sidebar-icon">
                        <CategoryIcon slug={item.category.slug} size={18} />
                      </span>

                      <div className="portal-sidebar-content">
                        <span className="portal-sidebar-title">
                          {item.category.name[locale] || item.category.name.en}
                        </span>

                        {/* Row of Micro-Favicons and Total Count */}
                        <div className="portal-sidebar-favicons">
                          {item.topSites.slice(0, 4).map((ts) => (
                            <Favicon
                              key={ts.domain}
                              domain={ts.domain}
                              name={ts.name}
                              size={12}
                              className="portal-micro-favicon"
                            />
                          ))}
                          <span className="portal-sidebar-count">... {item.siteCount}</span>
                        </div>
                      </div>

                      <ChevronRight size={14} className="portal-sidebar-arrow" />
                    </Link>
                  );
                })}
              </div>
            </aside>

            {/* Right Main Content: Sites Grid & Embedded Editorial Block */}
            <main className="portal-main-area">
              <div className="portal-sites-grid">
                {categorySites.map((site, index) => {
                  // In slot 2 (3rd position), embed the authentic Editorial Highlight Card matching the screenshot!
                  const isThirdSlot = index === 2;

                  return (
                    <React.Fragment key={site.id}>
                      {isThirdSlot && (
                        <div className="portal-editorial-card">
                          <h2 className="portal-editorial-h2">
                            Are these the best {category.name[locale] || category.name.en.toLowerCase()} in the world to watch free 720p/1080p/4K HD videos?
                          </h2>
                          <p className="portal-editorial-p">
                            Unless I&apos;m not aware of their existence; you&apos;ll not find any better sites for a safe session than these hand-picked destinations filled with verified content.
                          </p>
                          <p className="portal-editorial-p">
                            Everyone knows that when it comes to finding the best free entertainment on the internet, the fastest way to do it is by streaming through trusted directories. Nobody wants to deal with spam or viruses. Most of these adult spots have thousands of daily verified updates.
                          </p>
                        </div>
                      )}

                      <article className="portal-site-card" data-site-id={site.id}>
                        {/* 16:10 Aspect Ratio Screenshot Thumbnail Box */}
                        <div className="portal-card-thumb-wrapper">
                          {/* Censored/authentic preview screenshot */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/screenshot?domain=${site.domain}`}
                            alt={`${site.name} homepage screenshot`}
                            className="portal-card-thumb-img"
                            loading={index < 6 ? 'eager' : 'lazy'}
                            decoding="async"
                          />

                          {site.badge && (
                            <span className="portal-card-badge">
                              {site.badge}
                            </span>
                          )}

                          {/* Bottom Caption Bar Overlaid on Screenshot (Rank + Favicon + Site Name) */}
                          <div className="portal-card-bottom-bar">
                            <span className="portal-card-rank">{index + 1}</span>
                            <Favicon
                              domain={site.domain}
                              name={site.name}
                              size={16}
                              className="portal-card-favicon"
                            />
                            <span className="portal-card-name">{site.name}</span>
                          </div>

                          {/* Hover Overlay with Action Buttons */}
                          <div className="portal-card-hover-overlay">
                            <Link
                              href={`/${locale}/review/${site.slug}`}
                              className="portal-hover-btn portal-hover-btn-review"
                            >
                              <span>{getTranslation(locale, 'readReview') || 'Review'}</span>
                              <ArrowRight size={14} />
                            </Link>
                            <a
                              href={site.url}
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
                          {site.shortDescription[locale] || site.shortDescription.en}
                        </p>
                      </article>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Category FAQs Section (Schema.org FAQPage) */}
              {category.faqs.length > 0 && (
                <section className="portal-faq-section">
                  <h2 className="portal-faq-title">
                    <HelpCircle size={20} color="#ff9701" />
                    <span>{getTranslation(locale, 'faqHeading') || 'Frequently Asked Questions'}</span>
                  </h2>

                  <div className="portal-faq-list">
                    {category.faqs.map((faq, index) => (
                      <div key={index} className="portal-faq-item">
                        <h3 className="portal-faq-q">{faq.question[locale] || faq.question.en}</h3>
                        <p className="portal-faq-a">{faq.answer[locale] || faq.answer.en}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
