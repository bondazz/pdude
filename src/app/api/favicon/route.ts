import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawDomain = searchParams.get('domain') || '';
  const forceRefresh = searchParams.get('force') === 'true';

  const domain = rawDomain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .trim();

  if (!domain || !domain.includes('.')) {
    return new NextResponse('Invalid domain', { status: 400 });
  }

  const faviconsDir = path.join(process.cwd(), 'public', 'favicons');
  if (!fs.existsSync(faviconsDir)) {
    fs.mkdirSync(faviconsDir, { recursive: true });
  }

  const sanitizedFileName = domain.replace(/[^a-z0-9.-]/g, '_') + '.png';
  const filePath = path.join(faviconsDir, sanitizedFileName);

  // 1. If already saved on local disk, serve immediately with immutable caching (0ms latency!)
  if (!forceRefresh && fs.existsSync(filePath)) {
    try {
      const buffer = fs.readFileSync(filePath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (e) {
      // Fall through to re-fetch
    }
  }

  // 2. Multi-tier automatic favicon discovery
  const providers = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    `https://icon.horse/icon/${domain}`,
    `https://unavatar.io/${domain}?fallback=false`,
  ];

  for (const providerUrl of providers) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(providerUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        // Verify it is a valid image and not an empty/tiny placeholder
        const arrayBuffer = await res.arrayBuffer();
        if (arrayBuffer.byteLength > 100) {
          const buffer = Buffer.from(arrayBuffer);
          
          // Save to disk once
          fs.writeFileSync(filePath, buffer);

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': contentType.includes('image') ? contentType : 'image/png',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      }
    } catch (err) {
      // Try next provider
    }
  }

  // 3. Fallback: Generate an elegant stylized letter avatar SVG
  const firstLetter = domain.charAt(0).toUpperCase();
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4'];
  const colorIndex = domain.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const brandColor = colors[colorIndex];

  const svgAvatar = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${brandColor}"/>
          <stop offset="100%" stop-color="#111827"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="32" fill="url(#grad)"/>
      <text x="32" y="40" fill="#ffffff" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">${firstLetter}</text>
    </svg>
  `.trim();

  return new NextResponse(svgAvatar, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
