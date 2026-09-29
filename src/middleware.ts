import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE } from './lib/i18n';
import { HREFLANG_CODES } from './lib/seo';

const LOCALE_CODES = new Set(HREFLANG_CODES);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, api routes, icons
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/llms.txt'
  ) {
    return NextResponse.next();
  }

  // Check if first segment is a valid locale
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // 1. If someone accesses /en or /en/... -> 301 Redirect to strip 'en'
  if (firstSegment === 'en') {
    const remainingSegments = segments.slice(1);
    const newPathname = remainingSegments.length > 0 ? `/${remainingSegments.join('/')}` : '/';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = newPathname;
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // 2. If it's another locale (/tr, /ru, /es, /de, etc.) -> keep it
  if (firstSegment && LOCALE_CODES.has(firstSegment as any)) {
    return NextResponse.next();
  }

  // 3. Root path / -> rewrite directly to default locale /en
  if (!firstSegment) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.rewrite(url);
  }

  // 4. Path does not have locale (e.g. /top-porn-tube-sites or /review/pornhub or /search)
  // Rewrite to default locale internally so Next.js App Router matches [locale] routes
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}/${pathname.replace(/^\//, '')}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
