import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isValidLocale, getLocalizedUrl } from '@/lib/i18n';
import { Locale } from '@/lib/types';
import { generateHreflangAlternates, SITE_DOMAIN } from '@/lib/seo';
import { Calendar, User, ArrowLeft, Share2, Clock, BookOpen } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';

  const supabase = getSupabaseAdmin();
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('published', true)
    .single();

  if (!blog) {
    return { title: 'Məqalə tapılmadı | PornHub.net.co' };
  }

  const title = `${blog.title} | PornHub.net.co Blog`;
  const description = blog.excerpt || blog.title;
  const url = locale === 'en' ? `${SITE_DOMAIN}/blog/${blog.slug}` : `${SITE_DOMAIN}/${locale}/blog/${blog.slug}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_DOMAIN),
    alternates: {
      canonical: url,
      languages: generateHreflangAlternates(`blog/${blog.slug}`),
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: blog.cover_image ? [{ url: blog.cover_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: blog.cover_image ? [blog.cover_image] : undefined,
    },
  };
}

export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const locale: Locale = isValidLocale(resolvedParams.locale) ? (resolvedParams.locale as Locale) : 'en';

  const supabase = getSupabaseAdmin();
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('published', true)
    .single();

  if (!blog) {
    notFound();
  }

  // Split content by paragraphs or double newlines
  const paragraphs = (blog.content || '')
    .split(/\n\n+/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  const wordCount = (blog.content || '').split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.cover_image || undefined,
    author: {
      '@type': 'Person',
      name: blog.author || 'Admin',
    },
    datePublished: blog.created_at,
    dateModified: blog.updated_at || blog.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_DOMAIN}/blog/${blog.slug}`,
    },
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '70px', maxWidth: '860px', margin: '0 auto' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          href={getLocalizedUrl('blog', locale)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <ArrowLeft size={14} />
          <span>Bütün Bloq Yazıları</span>
        </Link>
      </div>

      <article style={{
        background: 'var(--card-bg, #1a1e2b)',
        border: '1px solid var(--border-card, #283042)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {/* Cover image */}
        {blog.cover_image && (
          <div style={{ width: '100%', maxHeight: '420px', overflow: 'hidden', background: '#0a0d14' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.cover_image}
              alt={blog.title}
              style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        <div style={{ padding: '36px 32px' }}>
          {/* Metadata banner */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '18px',
            fontSize: '13px',
            color: '#94a3b8',
            marginBottom: '18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: '14px',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="#ff9701" />
              {new Date(blog.created_at).toLocaleDateString(locale === 'az' ? 'az-AZ' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} color="#ff9701" />
              {blog.author}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="#ff9701" />
              {readTime} dəqiqə oxuma
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: '1.25',
            margin: '0 0 20px',
          }}>
            {blog.title}
          </h1>

          {/* Excerpt lead */}
          {blog.excerpt && (
            <div style={{
              fontSize: '17px',
              lineHeight: '1.6',
              color: '#f8fafc',
              fontWeight: 500,
              padding: '16px 20px',
              borderLeft: '4px solid #ff9701',
              background: 'rgba(255, 151, 1, 0.06)',
              borderRadius: '0 8px 8px 0',
              marginBottom: '28px',
            }}>
              {blog.excerpt}
            </div>
          )}

          {/* Content */}
          <div style={{
            color: '#cbd5e1',
            fontSize: '15.5px',
            lineHeight: '1.8',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}>
            {paragraphs.map((p: string, idx: number) => {
              if (p.startsWith('# ')) {
                return (
                  <h2 key={idx} style={{ color: '#ffffff', fontSize: '24px', fontWeight: 800, marginTop: '20px', marginBottom: '8px' }}>
                    {p.replace('# ', '')}
                  </h2>
                );
              }
              if (p.startsWith('## ')) {
                return (
                  <h3 key={idx} style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700, marginTop: '16px', marginBottom: '6px' }}>
                    {p.replace('## ', '')}
                  </h3>
                );
              }
              if (p.startsWith('### ')) {
                return (
                  <h4 key={idx} style={{ color: '#ffffff', fontSize: '17px', fontWeight: 600, marginTop: '12px', marginBottom: '4px' }}>
                    {p.replace('### ', '')}
                  </h4>
                );
              }
              return (
                <p key={idx} style={{ margin: 0 }}>
                  {p}
                </p>
              );
            })}
          </div>

          {/* Footer of the article */}
          <div style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff9701, #e05e00)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '16px',
              }}>
                {(blog.author || 'A')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}>{blog.author}</div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>PornHub.net.co Redaktoru</div>
              </div>
            </div>

            <Link
              href={getLocalizedUrl('blog', locale)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ff9701',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <BookOpen size={15} />
              <span>Digər bloq yazılarını kəşf et</span>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
