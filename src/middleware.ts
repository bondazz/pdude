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

  if (!firstSegment) {
    // Root path -> rewrite directly to default locale /en (HTTP 200, keeps URL bar clean at /)
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.rewrite(url);
  }

  if (LOCALE_CODES.has(firstSegment as any)) {
    return NextResponse.next();
  }

  // Path does not have locale (e.g. /top-porn-tube-sites or /review/pornhub)
  // Rewrite to default locale so Googlebot and users can access clean URLs directly!
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}/${pathname.replace(/^\//, '')}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
