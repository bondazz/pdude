'use client';

import React from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/types';
import { CATEGORIES } from '@/data/categories';
import { LOCALES, getTranslation } from '@/lib/i18n';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
  return (
    <footer className="footer">
      {/* Authentic Panoramic Characters Footer Illustration sitting ON the orange divider line */}
      <div className="footer-illustration-wrapper" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/footer_image.webp"
          alt=""
          className="footer-illustration-img"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      <div className="container footer-grid">
          {/* Brand & Mission */}
          <div className="footer-col-brand">
            <div className="footer-brand-title">PORNHUB DIRECTORY</div>
            <p className="footer-copy">
              {getTranslation(locale, 'disclaimer')}
            </p>
            <div className="footer-safe-badge">
              <ShieldCheck size={16} />
              <span>{getTranslation(locale, 'verifiedSafe')}</span>
            </div>
          </div>

          {/* Categories Sitelinks */}
          <div className="footer-col-categories">
            <div className="footer-heading">{getTranslation(locale, 'categories')}</div>
            <ul className="footer-links">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/${locale}/${cat.slug}`}>
                    {(cat.name[locale] || cat.name.en).toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Global Languages */}
          <div className="footer-col-languages">
            <div className="footer-heading">WORLDWIDE LANGUAGES</div>
            <div className="footer-lang-grid">
              {LOCALES.map((l) => (
                <Link
                  key={l.code}
                  href={`/${l.code}`}
                  className={`footer-lang-link ${l.code === locale ? 'active' : ''}`}
                >
                  <span className="lang-code">{l.code}</span>
                  <span className="lang-name">{l.nativeName}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="container footer-bottom">
          <div className="footer-copyright">
            © 2026 PornHub.net.co. {getTranslation(locale, 'allRightsReserved')}
          </div>
          <div className="footer-legal-links">
            <Link href={`/${locale}#compliance`} aria-label="18+ Compliance Policy">18+ Compliance</Link>
            <Link href={`/${locale}#rta`} aria-label="Restricted to Adults Notice">RTA Label</Link>
            <Link href={`/${locale}#privacy`} aria-label="Privacy Policy">Privacy Policy</Link>
            <Link href={`/${locale}#terms`} aria-label="Terms of Service">Terms of Service</Link>
          </div>
        </div>
      </footer>
  );
}
