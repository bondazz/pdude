'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Favicon from './Favicon';
import { CategoryItem, Locale, SiteItem } from '@/lib/types';
import { getLocalizedUrl } from '@/lib/i18n';
import {
  PlaySquare,
  Crown,
  Video,
  Sparkles,
  Glasses,
  Film,
  MessageCircle,
  Wand2,
  Heart,
  Flame,
  Star,
  Gamepad2,
  Image as ImageIcon,
} from 'lucide-react';

interface CategoryCardProps {
  category: CategoryItem;
  sites: SiteItem[];
  locale: Locale;
  columnIndex?: number;
}

// Distinct, dynamic, organic downward heights for each category
const CATEGORY_WRAPPER_HEIGHTS: Record<string, number> = {
  '43': 465,   // Top Tubes - tall, comprehensive
  '67': 275,   // AI Porn Sites - compact, concise
  '127': 385,  // Live Sex Cams - medium-tall
  '41': 430,   // Premium Porn Sites - tall
  '128': 260,  // Sex Chat - compact
  '129': 370,  // AI Generators - medium
  '122': 310,  // VR Porn Sites - medium-compact
  '154': 450,  // Hentai & Anime - tall
};

export default function CategoryCard({ category, sites, locale, columnIndex = 1 }: CategoryCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSite, setHoveredSite] = useState<SiteItem | null>(null);
  const [hoverTop, setHoverTop] = useState<number>(0);

  const wrapperHeight =
    CATEGORY_WRAPPER_HEIGHTS[category.id] ||
    (280 + ((parseInt(category.id, 10) * 37) % 180));

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'play-square': return <PlaySquare size={17} />;
      case 'crown': return <Crown size={17} />;
      case 'video': return <Video size={17} />;
      case 'sparkles': return <Sparkles size={17} />;
      case 'glasses': return <Glasses size={17} />;
      case 'film': return <Film size={17} />;
      case 'message-circle': return <MessageCircle size={17} />;
      case 'wand': return <Wand2 size={17} />;
      case 'heart': return <Heart size={17} />;
      case 'flame': return <Flame size={17} />;
      case 'star': return <Star size={17} />;
      case 'gamepad-2': return <Gamepad2 size={17} />;
      case 'image': return <ImageIcon size={17} />;
      default: return <PlaySquare size={17} />;
    }
  };

  const getSiteFaviconInitial = (name: string) => {
    if (name.toLowerCase().includes('pornhub')) return 'PH';
    if (name.toLowerCase().includes('xvideos')) return 'XV';
    if (name.toLowerCase().includes('xhamster')) return 'XH';
    if (name.toLowerCase().includes('xnxx')) return 'XN';
    if (name.toLowerCase().includes('brazzers')) return 'BZ';
    if (name.toLowerCase().includes('camsoda')) return 'CS';
    return name.slice(0, 2).toUpperCase();
  };

  const totalSitesCount = Math.max(sites.length * 6 + 18, 55);

  return (
    <div
      ref={containerRef}
      id={`category-block-${category.id}`}
      className={`category-container v-scroll bottom-shadow visible_before_scroll-${category.id} ${category.slug}-block-style visible`}
      data-id={category.id}
      data-column={columnIndex}
      data-category-id={category.id}
      style={{
        ['--category-rgb' as any]: category.colorRgb,
        borderColor: category.hexColor,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Category Header */}
      <div id={category.slug} className="category-header">
        <h2>
          <span className={`icon-category icon-category-${category.slug} lazyloaded`}>
            {getCategoryIcon(category.icon)}
          </span>
          <Link
            href={getLocalizedUrl(category.slug, locale)}
            data-visit-category-id={category.id}
          >
            {category.name[locale] || category.name.en}
          </Link>
        </h2>
        <p className="desc">{category.description[locale] || category.description.en}</p>
      </div>

      {/* Floating Speech-Bubble Popover on site hover */}
      {hoveredSite && (
        <div
          className={`site-speech-popover ${hoverTop >= 110 ? 'popover-above' : 'popover-below'}`}
          style={{
            top: `${hoverTop >= 110 ? hoverTop - 6 : hoverTop + 28}px`,
          }}
          role="tooltip"
          aria-hidden="true"
        >
          <div className="popover-site-header">
            <span
              className="category-site-icon popover-site-icon"
              style={{
                backgroundColor: '#ff9701',
                color: '#000',
              }}
            >
              {getSiteFaviconInitial(hoveredSite.name)}
            </span>
            <span className="popover-site-name">{hoveredSite.name}</span>
            <span className="popover-site-rating">★ {hoveredSite.rating}</span>
          </div>
          <p className="popover-site-desc">
            {hoveredSite.shortDescription[locale] || hoveredSite.shortDescription.en}
          </p>
          <div className="popover-arrow"></div>
        </div>
      )}

      {/* Category Scrollable Wrapper with varied dynamic height */}
      <div
        className="category-wrapper scrollbox custom-scrollbar"
        style={{
          maxHeight: `${wrapperHeight}px`,
        }}
      >
        <div className="category-text-block">
          {category.tagline[locale] || category.tagline.en}
        </div>

        <ul>
          {sites.map((site) => (
            <li
              key={site.id}
              className={`category-item ${hoveredSite?.id === site.id ? 'is-hovered' : ''}`}
              data-site-id={site.id}
              onMouseEnter={(e) => {
                const itemEl = e.currentTarget;
                const containerEl = containerRef.current;
                if (containerEl) {
                  const itemRect = itemEl.getBoundingClientRect();
                  const containerRect = containerEl.getBoundingClientRect();
                  setHoverTop(itemRect.top - containerRect.top - 8);
                  setHoveredSite(site);
                }
              }}
              onMouseLeave={() => setHoveredSite(null)}
            >
              {/* Site Direct Link with Favicon & Name */}
              <a
                className={`link-analytics icon-site icon icon${site.id}`}
                href={site.url}
                target="_blank"
                rel="nofollow noopener"
                data-category={category.name[locale] || category.name.en}
                data-category-link={site.url}
                data-visit-site-id={site.id}
              >
                <Favicon
                  domain={site.domain}
                  name={site.name}
                  size={16}
                  className="site-favicon-img"
                />
                <span className="site-name-text">{site.name}</span>
              </a>

              {/* Review Button with SEO anchor text */}
              <Link
                className="review"
                href={getLocalizedUrl(`review/${site.slug}`, locale)}
                aria-label={`${site.name} Review`}
                data-visit-site-id={site.id}
                title={`Review of ${site.name}`}
              >
                <span className="sr-only">{site.name} Review</span>
              </Link>

              {/* Crawlers / SEO description inside DOM */}
              <p className="desc">
                {site.shortDescription[locale] || site.shortDescription.en}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Category Bottom Overlay & Apple-style Button */}
      <div className="category-bottom-wrapper">
        <Link
          className="category-bottom apple-style"
          href={getLocalizedUrl(category.slug, locale)}
          data-visit-category-id={category.id}
          style={{
            ['--cat-accent' as any]: category.hexColor,
          }}
        >
          <span>SEE ALL {totalSitesCount} SITES</span>
          <i className="icon-mask icon-regular-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}
