'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LOCALES, getLocalizedUrl } from '@/lib/i18n';
import { Locale } from '@/lib/types';
import { ChevronDown } from 'lucide-react';

interface CategoryLocaleSelectorProps {
  currentLocale: Locale;
  currentSlug: string;
}

export default function CategoryLocaleSelector({ currentLocale, currentSlug }: CategoryLocaleSelectorProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLocale = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  return (
    <div className="portal-lang-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="portal-lang-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        title={activeLocale.name}
      >
        <span className={`icon-flag ${activeLocale.code === 'en' ? 'icon-flag-gb' : `icon-flag-${activeLocale.code}`}`}></span>
        <span>{activeLocale.name}</span>
        <ChevronDown size={14} className={`portal-lang-chevron ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <div className="portal-lang-menu">
          {LOCALES.map((loc) => (
            <Link
              key={loc.code}
              href={getLocalizedUrl(currentSlug, loc.code as Locale)}
              className={`portal-lang-option ${loc.code === currentLocale ? 'is-active' : ''}`}
              title={loc.name}
              data-lang={loc.code}
              hrefLang={loc.code}
              rel="alternate"
              onClick={() => setOpen(false)}
            >
              <span className={`icon-flag ${loc.code === 'en' ? 'icon-flag-gb' : `icon-flag-${loc.code}`}`}></span>
              <span>{loc.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
