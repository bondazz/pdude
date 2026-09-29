'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LOCALES, getLocalizedUrl } from '@/lib/i18n';
import { Locale } from '@/lib/types';
import { Search, Moon, Sun, Mail, Video, Menu, X } from 'lucide-react';

interface HeaderProps {
  locale: Locale;
}

export default function Header({ locale }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobMenuOpen, setMobMenuOpen] = useState(false);
  const [mobSearchOpen, setMobSearchOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('ph_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (savedTheme === 'dark') document.body.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('ph_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(getLocalizedUrl(`search?q=${encodeURIComponent(searchQuery.trim())}`, locale));
    }
  };

  const currentLocaleConfig = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  // Clean relative path without locale prefix so language switcher retains current page
  const cleanRelativePath = (() => {
    if (!pathname || pathname === '/') return '';
    const clean = pathname.replace(/^\/+/, '');
    const parts = clean.split('/');
    if (parts[0] === locale) {
      parts.shift();
    }
    return parts.join('/');
  })();

  return (
    <header className="header">
      {/* Mobile Header Bar */}
      <div className="header-mob">
        <button
          className="burger"
          type="button"
          aria-label="Burger"
          onClick={() => setMobMenuOpen(!mobMenuOpen)}
        >
          {mobMenuOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
        </button>

        <Link
          className="header-mob-logo"
          href={getLocalizedUrl('', locale)}
          aria-label="PornHub.net.co"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="PornHub.net.co"
            className="header-mob-logo-img"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </Link>

        <button
          className="search-opener"
          type="button"
          aria-label="Search Opener"
          onClick={() => setMobSearchOpen(!mobSearchOpen)}
        >
          <Search size={22} color="#fff" />
        </button>
      </div>

      {/* Mobile Search Overlay Drawer */}
      {mobSearchOpen && (
        <div className="mob-search-drawer container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              className="search-input"
              type="text"
              placeholder="Search best 13226+ porn sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button className="search-btn-icon" type="submit" aria-label="Search">
              <Search size={18} color="#ff9701" />
            </button>
          </form>
        </div>
      )}

      {/* Top Bar with Home Title & Flag Lang Menu */}
      <div className="top-bar">
        <div className="top-bar-container container">
          <div className="top-bar-text">
            <h1 className="hometitle">PornHub.net.co reviews the best porn sites of 2026.</h1>
            {' '}Find safe free <b>porn sites</b> &amp; premium porn websites all sorted by quality!
          </div>

          <div className={`lang-menu ${langOpen ? 'lang-menu-open' : ''}`}>
            <button
              className={`lang-menu-btn icon-flag ${locale === 'en' ? 'icon-flag-gb' : `icon-flag-${locale}`}`}
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              title={currentLocaleConfig.name}
              aria-label="Language Menu Button"
              data-lang={locale}
            ></button>

            <div className="lang-menu-drop" onMouseLeave={() => setLangOpen(false)}>
              <ul className="lang-menu-list custom-scrollbar">
                {LOCALES.map((l) => (
                  <li key={l.code} className="lang-menu-item">
                    <Link
                      className={`lang-menu-link icon-flag ${l.code === 'en' ? 'icon-flag-gb' : `icon-flag-${l.code}`} ${l.code === locale ? 'active' : ''}`}
                      href={getLocalizedUrl(cleanRelativePath, l.code)}
                      title={l.name}
                      data-lang={l.code}
                      hrefLang={l.code}
                      rel="alternate"
                      onClick={() => setLangOpen(false)}
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Desktop Header */}
      <div className="header-desk container">
        {/* Left Column: 3D SVG Logo & Rounded Pill Search */}
        <div className="header-col header-col-lead">
          <Link
            className="header-logo-main"
            href={getLocalizedUrl('', locale)}
            aria-label="PornHub.net.co Home"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="header-logo-main-img"
              src="/images/logo.png"
              alt="PornHub.net.co"
              width={600}
              height={240}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </Link>

          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              className="search-input"
              type="text"
              autoComplete="off"
              placeholder="Search best 13226+ porn sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn-icon" type="submit" aria-label="Search">
              <Search size={18} color="#ff9701" />
            </button>
          </form>
        </div>

        {/* Middle Column: Deals Speech Bubble & Social Circular Buttons */}
        <div className="header-col header-col-main">
          {/* Quotes Speech Bubble Card */}
          <div className="quotes">
            <div className="quotes-inner">
              <div className="quotes-icon">
                <span className="bell-badge">🔔</span>
              </div>
              <div className="quotes-headline">
                <p className="quotes-title">Want to save money?</p>
                <p className="quotes-text">
                  <Link className="quotes-link" href={getLocalizedUrl('best-paysites', locale)}>
                    Unlock Deals extension
                  </Link>{' '}
                  and get access to 100+ exclusive deals.
                </p>
              </div>
              <div className="quotes-count">1</div>
              <div className="quotes-arrow"></div>
            </div>
          </div>

          {/* Social & Action Circular Buttons */}
          <ul className="socials">
            <li className="socials-item socials-item-extension">
              <Link className="socials-link deals-dice-btn" href={getLocalizedUrl('best-paysites', locale)} aria-label="Exclusive Deals">
                🎲
              </Link>
              <span className="hover-block">DEALS</span>
            </li>
            <li className="socials-item">
              <Link className="socials-link email-link" href={getLocalizedUrl('review/pornhub', locale)} aria-label="Contact Us">
                <Mail size={16} />
              </Link>
              <span className="hover-block">Contact Us</span>
            </li>
            <li className="socials-item">
              <Link className="socials-link casting-link" href={getLocalizedUrl('live-sex-cams', locale)} aria-label="Casting & Cams">
                <Video size={16} />
              </Link>
              <span className="hover-block">Casting</span>
            </li>
            <li className="socials-item">
              <a className="socials-link twitter-link" href="https://twitter.com" target="_blank" rel="nofollow noopener" aria-label="Follow Twitter">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <span className="hover-block">Follow Twitter</span>
            </li>
            <li className="socials-item">
              <Link className="socials-link blog-link" href={getLocalizedUrl('top-porn-tube-sites', locale)} aria-label="Official Blog">
                <span className="blog-btn-text">
                  <span className="blog-my">MY</span>
                  <span className="blog-word">BLOG</span>
                </span>
                <span className="blog-notif-dot"></span>
              </Link>
              <span className="hover-block">Official Blog</span>
            </li>
            <li className="socials-item">
              <Link className="socials-link shop-link" href={getLocalizedUrl('best-ai-porn-sites', locale)} aria-label="Official Shop">
                <span className="shop-icon-wrapper">
                  <span className="shop-kiosk">🏪</span>
                  <span className="shop-sparkle">✨</span>
                </span>
              </Link>
              <span className="hover-block">Official Shop</span>
            </li>
            <li className="socials-item">
              <button
                className="socials-link theme-link"
                type="button"
                onClick={toggleTheme}
                aria-label="Theme Mode"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <span className="hover-block">{theme === 'light' ? 'Dark Mode' : 'Lights ON'}</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Mascot emerging from behind Card 4 */}
        <div className="header-col header-col-mascot">
          <Link className="header-logo-maskot-half" href={getLocalizedUrl('', locale)} aria-label="PornHub.net.co Mascot" draggable={false} tabIndex={-1}>
            <picture>
              <source media="(min-width: 992px)" srcSet="/images/thepornhub_net_co.webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="header-logo-maskot-half-img"
                src="/images/thepornhub_net_co.webp"
                alt="PornHub.net.co Mascot"
                fetchPriority="high"
                decoding="sync"
                loading="eager"
                draggable={false}
                width={240}
                height={260}
              />
            </picture>
          </Link>
        </div>
      </div>
    </header>
  );
}
