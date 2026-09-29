'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SITES } from '@/data/sites';
import { CATEGORIES } from '@/data/categories';
import { Locale } from '@/lib/types';
import { getTranslation, isValidLocale } from '@/lib/i18n';
import Breadcrumbs from '@/components/Breadcrumbs';
import Favicon from '@/components/Favicon';
import { Search, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';

function SearchContent({ localePromise }: { localePromise: Promise<{ locale: string }> }) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [resolvedLocale, setResolvedLocale] = useState<Locale>('en');

  React.useEffect(() => {
    localePromise.then((p) => {
      if (isValidLocale(p.locale)) {
        setResolvedLocale(p.locale as Locale);
      }
    });
  }, [localePromise]);

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return SITES.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.domain.toLowerCase().includes(term) ||
        s.tags.some((t) => t.toLowerCase().includes(term)) ||
        (s.shortDescription[resolvedLocale] || s.shortDescription.en).toLowerCase().includes(term)
    );
  }, [searchTerm, resolvedLocale]);

  const breadcrumbs = [
    { name: getTranslation(resolvedLocale, 'home'), url: `/${resolvedLocale}` },
    { name: `Search: "${searchTerm}"`, url: `/${resolvedLocale}/search?q=${encodeURIComponent(searchTerm)}` },
  ];

  return (
    <div className="container" style={{ marginBottom: 60 }}>
      <Breadcrumbs items={breadcrumbs} />

      <div className="review-card" style={{ marginBottom: 24 }}>
        <h1 className="site-title" style={{ fontSize: 28, marginBottom: 16 }}>
          Search Results: &quot;{searchTerm}&quot;
        </h1>

        <div className="search-box" style={{ maxWidth: 600 }}>
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to filter directory..."
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {results.map((site, index) => {
          const cat = CATEGORIES.find((c) => c.slug === site.categorySlug);
          return (
            <div key={site.id} className="review-card">
              <div className="review-header-flex">
                <div className="site-heading-group">
                  <Favicon
                    domain={site.domain}
                    name={site.name}
                    size={48}
                    className="site-avatar"
                  />
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800 }}>{site.name}</h2>
                    <div className="site-domain-badge">
                      <span>{site.domain}</span>
                      {cat && <span>• {cat.name[resolvedLocale] || cat.name.en}</span>}
                    </div>
                  </div>
                </div>

                <div className="rating-box">
                  <div className="rating-score">⭐️ {site.rating}</div>
                </div>
              </div>

              <p className="editorial-body">
                {site.shortDescription[resolvedLocale] || site.shortDescription.en}
              </p>

              <div className="cta-group">
                <a
                  href={site.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="btn-visit"
                >
                  <span>{getTranslation(resolvedLocale, 'visitSite')}</span>
                  <ExternalLink size={16} />
                </a>

                <Link
                  href={`/${resolvedLocale}/review/${site.slug}`}
                  className="cat-bottom-btn"
                  style={{
                    margin: 0,
                    background: 'var(--bg-card-alt)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <span>{getTranslation(resolvedLocale, 'readReview')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}

        {results.length === 0 && (
          <div className="review-card" style={{ textAlign: 'center', padding: 40 }}>
            <h3>No websites matched &quot;{searchTerm}&quot;</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
              Try searching by generic tags like #free, #hd, #ai, #vr, or #cam.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40 }}>Loading search...</div>}>
      <SearchContent localePromise={params} />
    </Suspense>
  );
}
