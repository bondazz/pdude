#!/usr/bin/env node
/**
 * ==============================================================================
 * PornHub.net.co - Autonomous Category & Full Site Reviews Scraper + AI Rewriter
 * ==============================================================================
 * Performs:
 *   1. Category Level (SEO, Disclaimer, <h3> questions & .category-desc block)
 *   2. Sites Level (Discovers all .review-card elements)
 *   3. Deep Review Level (Visits each view-source:theporndude.com/{id}/{slug})
 *   4. OpenAI GPT-4o 100/100 Human Rewrite (Replaces PornDude -> PornHub.net.co, zero AI clichés)
 *   5. Saves directly into Supabase (categories & sites tables)
 *
 * Usage:
 *   node scripts/scraper_bot.js [CATEGORY_URL] [--with-sites] [--limit N]
 * Examples:
 *   node scripts/scraper_bot.js https://theporndude.com/top-porn-tube-sites
 *   node scripts/scraper_bot.js https://theporndude.com/top-porn-tube-sites --with-sites --limit 10
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// 1. Environment loader
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[2] || '';
        val = val.replace(/(^['"]|['"]$)/g, '').trim();
        process.env[match[1]] = val;
      }
    });
  }
}

loadEnv();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ XƏTA: .env.local daxilində OPENAI_API_KEY və ya Supabase məlumatları çatışmır!');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 2. All 30 Languages
const ALL_LOCALES = [
  { code: 'en', name: 'English', getUrl: (slug) => `https://theporndude.com/${slug}` },
  { code: 'az', name: 'Azerbaijani', getUrl: (slug) => `https://theporndude.com/${slug}` },
  { code: 'ar', name: 'Arabic', getUrl: (slug) => `https://theporndude.com/ar/${slug}` },
  { code: 'cs', name: 'Czech', getUrl: (slug) => `https://theporndude.com/cs/${slug}` },
  { code: 'da', name: 'Danish', getUrl: (slug) => `https://theporndude.com/da/${slug}` },
  { code: 'de', name: 'German', getUrl: (slug) => `https://porndudedeutsch.com/${slug}` },
  { code: 'el', name: 'Greek', getUrl: (slug) => `https://theporndude.com/el/${slug}` },
  { code: 'es', name: 'Spanish', getUrl: (slug) => `https://theporndude.com/es/${slug}` },
  { code: 'fi', name: 'Finnish', getUrl: (slug) => `https://theporndude.com/fi/${slug}` },
  { code: 'fr', name: 'French', getUrl: (slug) => `https://theporndude.com/fr/${slug}` },
  { code: 'he', name: 'Hebrew', getUrl: (slug) => `https://theporndude.com/he/${slug}` },
  { code: 'hi', name: 'Hindi', getUrl: (slug) => `https://theporndude.com/hi/${slug}` },
  { code: 'hr', name: 'Croatian', getUrl: (slug) => `https://theporndude.com/hr/${slug}` },
  { code: 'hu', name: 'Hungarian', getUrl: (slug) => `https://theporndude.com/hu/${slug}` },
  { code: 'id', name: 'Indonesian', getUrl: (slug) => `https://theporndude.com/id/${slug}` },
  { code: 'it', name: 'Italian', getUrl: (slug) => `https://theporndude.com/it/${slug}` },
  { code: 'ja', name: 'Japanese', getUrl: (slug) => `https://theporndude.com/ja/${slug}` },
  { code: 'ko', name: 'Korean', getUrl: (slug) => `https://theporndude.com/ko/${slug}` },
  { code: 'nl', name: 'Dutch', getUrl: (slug) => `https://theporndude.com/nl/${slug}` },
  { code: 'no', name: 'Norwegian', getUrl: (slug) => `https://theporndude.com/no/${slug}` },
  { code: 'pl', name: 'Polish', getUrl: (slug) => `https://theporndude.com/pl/${slug}` },
  { code: 'pt', name: 'Portuguese', getUrl: (slug) => `https://theporndude.com/pt/${slug}` },
  { code: 'ro', name: 'Romanian', getUrl: (slug) => `https://theporndude.com/ro/${slug}` },
  { code: 'ru', name: 'Russian', getUrl: (slug) => `https://theporndude.com/ru/${slug}` },
  { code: 'sl', name: 'Slovenian', getUrl: (slug) => `https://theporndude.com/sl/${slug}` },
  { code: 'sv', name: 'Swedish', getUrl: (slug) => `https://theporndude.com/sv/${slug}` },
  { code: 'th', name: 'Thai', getUrl: (slug) => `https://theporndude.com/th/${slug}` },
  { code: 'tr', name: 'Turkish', getUrl: (slug) => `https://theporndude.com/tr/${slug}` },
  { code: 'vi', name: 'Vietnamese', getUrl: (slug) => `https://theporndude.com/vi/${slug}` },
  { code: 'zh', name: 'Chinese', getUrl: (slug) => `https://theporndude.com/zh/${slug}` },
];

function parseSlug(input) {
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

// 3. Ctrl+U Style Direct HTTP Fetch (Browser Impersonation)
function fetchPageSource(urlStr) {
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
        res.on('data', (chunk) => { html += chunk; });
        res.on('end', () => resolve(html));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.on('error', (err) => reject(err));
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// 4. OpenAI Rewrite for Category
async function rewriteCategory(data, targetLang = 'en') {
  const systemPrompt = `GÖREV:
Aşağıda verilen yetişkin web sitesi/kategori tanıtım metinlerini belirtilen dilde (${targetLang}) yeniden yaz.
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
    lang_code: targetLang,
    category_name: data.breadcrumbName || data.h1,
    category_description: data.seoDescription,
    category_long_description: data.rawDescHtml,
    category_disclaimer: data.disclaimer,
    seo_title: data.seoTitle,
    seo_description: data.seoDescription,
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

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {
      category: {
        name: data.breadcrumbName || data.h1,
        description: data.seoDescription,
        long_description: data.rawDescHtml,
        editorial_disclaimer: data.disclaimer,
      },
      seo: {
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
      },
    };
  }
}

// 5. OpenAI Rewrite for Site Review
async function rewriteSiteReview(siteData, targetLang = 'en') {
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
    site_name: siteData.name,
    short_description: siteData.shortDesc || '',
    review_title: siteData.reviewTitle || `${siteData.name} Review`,
    review_content: siteData.rawReviewText || '',
    pros: siteData.pros || [],
    cons: siteData.cons || [],
    seo_title: `${siteData.name} Review 2026 | PornHub.net.co`,
    seo_description: (siteData.shortDesc || siteData.rawReviewText || '').slice(0, 160),
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

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {
      site: {
        short_description: siteData.shortDesc || '',
        review_title: siteData.reviewTitle || `${siteData.name} Review`,
        review_content: siteData.rawReviewText || '',
        pros: siteData.pros || [],
        cons: siteData.cons || [],
      },
      seo: {
        seo_title: `${siteData.name} Review 2026`,
        seo_description: siteData.shortDesc || '',
      },
    };
  }
}

// 6. Deep Scrape Review Page (e.g. view-source:theporndude.com/566/pornhub)
async function scrapeSingleSiteReview(internalUrl, fallbackData, targetLang = 'en') {
  console.log(`\n  🔎 [Ctrl+U] Sayt rəyi çəkilir: ${internalUrl}`);
  try {
    const html = await fetchPageSource(internalUrl);
    const $ = cheerio.load(html);

    const siteName = $('.link-title-name, [data-site-name]').first().text().trim() || fallbackData.name;
    const domainRaw = $('.site_url, .favicon-bar-domain, [data-site-domain]').first().text().trim() || fallbackData.externalLink;
    const domain = domainRaw.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();

    // JSON-LD rating & review count
    let ldRating = null;
    let ldReviewCount = null;
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
    const rating = ratingRaw <= 5 ? +(ratingRaw * 2).toFixed(1) : +(ratingRaw).toFixed(1);
    const reviewCount = ldReviewCount || parseInt($('[itemprop="reviewCount"]').first().text().trim(), 10) || 15000;

    // Flags & Badges
    const isVr = $('.icon_vr_friendly, .vr-friendly-icon').length > 0;
    const isAi = $('.ai-friendly-icon, .icon_ai_friendly').length > 0;
    const isFake = $('.is-fake-icon').length > 0;
    const is18Plus = $('.is-18-friendly-icon').length > 0;
    const hasSale = $('.has_sale').length > 0;
    const isTrending = $('.icon_position_changed').length > 0;

    const reviewTitle = $('.link-title h1, h1').first().text().trim() || `${siteName} Review`;
    let reviewDesc = $('.link-details-review[data-site-description], .link-details-review').html()?.trim() || '';
    if (!reviewDesc) {
      reviewDesc = $('.link-content, #site-description').html()?.trim() || fallbackData.desc || '';
    }

    const pros = $('ul.pros li').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const cons = $('ul.cons li').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const tags = $('.search-tags .search-tag').map((_, el) => $(el).text().trim()).get().filter(Boolean);

    console.log(`  🤖 OpenAI GPT-4o ilə ${siteName} rəyi [${targetLang}] rewrite edilir...`);
    const rewritten = await rewriteSiteReview({
      name: siteName,
      domain,
      reviewTitle,
      rawReviewText: reviewDesc,
      pros: pros.length > 0 ? pros : ['HD/4K Streaming', 'Huge Video Library'],
      cons: cons.length > 0 ? cons : ['Ad placements on free tier'],
      shortDesc: fallbackData.desc,
    }, targetLang);

    const slug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return {
      id: fallbackData.siteId || slug,
      slug,
      name: siteName,
      domain,
      url: fallbackData.externalLink || `https://${domain}`,
      rating,
      review_count: reviewCount,
      is_18_plus: is18Plus,
      is_trending: isTrending,
      rank_change: isTrending ? 'up' : 'same',
      short_description: rewritten.site?.short_description,
      long_review: rewritten.site?.review_content,
      pros: rewritten.site?.pros,
      cons: rewritten.site?.cons,
      tags,
    };
    return null;
  }
}

// 7. Main Runner
async function main() {
  const args = process.argv.slice(2);
  const inputArg = args.find((a) => !a.startsWith('--')) || 'https://theporndude.com/top-porn-tube-sites';
  const slug = parseSlug(inputArg);
  const withSites = args.includes('--with-sites');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 5;

  console.log('====================================================================');
  console.log('🌐 PORNHUB.NET.CO - TAM AVTOMATİK KATEQORİYA VƏ SAYT RƏYİ BOTU');
  console.log('====================================================================');
  console.log(`🏷️  Kateqoriya Slug: ${slug}`);
  console.log(`🚀 Sayt Rəyləri Rejimi: ${withSites ? `Aktiv (Limit: ${limit})` : 'Yalnız Kateqoriya Mətnləri'}`);
  console.log('====================================================================');

  // Step 1: Category Level (English page to discover all site cards)
  console.log(`\n📡 1. Kateqoriya əsas səhifəsi çəkilir (view-source:theporndude.com/${slug})...`);
  const catUrl = `https://theporndude.com/${slug}`;
  const catHtml = await fetchPageSource(catUrl);
  const $ = cheerio.load(catHtml);

  // Extract Category Essentials
  const seoTitle = $('title').text().trim();
  const seoDescription = $('meta[name="description"]').attr('content')?.trim() || '';
  const h1 = $('h1').text().trim() || slug.replace(/-/g, ' ');
  const breadcrumbName = $('[itemprop="name"]').last().text().trim() || h1;
  const disclaimerText = $('.link-header-subtitle-text').text().replace('Editorial Disclaimer:', '').trim();

  let descContainer = $('.category-desc.scrollbox.custom-scrollbar');
  if (!descContainer.length) descContainer = $('.category-desc');
  const rawDescHtml = descContainer.html()?.trim() || '';

  console.log(`✅ Kateqoriya tapıldı: "${h1}"`);
  console.log(`📄 category-desc həcmi: ${(rawDescHtml.length / 1024).toFixed(1)} KB`);

  // Step 2: OpenAI Category Rewrite
  console.log(`\n🤖 2. Kateqoriya OpenAI GPT-4o ilə yenidən yazılır...`);
  const rewrittenCat = await rewriteCategory(
    { h1, breadcrumbName, seoTitle, seoDescription, rawDescHtml, disclaimer: disclaimerText },
    'en'
  );

  // Fetch existing category for merge
  const { data: existingCat } = await supabase.from('categories').select('*').eq('slug', slug).single();
  const nameMap = existingCat?.name || {};
  const taglineMap = existingCat?.tagline || {};
  const descMap = existingCat?.description || {};

  nameMap['en'] = rewrittenCat.category?.name || breadcrumbName;
  taglineMap['en'] = rewrittenCat.category?.description || rewrittenCat.seo?.seo_description || seoDescription;
  descMap['en'] = rewrittenCat.category?.long_description || rawDescHtml;

  // Save to Supabase
  console.log(`💾 3. Kateqoriya Supabase bazasında yenilənir...`);
  const { error: catErr } = await supabase.from('categories').upsert(
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

  if (catErr) {
    console.error('⚠️ Kateqoriya yazılma xətası:', catErr.message);
  } else {
    console.log(`✅ Kateqoriya "${slug}" Supabase-də uğurla yeniləndi!`);
  }

  // Step 3: Extract Site Cards
  const cards = $('.review-card');
  console.log(`\n📦 4. Kateqoriyada tapılan sayt kartları sayı: ${cards.length}`);

  const siteItems = [];
  cards.each((i, el) => {
    const siteId = $(el).attr('data-site-id');
    const internalLink = $(el).attr('data-internal-link');
    const externalLink = $(el).attr('data-external-link');
    const name = $(el).find('.review-card-name').text().trim();
    const order = $(el).find('.review-card-order').text().trim();
    const desc = $(el).find('.review-card-footer').text().trim();

    if (name && internalLink) {
      siteItems.push({ siteId, order, name, internalLink, externalLink, desc });
    }
  });

  if (withSites) {
    const toProcess = siteItems.slice(0, limit);
    console.log(`\n🚀 5. ${toProcess.length} sayt üçün daxili rəy səhifələri açılır və AI ilə yazılır (GÖRSƏLSİZ):`);

    for (let i = 0; i < toProcess.length; i++) {
      const site = toProcess[i];
      console.log(`\n--- [${i + 1}/${toProcess.length}] ${site.name} (#${site.order}) ---`);

      const reviewData = await scrapeSingleSiteReview(site.internalLink, site, 'en');

      if (reviewData) {
        // Fetch existing site for merge
        const { data: existingSite } = await supabase.from('sites').select('*').eq('slug', reviewData.slug).single();
        const shortMap = existingSite?.short_description || {};
        const prosMap = existingSite?.pros || {};
        const consMap = existingSite?.cons || {};
        const pricingMap = existingSite?.pricing_info && typeof existingSite.pricing_info === 'object' ? existingSite.pricing_info : {};
        const longReviewMap = pricingMap.long_review || {};

        shortMap['en'] = reviewData.short_description || site.desc || '';
        prosMap['en'] = reviewData.pros || [];
        consMap['en'] = reviewData.cons || [];
        longReviewMap['en'] = reviewData.long_review || '';
        pricingMap.long_review = longReviewMap;

        // Upsert to Supabase sites table (STRICTLY NO IMAGES)
        const { error: siteErr } = await supabase.from('sites').upsert(
          {
            id: reviewData.id,
            slug: reviewData.slug,
            name: reviewData.name,
            domain: reviewData.domain,
            url: reviewData.url,
            category_slug: slug,
            rating: reviewData.rating,
            review_count: reviewData.review_count,
            is_18_plus: reviewData.is_18_plus,
            is_trending: reviewData.is_trending,
            rank_change: reviewData.rank_change,
            short_description: shortMap,
            pros: prosMap,
            cons: consMap,
            tags: reviewData.tags && reviewData.tags.length > 0 ? reviewData.tags : (existingSite?.tags || []),
            thumbnail_url: null, // STRICTLY NO IMAGES
            logo_url: null,      // STRICTLY NO IMAGES
            pricing_info: pricingMap,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slug' }
        );

        if (siteErr) {
          console.error(`  ⚠️ Sayt yazılma xətası (${site.name}):`, siteErr.message);
        } else {
          console.log(`  💾 [SUPABASE] ${site.name} bazaya yazıldı (Görsəlsiz, təmiz mətn və rəylə)!`);
        }
      }

      await new Promise((r) => setTimeout(r, 600));
    }
  }

  console.log('\n====================================================================');
  console.log('🎉 PROSES TAMAMLANDI!');
  console.log('====================================================================');
}

main();
