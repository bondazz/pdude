import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawDomain = searchParams.get('domain') || '';
  const forceRefresh = searchParams.get('force') === 'true';

  // Sanitize domain (remove http, www, trailing slashes, illegal chars)
  const domain = rawDomain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .trim();

  if (!domain || !domain.includes('.')) {
    return new NextResponse('Invalid domain', { status: 400 });
  }

  const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const sanitizedFileName = domain.replace(/[^a-z0-9.-]/g, '_') + '.jpg';
  const filePath = path.join(screenshotsDir, sanitizedFileName);

  // 1. If image already cached on disk and not forcing refresh: serve from disk (0ms latency, zero API calls!)
  if (!forceRefresh && fs.existsSync(filePath)) {
    try {
      const buffer = fs.readFileSync(filePath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (e) {
      // If read error, proceed to re-capture
    }
  }

  // 2. Fetch fresh screenshot once
  try {
    const targetUrl = `https://${domain}`;
    const captureUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(targetUrl)}?w=640&h=400`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(captureUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save to local disk once for future instant loads
      fs.writeFileSync(filePath, buffer);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (err) {
    console.warn(`[Screenshot] Could not capture screenshot for ${domain}:`, err);
  }

  // 3. Fallback: Generate an elegant browser mockup SVG placeholder
  const svgPlaceholder = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#141824"/>
          <stop offset="100%" stop-color="#0a0d14"/>
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#bgGrad)"/>
      <rect x="0" y="0" width="640" height="32" fill="#1e2330"/>
      <circle cx="20" cy="16" r="5" fill="#ef4444"/>
      <circle cx="36" cy="16" r="5" fill="#f59e0b"/>
      <circle cx="52" cy="16" r="5" fill="#10b981"/>
      <rect x="76" y="8" width="488" height="16" rx="4" fill="#0f131a"/>
      <text x="320" y="20" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">${domain}</text>
      <text x="320" y="210" fill="#ffffff" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" letter-spacing="1">${domain.toUpperCase()}</text>
      <text x="320" y="240" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">Official Verified Directory Listing</text>
    </svg>
  `.trim();

  return new NextResponse(svgPlaceholder, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
