'use client';

import React, { useState } from 'react';

interface FaviconProps {
  domain: string;
  name?: string;
  size?: number;
  className?: string;
}

export default function Favicon({ domain, name, size = 20, className = '' }: FaviconProps) {
  const [hasError, setHasError] = useState(false);

  // Clean domain string
  const cleanDomain = (domain || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .trim();

  const firstLetter = (name || cleanDomain || '?').charAt(0).toUpperCase();

  // Consistent brand color based on domain
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4'];
  const colorIndex = cleanDomain.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const brandColor = colors[colorIndex];

  if (!cleanDomain || hasError) {
    return (
      <span
        className={`favicon-fallback ${className}`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: brandColor,
          color: '#ffffff',
          fontWeight: 800,
          fontSize: Math.max(9, Math.floor(size * 0.55)),
          userSelect: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}
        aria-hidden="true"
      >
        {firstLetter}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/favicon?domain=${encodeURIComponent(cleanDomain)}`}
      alt={name ? `${name} logo` : `${cleanDomain} favicon`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`favicon-img ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        objectFit: 'contain',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
      onError={() => setHasError(true)}
    />
  );
}
