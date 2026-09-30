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

// 4. OpenAI 100/100 Human Category Rewriter
async function rewriteCategory(data, targetLang) {
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
   The output MUST be written naturally in ${targetLang}.
   Respond with a JSON object:
   {
     "categoryTitle": "Rewritten punchy Category Title",
     "seoTitle": "Rewritten SEO Title under 65 chars (e.g. Best ... 2026 | PornHub.net.co)",
     "seoDescription": "Rewritten click-worthy meta description under 155 chars",
     "content": "Rewritten full semantic HTML content with <h3> and <p> blocks"
   }`;

  const userPrompt = `Category: ${data.h1}
Original SEO Title: ${data.seoTitle}
Original SEO Description: ${data.seoDescription}
Raw Text Content:
${data.rawDescHtml}
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

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {
      categoryTitle: data.h1,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      content: response.choices[0].message.content,
    };
  }
}

// 5. OpenAI 100/100 Human Site Review Rewriter
async function rewriteSiteReview(siteData) {
  const systemPrompt = `You are an elite, brutally honest adult site critic and reviewer writing for PornHub.net.co.
Write an authentic, 100% human-voiced, engaging in-depth review for ${siteData.name}.

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

  const userPrompt = `Site Name: ${siteData.name}
Domain: ${siteData.domain}
Raw Original Review:
${siteData.rawReviewText}
Original Pros:
${JSON.stringify(siteData.pros)}
Original Cons:
${JSON.stringify(siteData.cons)}
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

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {
      shortDescription: siteData.shortDesc || '',
      longReview: siteData.rawReviewText || '',
      pros: siteData.pros || [],
      cons: siteData.cons || [],
    };
  }
}

// 6. Deep Scrape Review Page (e.g. view-source:theporndude.com/566/pornhub)
async function scrapeSingleSiteReview(internalUrl, fallbackData) {
  console.log(`\n  🔎 [Ctrl+U] Sayt rəyi çəkilir: ${internalUrl}`);
  try {
    const html = await fetchPageSource(internalUrl);
    const $ = cheerio.load(html);

    const siteName = $('[data-site-name]').first().text().trim() || fallbackData.name;
    const domainRaw = $('[data-site-domain]').first().text().trim() || fallbackData.externalLink;
    const domain = domainRaw.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
    const ratingRaw = parseFloat($('.rating-count, [itemprop="ratingValue"]').first().text().trim()) || 9.5;
    const rating = ratingRaw <= 5 ? +(ratingRaw * 2).toFixed(1) : +(ratingRaw).toFixed(1); // Scale to 10

    let reviewDesc = $('.link-details-review[data-site-description], .link-details-review').html()?.trim() || '';
    if (!reviewDesc) {
      reviewDesc = $('.link-content, #site-description').text().trim();
    }

    const pros = $('ul.pros li').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const cons = $('ul.cons li').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const bigThumb = $('.big-thumb-holder img, .example-thumb-img').attr('src') || fallbackData.thumb;

    console.log(`  🤖 OpenAI GPT-4o ilə ${siteName} rəyi 100% human rewrite edilir...`);
    const rewritten = await rewriteSiteReview({
      name: siteName,
      domain,
      rawReviewText: reviewDesc,
      pros: pros.length > 0 ? pros : ['High quality HD streaming', 'Huge library', 'Regular updates'],
      cons: cons.length > 0 ? cons : ['Ad placements on free tier'],
      shortDesc: fallbackData.desc,
    });

    const slug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    return {
      id: fallbackData.siteId || slug,
      slug,
      name: siteName,
      domain,
      url: fallbackData.externalLink || `https://${domain}`,
      rating,
      short_description: { en: rewritten.shortDescription },
      long_review: { en: rewritten.longReview },
      pros: { en: rewritten.pros },
      cons: { en: rewritten.cons },
      thumbnail_url: bigThumb,
    };
  } catch (err) {
    console.error(`  ⚠️ Sayt rəyini çəkmək mümkün olmadı (${fallbackData.name}): ${err.message}`);
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
  console.log(`\n🤖 2. Kateqoriya OpenAI GPT-4o ilə 100% human rewrite edilir...`);
  const rewrittenCat = await rewriteCategory(
    { h1, seoTitle, seoDescription, rawDescHtml },
    'English'
  );

  // Save to Supabase
  console.log(`💾 3. Kateqoriya Supabase bazasında yenilənir...`);
  const { error: catErr } = await supabase.from('categories').upsert(
    {
      id: slug,
      slug,
      name: { en: rewrittenCat.categoryTitle || h1 },
      tagline: { en: rewrittenCat.seoDescription || seoDescription },
      description: { en: rewrittenCat.content || rawDescHtml },
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
    const thumb = $(el).find('.review-card-img').attr('data-src') || $(el).find('.review-card-img').attr('src');
    const desc = $(el).find('.review-card-footer').text().trim();

    if (name && internalLink) {
      siteItems.push({ siteId, order, name, internalLink, externalLink, thumb, desc });
    }
  });

  if (withSites) {
    const toProcess = siteItems.slice(0, limit);
    console.log(`\n🚀 5. ${toProcess.length} sayt üçün daxili rəy səhifələri (view-source:...) açılır və AI ilə yazılır:`);

    for (let i = 0; i < toProcess.length; i++) {
      const site = toProcess[i];
      console.log(`\n--- [${i + 1}/${toProcess.length}] ${site.name} (#${site.order}) ---`);

      const reviewData = await scrapeSingleSiteReview(site.internalLink, site);

      if (reviewData) {
        // Upsert to Supabase sites table
        const { error: siteErr } = await supabase.from('sites').upsert(
          {
            id: reviewData.id,
            slug: reviewData.slug,
            name: reviewData.name,
            domain: reviewData.domain,
            url: reviewData.url,
            category_slug: slug,
            rating: reviewData.rating,
            short_description: reviewData.short_description,
            pros: reviewData.pros,
            cons: reviewData.cons,
            thumbnail_url: reviewData.thumbnail_url,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slug' }
        );

        if (siteErr) {
          console.error(`  ⚠️ Sayt yazılma xətası (${site.name}):`, siteErr.message);
        } else {
          console.log(`  💾 [SUPABASE] ${site.name} bazaya yazıldı və rəy hazırlandı!`);
        }
      }

      await new Promise((r) => setTimeout(r, 800));
    }
  }

  console.log('\n====================================================================');
  console.log('🎉 PROSES TAMAMLANDI!');
  console.log('====================================================================');
}

main();
