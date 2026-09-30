import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';

export const maxDuration = 60; // Max allowed per API call

function getOpenAIApiKey(): string {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    return process.env.OPENAI_API_KEY.trim();
  }
  try {
    const candidateFiles = ['.env.local', '.env', '.env.development', '.env.production'];
    for (const file of candidateFiles) {
      const envPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), file);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/OPENAI_API_KEY\s*=\s*(sk-[^\r\n"'\s]+)/);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }
  } catch {}
  return '';
}

export const ALL_LOCALES = [
  { code: 'en', name: 'English', getUrl: (slug: string) => `https://theporndude.com/${slug}` },
  { code: 'az', name: 'Azərbaycan dili', getUrl: (slug: string) => `https://theporndude.com/${slug}` },
  { code: 'ar', name: 'Arabic', getUrl: (slug: string) => `https://theporndude.com/ar/${slug}` },
  { code: 'cs', name: 'Czech', getUrl: (slug: string) => `https://theporndude.com/cs/${slug}` },
  { code: 'da', name: 'Danish', getUrl: (slug: string) => `https://theporndude.com/da/${slug}` },
  { code: 'de', name: 'German', getUrl: (slug: string) => `https://porndudedeutsch.com/${slug}` },
  { code: 'el', name: 'Greek', getUrl: (slug: string) => `https://theporndude.com/el/${slug}` },
  { code: 'es', name: 'Spanish', getUrl: (slug: string) => `https://theporndude.com/es/${slug}` },
  { code: 'fi', name: 'Finnish', getUrl: (slug: string) => `https://theporndude.com/fi/${slug}` },
  { code: 'fr', name: 'French', getUrl: (slug: string) => `https://theporndude.com/fr/${slug}` },
  { code: 'he', name: 'Hebrew', getUrl: (slug: string) => `https://theporndude.com/he/${slug}` },
  { code: 'hi', name: 'Hindi', getUrl: (slug: string) => `https://theporndude.com/hi/${slug}` },
  { code: 'hr', name: 'Croatian', getUrl: (slug: string) => `https://theporndude.com/hr/${slug}` },
  { code: 'hu', name: 'Hungarian', getUrl: (slug: string) => `https://theporndude.com/hu/${slug}` },
  { code: 'id', name: 'Indonesian', getUrl: (slug: string) => `https://theporndude.com/id/${slug}` },
  { code: 'it', name: 'Italian', getUrl: (slug: string) => `https://theporndude.com/it/${slug}` },
  { code: 'ja', name: 'Japanese', getUrl: (slug: string) => `https://theporndude.com/ja/${slug}` },
  { code: 'ko', name: 'Korean', getUrl: (slug: string) => `https://theporndude.com/ko/${slug}` },
  { code: 'nl', name: 'Dutch', getUrl: (slug: string) => `https://theporndude.com/nl/${slug}` },
  { code: 'no', name: 'Norwegian', getUrl: (slug: string) => `https://theporndude.com/no/${slug}` },
  { code: 'pl', name: 'Polish', getUrl: (slug: string) => `https://theporndude.com/pl/${slug}` },
  { code: 'pt', name: 'Portuguese', getUrl: (slug: string) => `https://theporndude.com/pt/${slug}` },
  { code: 'ro', name: 'Romanian', getUrl: (slug: string) => `https://theporndude.com/ro/${slug}` },
  { code: 'ru', name: 'Russian', getUrl: (slug: string) => `https://theporndude.com/ru/${slug}` },
  { code: 'sl', name: 'Slovenian', getUrl: (slug: string) => `https://theporndude.com/sl/${slug}` },
  { code: 'sv', name: 'Swedish', getUrl: (slug: string) => `https://theporndude.com/sv/${slug}` },
  { code: 'th', name: 'Thai', getUrl: (slug: string) => `https://theporndude.com/th/${slug}` },
  { code: 'tr', name: 'Turkish', getUrl: (slug: string) => `https://theporndude.com/tr/${slug}` },
  { code: 'vi', name: 'Vietnamese', getUrl: (slug: string) => `https://theporndude.com/vi/${slug}` },
  { code: 'zh', name: 'Chinese', getUrl: (slug: string) => `https://theporndude.com/zh/${slug}` },
];

function fetchPageSource(urlStr: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(urlStr);
      const client = u.protocol === 'https:' ? https : http;

      const options = {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
        },
        timeout: 25000,
      };

      const req = client.request(options, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const nextUrl = new URL(res.headers.location, urlStr).toString();
          return resolve(fetchPageSource(nextUrl));
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Server cavabı: HTTP ${res.statusCode}`));
        }

        let html = '';
        res.on('data', (chunk) => {
          html += chunk;
        });
        res.on('end', () => resolve(html));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Sorğu müddəti (Timeout) bitdi'));
      });

      req.on('error', (err) => reject(err));
      req.end();
    } catch (err: any) {
      reject(err);
    }
  });
}

function parseSlug(input: string): string {
  try {
    if (input.startsWith('http')) {
      const u = new URL(input);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length === 0) return 'top-porn-tube-sites';
      const codes = ALL_LOCALES.map((l) => l.code);
      if (codes.includes(parts[0]) && parts.length > 1) {
        return parts[1];
      }
      return parts[parts.length - 1];
    }
    return input.trim();
  } catch {
    return 'top-porn-tube-sites';
  }
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const inputUrl = searchParams.get('url') || 'https://theporndude.com/top-porn-tube-sites';
  const action = searchParams.get('action');
  const slug = parseSlug(inputUrl);

  // Action: Extract site cards from category page
  if (action === 'sites') {
    try {
      const rawHtml = await fetchPageSource(`https://theporndude.com/${slug}`);
      const $ = cheerio.load(rawHtml);
      const cards = $('.review-card');

      const sites: any[] = [];
      cards.each((_, el) => {
        const siteId = $(el).attr('data-site-id');
        const internalLink = $(el).attr('data-internal-link');
        const externalLink = $(el).attr('data-external-link');
        const name = $(el).find('.review-card-name').text().trim();
        const order = $(el).find('.review-card-order').text().trim();
        const thumb =
          $(el).find('.review-card-img').attr('data-src') ||
          $(el).find('.review-card-img').attr('src');
        const desc = $(el).find('.review-card-footer').text().trim();

        if (name && internalLink) {
          sites.push({
            siteId,
            order: parseInt(order, 10) || sites.length + 1,
            name,
            internalLink,
            externalLink,
            thumb,
            desc,
          });
        }
      });

      return NextResponse.json({
        success: true,
        slug,
        totalSites: sites.length,
        sites,
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Default: Return all 30 locales
  const localesWithUrls = ALL_LOCALES.map((l) => ({
    code: l.code,
    name: l.name,
    targetUrl: l.getUrl(slug),
  }));

  return NextResponse.json({
    success: true,
    slug,
    totalLocales: localesWithUrls.length,
    locales: localesWithUrls,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action || 'category';
    const apiKey = getOpenAIApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY .env.local daxilində tapılmadı.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // =========================================================================
    // Action 1: Deep Scrape Single Site Review (e.g. view-source:566/pornhub)
    // =========================================================================
    if (action === 'scrape-site-review') {
      const { internalLink, siteName, categorySlug, fallbackThumb, fallbackDesc } = body;
      if (!internalLink) {
        return NextResponse.json({ error: 'internalLink tələb olunur.' }, { status: 400 });
      }

      const html = await fetchPageSource(internalLink);
      const $ = cheerio.load(html);

      const resolvedName = $('[data-site-name]').first().text().trim() || siteName;
      const domainRaw = $('[data-site-domain]').first().text().trim() || body.externalLink || '';
      const domain = domainRaw.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
      const ratingRaw = parseFloat($('.rating-count, [itemprop="ratingValue"]').first().text().trim()) || 9.5;
      const rating = ratingRaw <= 5 ? +(ratingRaw * 2).toFixed(1) : +ratingRaw.toFixed(1);

      let reviewDesc = $('.link-details-review[data-site-description], .link-details-review').html()?.trim() || '';
      if (!reviewDesc) {
        reviewDesc = $('.link-content, #site-description').text().trim() || fallbackDesc || '';
      }

      const pros = $('ul.pros li').map((_, el) => $(el).text().trim()).get().filter(Boolean);
      const cons = $('ul.cons li').map((_, el) => $(el).text().trim()).get().filter(Boolean);
      const bigThumb = $('.big-thumb-holder img, .example-thumb-img').attr('src') || fallbackThumb;

      // OpenAI 100/100 Human Site Review Rewriter
      const systemPrompt = `You are an elite, brutally honest adult site critic writing for PornHub.net.co.
Write an authentic, 100% human-voiced, engaging in-depth review for ${resolvedName}.

STRICT RULES:
1. NO AI WORDS: Never use "dive into", "delve", "testament", "realm", "plethora", "furthermore", "meticulous".
2. BRANDING: Replace any mention of "ThePornDude" with "PornHub.net.co" or "our review team".
3. TONE: 100/100 Human. Conversational, humorous, direct, street-smart.
4. OUTPUT: Respond with a JSON object:
{
  "shortDescription": "2-3 punchy sentences summarizing the site under 200 characters",
  "longReview": "Full rewritten in-depth review article (3-5 detailed paragraphs with H3 sub-headings)",
  "pros": ["3 to 5 real strong points as strings"],
  "cons": ["1 to 3 realistic weak points as strings"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Site Name: ${resolvedName}\nDomain: ${domain}\nOriginal Review Content:\n${reviewDesc}\nOriginal Pros:\n${JSON.stringify(pros)}\nOriginal Cons:\n${JSON.stringify(cons)}`,
          },
        ],
        temperature: 0.85,
      });

      let rewritten: any = {};
      try {
        rewritten = JSON.parse(response.choices[0]?.message?.content || '{}');
      } catch {
        rewritten = {
          shortDescription: fallbackDesc || '',
          longReview: reviewDesc,
          pros: pros.length ? pros : ['Fast streaming', 'Huge video selection'],
          cons: cons.length ? cons : ['Ad placements on free tier'],
        };
      }

      const siteSlug = resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const supabase = getSupabaseAdmin();

      const { error: upsertErr } = await supabase.from('sites').upsert(
        {
          id: body.siteId || siteSlug,
          slug: siteSlug,
          name: resolvedName,
          domain,
          url: body.externalLink || `https://${domain}`,
          category_slug: categorySlug || 'top-porn-tube-sites',
          rating,
          short_description: { en: rewritten.shortDescription, az: rewritten.shortDescription },
          pros: { en: rewritten.pros, az: rewritten.pros },
          cons: { en: rewritten.cons, az: rewritten.cons },
          thumbnail_url: bigThumb,
          pricing_info: { long_review: { en: rewritten.longReview, az: rewritten.longReview } },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      );

      return NextResponse.json({
        success: !upsertErr,
        siteName: resolvedName,
        slug: siteSlug,
        rating,
        domain,
        rewritten,
        saved: !upsertErr,
        error: upsertErr?.message,
      });
    }

    // =========================================================================
    // Action 2: Category Multi-Language Extraction & Rewrite
    // =========================================================================
    const inputUrl = body.url || 'https://theporndude.com/top-porn-tube-sites';
    const slug = parseSlug(inputUrl);
    const targetCode = body.locale || 'en';
    const saveToDb = body.saveToDb !== false;

    const localeConfig = ALL_LOCALES.find((l) => l.code === targetCode) || ALL_LOCALES[0];
    const fetchUrl = localeConfig.getUrl(slug);

    // Step 1: Ctrl+U Fetch
    const rawHtml = await fetchPageSource(fetchUrl);

    // Step 2: Extract SEO, Breadcrumb, Header, Disclaimer, and Desc
    const $ = cheerio.load(rawHtml);
    const seoTitle = $('title').text().trim() || slug;
    const seoDescription = $('meta[name="description"]').attr('content')?.trim() || '';
    const breadcrumb =
      $('li.link-category [itemprop="name"]').text().trim() ||
      $('[itemprop="name"]').eq(1).text().trim() ||
      slug;
    const h1 =
      $('h1.link-header-title').text().trim() ||
      $('h1').text().trim() ||
      slug.replace(/-/g, ' ');
    const disclaimer =
      $('.link-header-subtitle-text').text().trim() ||
      $('.link-header-subtitle').text().trim() ||
      '';

    let descContainer = $('.category-desc.scrollbox.custom-scrollbar');
    if (!descContainer.length) {
      descContainer = $('.category-desc');
    }

    const rawDescHtml = descContainer.html()?.trim() || '';
    if (!rawDescHtml) {
      return NextResponse.json(
        { error: `category-desc bloku ${localeConfig.name} (${targetCode}) səhifəsində tapılmadı.` },
        { status: 400 }
      );
    }

    // Step 3: OpenAI 100/100 Human Category Rewrite
    const systemPrompt = `You are an elite, candid, seasoned adult entertainment directory reviewer and master copywriter writing for "PornHub.net.co" (PornHub Directory).
Your writing style is 100% HUMAN (scored 100/100 by human authenticity benchmarks), witty, confident, highly engaging, and street-smart.

STRICT EDITORIAL RULES:
1. ZERO AI CLICHÉS:
   NEVER use: "dive into", "delve", "testament", "tapestry", "embark", "furthermore", "moreover", "in conclusion", "it's essential to", "realm", "plethora", "beacon", "game-changer", "meticulously curated".
2. BRANDING:
   Always replace "ThePornDude" or "PornDude" with "PornHub.net.co" or "our directory".
3. STRUCTURAL ACCURACY:
   Preserve every question / H3 heading concept and paragraph topic in exact order, but completely reinvent the wording from scratch so there is zero plagiarism.
4. FORMATTING:
   Output clean semantic HTML (using <h3>, <p>, <strong> where appropriate).
5. TARGET LANGUAGE:
   The output MUST be written naturally in ${localeConfig.name}.
   Respond with a JSON object containing:
   {
     "categoryTitle": "Rewritten punchy Category Title (e.g. Free Porn Tube Sites)",
     "seoTitle": "Rewritten SEO Title under 65 chars (e.g. Best Free Porn Tubes 2026 | PornHub.net.co)",
     "seoDescription": "Rewritten click-worthy meta description under 155 chars",
     "disclaimer": "Rewritten 1-2 sentence Editorial Disclaimer crediting PornHub.net.co",
     "content": "Rewritten full semantic HTML content with <h3> and <p> blocks"
   }`;

    const userPrompt = `Input Data to Rewrite in ${localeConfig.name}:
Breadcrumb/Category Name: ${breadcrumb}
Header H1: ${h1}
Original SEO Title: ${seoTitle}
Original SEO Description: ${seoDescription}
Editorial Disclaimer: ${disclaimer}
Raw Category Description (HTML):
${rawDescHtml}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
    });

    let rewrittenData: any = {};
    try {
      rewrittenData = JSON.parse(response.choices[0].message.content || '{}');
    } catch {
      rewrittenData = {
        categoryTitle: breadcrumb || h1,
        seoTitle,
        seoDescription,
        disclaimer,
        content: response.choices[0].message.content || '',
      };
    }

    // Step 4: Save to Supabase
    let saved = false;
    if (saveToDb) {
      const supabase = getSupabaseAdmin();
      const { data: catRecord } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      const nameMap = catRecord?.name || {};
      const taglineMap = catRecord?.tagline || {};
      const descMap = catRecord?.description || {};

      nameMap[targetCode] = rewrittenData.categoryTitle || breadcrumb || h1;
      taglineMap[targetCode] = rewrittenData.seoDescription || seoDescription;
      descMap[targetCode] = rewrittenData.content || rawDescHtml;

      const { error: upsertErr } = await supabase.from('categories').upsert(
        {
          id: slug,
          slug,
          name: nameMap,
          tagline: taglineMap,
          description: descMap,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      );

      if (!upsertErr) {
        saved = true;
      }
    }

    return NextResponse.json({
      success: true,
      slug,
      locale: targetCode,
      localeName: localeConfig.name,
      fetchUrl,
      rewrittenData,
      saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scraper xətası' }, { status: 500 });
  }
}
