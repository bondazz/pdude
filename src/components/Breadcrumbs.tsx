import React from 'react';
import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/seo';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schema = generateBreadcrumbSchema(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                key={item.url}
                className={`breadcrumb-item ${isLast ? 'active' : ''}`}
              >
                {index === 0 && <Home size={14} style={{ marginRight: 4 }} />}
                {!isLast ? (
                  <>
                    <Link href={item.url}>{item.name}</Link>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </>
                ) : (
                  <span>{item.name}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
