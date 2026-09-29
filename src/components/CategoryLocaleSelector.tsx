'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LOCALES } from '@/lib/i18n';
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
      >
        <span>{activeLocale.name}</span>
        <ChevronDown size={14} className={`portal-lang-chevron ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <div className="portal-lang-menu">
          {LOCALES.map((loc) => (
            <Link
              key={loc.code}
              href={`/${loc.code}/${currentSlug}`}
              className={`portal-lang-option ${loc.code === currentLocale ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="portal-lang-flag">{loc.flag}</span>
              <span>{loc.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
