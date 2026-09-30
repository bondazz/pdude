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
        const affiliateLink = $(el).attr('data-category-link') || externalLink;
        const name = $(el).find('.review-card-name').text().trim();
        const order = $(el).find('.review-card-order').text().trim();
        const desc = $(el).find('.review-card-footer').text().trim();

        // Flag and Badge Analysis
        const isVr = $(el).find('.icon_vr_friendly, .vr-friendly-icon').length > 0;
        const isAi = $(el).find('.ai-friendly-icon, .icon_ai_friendly').length > 0;
        const isFake = $(el).find('.is-fake-icon').length > 0;
        const is18Plus = $(el).find('.is-18-friendly-icon').length > 0;
        const hasSale = $(el).find('.has_sale').length > 0;
        const isTrending = $(el).find('.icon_position_changed').length > 0;
        const isDead = $(el).hasClass('deadsite') || $(el).find('.deadsite-drop').length > 0;

        if (name && internalLink) {
          sites.push({
            siteId,
            order: parseInt(order, 10) || sites.length + 1,
            name,
            internalLink,
            externalLink,
            affiliateLink,
            desc,
            isVr,
            isAi,
            isFake,
            is18Plus,
            hasSale,
            isTrending,
            isDead,
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
      const { internalLink, siteName, categorySlug, fallbackDesc } = body;
      const targetLang = body.locale || 'en';

      if (!internalLink) {
        return NextResponse.json({ error: 'internalLink tələb olunur.' }, { status: 400 });
      }

      const html = await fetchPageSource(internalLink);
      const $ = cheerio.load(html);

      const resolvedName = $('.link-title-name, [data-site-name]').first().text().trim() || siteName;
      const domainRaw = $('.site_url, .favicon-bar-domain, [data-site-domain]').first().text().trim() || body.externalLink || '';
      const domain = domainRaw.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();

      // JSON-LD rating & review count extraction
      let ldRating: number | null = null;
      let ldReviewCount: number | null = null;
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const json = JSON.parse($(el).html() || '{}');
          if (json.aggregateRating) {
            if (json.aggregateRating.ratingValue) ldRating = parseFloat(json.aggregateRating.ratingValue);
            if (json.aggregateRating.reviewCount) ldReviewCount = parseInt(json.aggregateRating.reviewCount, 10);
          }
        } catch {}
      });

      const ratingRaw = ldRating || parseFloat($('.rating-count, [itemprop="ratingValue"]').first().text().trim()) || 9.5;
      const rating = ratingRaw <= 5 ? +(ratingRaw * 2).toFixed(1) : +ratingRaw.toFixed(1);
      const reviewCount = ldReviewCount || parseInt($('[itemprop="reviewCount"]').first().text().trim(), 10) || 15000;

      // Flags and Badges Analysis
      const isVr = $('.icon_vr_friendly, .vr-friendly-icon').length > 0;
      const isAi = $('.ai-friendly-icon, .icon_ai_friendly').length > 0;
      const isFake = $('.is-fake-icon').length > 0;
      const is18Plus = $('.is-18-friendly-icon').length > 0;
      const hasSale = $('.has_sale').length > 0;
      const isTrending = $('.icon_position_changed').length > 0;

      const reviewTitle = $('.link-title h1, h1').first().text().trim() || `${resolvedName} Review`;
      let reviewDesc = $('.link-details-review[data-site-description], .link-details-review').html()?.trim() || '';
      if (!reviewDesc) {
        reviewDesc = $('.link-content, #site-description').html()?.trim() || fallbackDesc || '';
      }

      const pros = $('ul.pros li').map((_, el) => $(el).text().trim()).get().filter(Boolean);
      const cons = $('ul.cons li').map((_, el) => $(el).text().trim()).get().filter(Boolean);
      const tags = $('.search-tags .search-tag').map((_, el) => $(el).text().trim()).get().filter(Boolean);

      // Exact GPT Rewrite Instruction
      const systemPrompt = `GÖREV:
Aşağıda verilen yetişkin web sitesi tanıtım ve inceleme metinlerini belirtilen dilde (${targetLang}) yeniden yaz.
KURALLAR:
1. Anlamı, bahsedilen platformun adını, teknik verilerini (video sayısı, çözünürlük, model bilgisi vb.) ve istatistiklerini kesinlikle koru.
2. Metni tamamen özgün, SEO uyumlu, ilgi çekici ve doğal bir dille yeniden kurgula (spin/rewrite).
3. 'review_content' içindeki HTML hiyerarşisini (<h3>, <p>, <strong> etiketlerini) aynen muhafaza et; yalnızca etiketlerin içindeki metinleri değiştir.
4. "ThePornDude" veya "PornDude" markasını "PornHub.net.co" ile değiştir.
5. Çıktıyı kesinlikle aşağıda verilen JSON şemasında döndür. JSON harici hiçbir açıklama ekleme.

ÇIKTI JSON:
{
  "site": {
    "short_description": "Yeniden yazılmış 1-2 cümlelik kart teaserı",
    "review_title": "Yeniden yazılmış inceleme başlığı",
    "review_content": "<p>...</p><h3>...</h3><p>...</p>",
    "pros": ["Özgün artı 1", "Özgün artı 2"],
    "cons": ["Özgün eksi 1", "Özgün eksi 2"]
  },
  "seo": {
    "seo_title": "Yeniden yazılmış tıklama odaklı Title (max 60 karakter)",
    "seo_description": "Yeniden yazılmış Meta Description (max 160 karakter)"
  }
}`;

      const userPrompt = JSON.stringify({
        lang_code: targetLang,
        site_name: resolvedName,
        short_description: fallbackDesc || '',
        review_title: reviewTitle,
        review_content: reviewDesc,
        pros: pros.length > 0 ? pros : ['HD/4K Streaming', 'Massive Video Library'],
        cons: cons.length > 0 ? cons : ['Ad placements on free tier'],
        seo_title: `${resolvedName} Review 2026 | PornHub.net.co`,
        seo_description: (fallbackDesc || reviewDesc).slice(0, 160),
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.85,
      });

      let rewritten: any = {};
      try {
        rewritten = JSON.parse(response.choices[0]?.message?.content || '{}');
      } catch {
        rewritten = {
          site: {
            short_description: fallbackDesc || '',
            review_title: reviewTitle,
            review_content: reviewDesc,
            pros: pros.length ? pros : ['Fast streaming', 'Huge video selection'],
            cons: cons.length ? cons : ['Ad placements on free tier'],
          },
          seo: {
            seo_title: `${resolvedName} Review 2026`,
            seo_description: fallbackDesc || '',
          },
        };
      }

      const siteSlug = resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const supabase = getSupabaseAdmin();

      // Merge localized JSONB fields
      const { data: existingSite } = await supabase.from('sites').select('*').eq('slug', siteSlug).single();
      const shortDescMap = existingSite?.short_description || {};
      const prosMap = existingSite?.pros || {};
      const consMap = existingSite?.cons || {};
      const pricingMap = existingSite?.pricing_info && typeof existingSite.pricing_info === 'object' ? existingSite.pricing_info : {};
      const longReviewMap = pricingMap.long_review || {};

      shortDescMap[targetLang] = rewritten.site?.short_description || fallbackDesc || '';
      prosMap[targetLang] = rewritten.site?.pros || pros;
      consMap[targetLang] = rewritten.site?.cons || cons;
      longReviewMap[targetLang] = rewritten.site?.review_content || reviewDesc;
      pricingMap.long_review = longReviewMap;

      // STRICT RULE: No images or thumbnails saved
      const { error: upsertErr } = await supabase.from('sites').upsert(
        {
          id: body.siteId || siteSlug,
          slug: siteSlug,
          name: resolvedName,
          domain,
          url: body.externalLink || `https://${domain}`,
          category_slug: categorySlug || 'top-porn-tube-sites',
          rating,
          review_count: reviewCount,
          is_18_plus: is18Plus,
          is_trending: isTrending,
          rank_change: isTrending ? 'up' : 'same',
          short_description: shortDescMap,
          pros: prosMap,
          cons: consMap,
          tags: tags.length > 0 ? tags : (existingSite?.tags || []),
          thumbnail_url: null, // STRICTLY NO IMAGES
          logo_url: null,      // STRICTLY NO IMAGES
          pricing_info: pricingMap,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      );

      return NextResponse.json({
        success: !upsertErr,
        siteName: resolvedName,
        slug: siteSlug,
        rating,
        reviewCount,
        domain,
        rewritten: {
          shortDescription: rewritten.site?.short_description,
          longReview: rewritten.site?.review_content,
          pros: rewritten.site?.pros,
          cons: rewritten.site?.cons,
        },
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

    // Step 3: Exact GPT Rewrite for Category
    const systemPrompt = `GÖREV:
Aşağıda verilen yetişkin web sitesi/kategori tanıtım metinlerini belirtilen dilde (${targetCode}) yeniden yaz.
KURALLAR:
1. Anlamı, teknik verileri ve istatistikleri kesinlikle koru.
2. Metni tamamen özgün, SEO uyumlu, ilgi çekici ve doğal bir dille yeniden kurgula (spin/rewrite).
3. 'long_description' içindeki HTML hiyerarşisini (<h3>, <p>, <strong> etiketlerini) aynen muhafaza et; yalnızca etiketlerin içindeki metinleri değiştir.
4. "ThePornDude" veya "PornDude" markasını "PornHub.net.co" ile değiştir.
5. Çıktıyı kesinlikle aşağıda verilen JSON şemasında döndür. JSON harici hiçbir açıklama ekleme.

ÇIKTI JSON:
{
  "category": {
    "name": "Yeniden yazılmış kategori adı",
    "description": "Yeniden yazılmış kısa kategori açıklaması",
    "long_description": "<h3>...</h3><p>...</p>",
    "editorial_disclaimer": "Yeniden yazılmış editoryal uyarı"
  },
  "seo": {
    "seo_title": "Yeniden yazılmış tıklama odaklı Title (max 60 karakter)",
    "seo_description": "Yeniden yazılmış Meta Description (max 160 karakter)"
  }
}`;

    const userPrompt = JSON.stringify({
      lang_code: targetCode,
      category_name: breadcrumb,
      category_description: seoDescription,
      category_long_description: rawDescHtml,
      category_disclaimer: disclaimer,
      seo_title: seoTitle,
      seo_description: seoDescription,
    });

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
        category: {
          name: breadcrumb || h1,
          description: seoDescription,
          long_description: rawDescHtml,
          editorial_disclaimer: disclaimer,
        },
        seo: {
          seo_title: seoTitle,
          seo_description: seoDescription,
        },
      };
    }

    // Step 4: Save to Supabase (Merge localized fields)
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

      nameMap[targetCode] = rewrittenData.category?.name || breadcrumb || h1;
      taglineMap[targetCode] = rewrittenData.category?.description || rewrittenData.seo?.seo_description || seoDescription;
      descMap[targetCode] = rewrittenData.category?.long_description || rawDescHtml;

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
      rewrittenData: {
        categoryTitle: rewrittenData.category?.name,
        seoTitle: rewrittenData.seo?.seo_title,
        seoDescription: rewrittenData.category?.description || rewrittenData.seo?.seo_description,
        content: rewrittenData.category?.long_description,
      },
      saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scraper xətası' }, { status: 500 });
  }
}
