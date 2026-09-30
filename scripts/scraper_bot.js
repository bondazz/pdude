#!/usr/bin/env node
/**
 * ==============================================================================
 * PornHub.net.co - Multi-Language Autonomous Category Scraper & AI Rewriter Bot
 * ==============================================================================
 * Automatically discovers, scrapes, and rewrites all 30 languages for any category:
 *   - Ctrl+U real browser headers (bypassing Cloudflare)
 *   - Extracts SEO titles, meta descriptions, and category-desc text blocks
 *   - Uses OpenAI GPT-4o to rewrite in 100% human voice without AI clichés
 *   - Replaces branding with "PornHub.net.co"
 *   - Saves directly to Supabase categories table for every single language
 *
 * Usage:
 *   node scripts/scraper_bot.js [CATEGORY_URL_OR_SLUG] [OPTIONAL_SINGLE_LOCALE]
 *
 * Examples:
 *   node scripts/scraper_bot.js https://theporndude.com/top-porn-tube-sites
 *   node scripts/scraper_bot.js top-porn-tube-sites
 *   node scripts/scraper_bot.js https://theporndude.com/top-porn-tube-sites de
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// 1. Load environment variables
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

// 2. Comprehensive 30-Language Map (Matches exactly the user's list)
const ALL_LOCALES = [
  { code: 'en', name: 'English', getUrl: (slug) => `https://theporndude.com/${slug}` },
  { code: 'az', name: 'Azerbaijani', getUrl: (slug) => `https://theporndude.com/${slug}` }, // Translated to native human Azerbaijani
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

// 3. Helper to parse slug
function parseSlug(input) {
  try {
    if (input.startsWith('http')) {
      const u = new URL(input);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length === 0) return 'top-porn-tube-sites';
      const localeCodes = ALL_LOCALES.map((l) => l.code);
      if (localeCodes.includes(parts[0]) && parts.length > 1) {
        return parts[1];
      }
      return parts[parts.length - 1];
    }
    return input.trim();
  } catch {
    return 'top-porn-tube-sites';
  }
}

// 4. Ctrl+U Style Direct HTTP Fetch (Browser Impersonation)
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

// 5. OpenAI 100/100 Human Rewriter
async function rewriteWithOpenAI(data, targetLang) {
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
   Respond with a JSON object containing:
   {
     "categoryTitle": "Rewritten punchy Category Title",
     "seoTitle": "Rewritten SEO Title under 65 chars (e.g. Best ... 2026 | PornHub.net.co)",
     "seoDescription": "Rewritten click-worthy meta description under 155 chars",
     "content": "Rewritten full semantic HTML content with <h3> and <p> blocks"
   }`;

  const userPrompt = `Input Data to Rewrite:
Category Name: ${data.h1}
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

// 6. Process a Single Language
async function processLocale(slug, localeItem) {
  const url = localeItem.getUrl(slug);
  const lang = localeItem.name;
  const code = localeItem.code;

  console.log(`\n⏳ [${code.toUpperCase()}] ${lang} səhifəsi çəkilir: ${url}`);

  try {
    const rawHtml = await fetchPageSource(url);
    const $ = cheerio.load(rawHtml);

    const seoTitle = $('title').text().trim() || slug;
    const seoDescription = $('meta[name="description"]').attr('content')?.trim() || '';
    const h1 = $('h1').text().trim() || slug.replace(/-/g, ' ');

    let descContainer = $('.category-desc.scrollbox.custom-scrollbar');
    if (!descContainer.length) descContainer = $('.category-desc');

    const rawDescHtml = descContainer.html()?.trim() || '';
    if (!rawDescHtml) {
      console.warn(`⚠️ [${code.toUpperCase()}] category-desc bloku tapılmadı, keçilir.`);
      return null;
    }

    console.log(`🤖 [${code.toUpperCase()}] OpenAI GPT-4o ilə ${lang} dilində rewrite edilir...`);
    const rewritten = await rewriteWithOpenAI(
      { h1, seoTitle, seoDescription, rawDescHtml },
      lang
    );

    console.log(`✅ [${code.toUpperCase()}] Rewrite tamamlandı!`);
    return {
      code,
      name: rewritten.categoryTitle || h1,
      seoTitle: rewritten.seoTitle || seoTitle,
      tagline: rewritten.seoDescription || seoDescription,
      description: rewritten.content || rawDescHtml,
    };
  } catch (err) {
    console.error(`❌ [${code.toUpperCase()}] Xəta baş verdi: ${err.message}`);
    return null;
  }
}

// 7. Main Runner
async function main() {
  const inputArg = process.argv[2] || 'https://theporndude.com/top-porn-tube-sites';
  const slug = parseSlug(inputArg);
  const singleLocale = process.argv[3]; // Optional single locale override

  console.log('====================================================================');
  console.log('🌐 PORNHUB.NET.CO - BÜTÜN DİLLƏR ÜZRƏ AVTOMATİK KATEQORİYA BOTU');
  console.log('====================================================================');
  console.log(`🏷️  Hədəf Kateqoriya Slug: ${slug}`);
  console.log(`📚 Toplam Dil Sayı:       ${singleLocale ? 1 : ALL_LOCALES.length} dil`);
  console.log('====================================================================');

  const targetLocales = singleLocale
    ? ALL_LOCALES.filter((l) => l.code === singleLocale)
    : ALL_LOCALES;

  if (targetLocales.length === 0) {
    console.error(`❌ Təyin olunmuş dil tapılmadı: ${singleLocale}`);
    process.exit(1);
  }

  // 7.1 Fetch current category in Supabase
  const { data: catRecord } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  const nameMap = catRecord?.name || {};
  const taglineMap = catRecord?.tagline || {};
  const descMap = catRecord?.description || {};

  let successCount = 0;

  // Process sequentially or with slight delay to ensure pristine quality & avoid rate limits
  for (let i = 0; i < targetLocales.length; i++) {
    const item = targetLocales[i];
    console.log(`\n---------------------------------------------------------`);
    console.log(`▶ Tərəqqi: [${i + 1}/${targetLocales.length}] - ${item.name} (${item.code.toUpperCase()})`);

    const result = await processLocale(slug, item);

    if (result) {
      nameMap[result.code] = result.name;
      taglineMap[result.code] = result.tagline;
      descMap[result.code] = result.description;

      // Update Supabase immediately after each language so progress is persistent
      const { error: updateErr } = await supabase
        .from('categories')
        .upsert(
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

      if (updateErr) {
        console.error(`⚠️ Supabase qeydiyyat xətası (${item.code}):`, updateErr.message);
      } else {
        console.log(`💾 [${item.code.toUpperCase()}] Supabase bazasına yazıldı!`);
        successCount++;
      }
    }

    // Small courteous pause between languages
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log('\n====================================================================');
  console.log(`🎉 ƏMƏLİYYAT BİTDİ! Toplam ${successCount}/${targetLocales.length} dil uğurla hazırlandı və Supabase bazasına yazıldı.`);
  console.log('====================================================================');
}

main();
