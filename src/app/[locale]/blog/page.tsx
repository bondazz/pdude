import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isValidLocale, getLocalizedUrl, getTranslation } from '@/lib/i18n';
import { Locale } from '@/lib/types';
import { generateHreflangAlternates, SITE_DOMAIN } from '@/lib/seo';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';

  const title = 'Official Adult Blog & Industry News 2026 | PornHub.net.co';
  const description = 'Official news, reviews, guides, and insights about the adult entertainment industry in 2026.';

  return {
    title,
    description,
    metadataBase: new URL(SITE_DOMAIN),
    alternates: {
      canonical: locale === 'en' ? `${SITE_DOMAIN}/blog` : `${SITE_DOMAIN}/${locale}/blog`,
      languages: generateHreflangAlternates('blog'),
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';

  const supabase = getSupabaseAdmin();
  let blogs: any[] = [];

  try {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (data) blogs = data;
  } catch {}

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', margin: '0 0 10px' }}>
          Official Industry Blog &amp; Insights
        </h1>
        <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto' }}>
          Latest adult industry reviews, site comparisons, safety guides, and exclusive news.
        </p>
      </div>

      {blogs.length === 0 ? (
        <div style={{
          background: 'var(--card-bg, #1a1e2b)',
          border: '1px solid var(--border-card, #283042)',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          color: '#94a3b8',
        }}>
          <BookOpen size={40} color="#ff9701" style={{ marginBottom: '14px' }} />
          <h3 style={{ color: '#ffffff', margin: '0 0 8px' }}>Yaxın zamanda yeni məqalələr dərc olunacaq</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Admin panelindən paylaşılan bütün bloq yazıları burada nümayiş olunacaq.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {blogs.map((b) => (
            <article
              key={b.id}
              style={{
                background: 'var(--card-bg, #1a1e2b)',
                border: '1px solid var(--border-card, #283042)',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
            >
              {b.cover_image && (
                <div style={{ height: '180px', overflow: 'hidden', background: '#0f121a' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.cover_image}
                    alt={b.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              )}

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="#ff9701" />
                    {new Date(b.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={13} color="#ff9701" />
                    {b.author}
                  </span>
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: '0 0 10px', lineHeight: '1.3' }}>
                  <Link
                    href={getLocalizedUrl(`blog/${b.slug}`, locale)}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {b.title}
                  </Link>
                </h2>

                {b.excerpt && (
                  <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 16px', flex: 1 }}>
                    {b.excerpt}
                  </p>
                )}

                <Link
                  href={getLocalizedUrl(`blog/${b.slug}`, locale)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#ff9701',
                    fontWeight: 700,
                    fontSize: '13px',
                    textDecoration: 'none',
                    marginTop: 'auto',
                  }}
                >
                  <span>Davamını Oxu</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
