#!/usr/bin/env node
/**
 * ==============================================================================
 * PornHub.net.co - Autonomous Category Scraper & AI Human Rewriter Bot
 * ==============================================================================
 * Fetches page source (Ctrl+U style with real browser headers, avoiding blocks),
 * extracts `.category-desc.scrollbox.custom-scrollbar`, sends it to OpenAI (GPT-4o)
 * for a 100/100 authentic human rewrite, and saves directly to Supabase categories.
 *
 * Usage:
 *   node scripts/scraper_bot.js [URL] [LOCALE]
 * Example:
 *   node scripts/scraper_bot.js https://theporndude.com/top-porn-tube-sites en
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// 1. Load environment variables from .env.local
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

if (!OPENAI_API_KEY) {
  console.error('❌ XƏTA: OPENAI_API_KEY .env.local daxilində tapılmadı!');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ XƏTA: Supabase konfiqurasiyası .env.local daxilində tapılmadı!');
  process.exit(1);
}

// 2. Initialize Clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 3. Parse Command-line Arguments
const args = process.argv.slice(2);
const targetUrl = args[0] || 'https://theporndude.com/top-porn-tube-sites';
const targetLocale = args[1] || parseLocaleFromUrl(targetUrl);

function parseLocaleFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const parts = u.pathname.split('/').filter(Boolean);
    const knownLocales = [
      'ar', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'he',
      'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'nl', 'no', 'pl',
      'pt', 'ro', 'ru', 'sl', 'sv', 'th', 'tr', 'vi', 'zh', 'az'
    ];
    if (parts.length > 1 && knownLocales.includes(parts[0])) {
      return parts[0];
    }
    return 'en';
  } catch {
    return 'en';
  }
}

function parseSlugFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'top-porn-tube-sites';
    // If first part is a locale, the slug is the second part
    const knownLocales = [
      'ar', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'he',
      'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'nl', 'no', 'pl',
      'pt', 'ro', 'ru', 'sl', 'sv', 'th', 'tr', 'vi', 'zh', 'az'
    ];
    if (knownLocales.includes(parts[0]) && parts.length > 1) {
      return parts[1];
    }
    return parts[parts.length - 1];
  } catch {
    return 'top-porn-tube-sites';
  }
}

/**
 * 4. Ctrl+U Style Direct HTTP Fetch (Browser Impersonation)
 */
function fetchPageSource(urlStr) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const client = u.protocol === 'https:' ? https : http;

    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
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
      timeout: 20000,
    };

    const req = client.request(options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, urlStr).toString();
        console.log(`↪ Yönləndirmə (Redirect) aşkarlandı: ${nextUrl}`);
        return resolve(fetchPageSource(nextUrl));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Server cavabı uğursuz oldu: HTTP ${res.statusCode}`));
      }

      let html = '';
      res.on('data', (chunk) => { html += chunk; });
      res.on('end', () => resolve(html));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Sorğu müddəti (Timeout) bitdi'));
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

/**
 * 5. OpenAI 100/100 Human Rewriter
 */
async function rewriteWithOpenAI(rawHtmlText, categorySlug, locale) {
  const languageNames = {
    en: 'English',
    az: 'Azerbaijani',
    tr: 'Turkish',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    it: 'Italian',
    ru: 'Russian',
    pt: 'Portuguese',
  };

  const targetLang = languageNames[locale] || 'English';

  const systemPrompt = `You are an elite, candid, seasoned adult entertainment directory reviewer and master copywriter writing for "PornHub.net.co" (PornHub Directory).
Your writing style is 100% HUMAN (tested 100/100 by human detection benchmarks), witty, unapologetic, highly engaging, and street-smart.

STRICT EDITORIAL RULES:
1. ZERO AI WORDS & NO ROBOTIC CLICHÉS:
   NEVER use: "dive into", "delve", "testament", "tapestry", "embark", "furthermore", "moreover", "in conclusion", "it's essential to", "realm", "plethora", "beacon", "game-changer", "meticulously curated".
2. BRANDING:
   Always replace "ThePornDude" or "PornDude" with "PornHub.net.co" or "our directory".
3. STRUCTURAL ACCURACY:
   Preserve every question / H3 heading concept and paragraph topic in exact chronological order, but completely reinvent the wording from scratch so there is zero plagiarism.
4. FORMATTING:
   Output clean semantic HTML (using <h3>, <p>, <strong> where appropriate) matching the original structure so it renders flawlessly in web browsers.
5. LANGUAGE:
   The output MUST be written in ${targetLang}.`;

  const userPrompt = `Rewrite the following category description text into 100% human-written, authentic, brand-new copy for PornHub.net.co:

RAW EXTRACTED CONTENT:
${rawHtmlText}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.85,
  });

  let cleanContent = response.choices[0].message.content.trim();
  cleanContent = cleanContent.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return cleanContent;
}

/**
 * 6. Main Orchestrator Flow
 */
async function runBot() {
  const slug = parseSlugFromUrl(targetUrl);

  console.log('==============================================================');
  console.log('🚀 PORNHUB.NET.CO - AUTONOMOUS SCRAPER & AI REWRITER BOT');
  console.log('==============================================================');
  console.log(`🔗 Hədəf URL:       ${targetUrl}`);
  console.log(`🏷️  Kateqoriya Slug: ${slug}`);
  console.log(`🌐 Dil (Locale):    ${targetLocale}`);
  console.log('--------------------------------------------------------------');

  // Step 1: Ctrl+U Fetch
  console.log('📡 Addım 1: Səhifə mənbə kodu (Ctrl+U rejimində) çəkilir...');
  let rawHtml;
  try {
    rawHtml = await fetchPageSource(targetUrl);
    console.log(`✅ Uğurla çəkildi! Mənbə həcmi: ${(rawHtml.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error(`❌ Səhifəni çəkmək mümkün olmadı: ${err.message}`);
    process.exit(1);
  }

  // Step 2: Cheerio Parsing
  console.log('🔍 Addım 2: .category-desc.scrollbox.custom-scrollbar bloku axtarılır...');
  const $ = cheerio.load(rawHtml);
  let descContainer = $('.category-desc.scrollbox.custom-scrollbar');
  if (!descContainer.length) {
    descContainer = $('.category-desc');
  }

  if (!descContainer.length) {
    console.error('❌ XƏTA: category-desc bloku səhifədə tapılmadı!');
    process.exit(1);
  }

  const rawDescHtml = descContainer.html().trim();
  const rawTextLength = descContainer.text().trim().length;
  console.log(`✅ category-desc bloku tapıldı! Mətn uzunluğu: ${rawTextLength} simvol.`);
  console.log('--------------------------------------------------------------');
  console.log('📜 Orijinal mətnin ilk 200 simvolu:');
  console.log(descContainer.text().trim().slice(0, 200) + '...\n');

  // Step 3: OpenAI Human Rewrite
  console.log('🤖 Addım 3: OpenAI GPT-4o ilə 100% human rewrite edilir...');
  let rewrittenHtml;
  try {
    rewrittenHtml = await rewriteWithOpenAI(rawDescHtml, slug, targetLocale);
    console.log('✅ OpenAI rewrite tamamlandı!');
    console.log('--------------------------------------------------------------');
    console.log('✨ YENİ REWRİTE OLUNMUŞ MƏTNİN BAŞLANĞICI:');
    console.log(rewrittenHtml.slice(0, 280) + '...\n');
  } catch (err) {
    console.error(`❌ OpenAI rewrite xətası: ${err.message}`);
    process.exit(1);
  }

  // Step 4: Supabase Database Update
  console.log('💾 Addım 4: Verilənlər bazasına (Supabase) yazılır...');
  try {
    // 4.1 Check if category exists
    const { data: catRecord, error: selectErr } = await supabase
      .from('categories')
      .select('id, slug, description, name')
      .eq('slug', slug)
      .single();

    if (selectErr && selectErr.code !== 'PGRST116') {
      console.warn('⚠️ Kateqoriya sorğusu xətası:', selectErr.message);
    }

    if (!catRecord) {
      console.log(`ℹ️ Kateqoriya bazada yoxdur (${slug}). Yeni qeyd yaradılır...`);
      const { error: insertErr } = await supabase
        .from('categories')
        .insert({
          id: slug,
          slug: slug,
          name: { [targetLocale]: slug.replace(/-/g, ' ').toUpperCase() },
          description: { [targetLocale]: rewrittenHtml },
          tagline: { [targetLocale]: `Best verified ${slug.replace(/-/g, ' ')} of 2026` },
          updated_at: new Date().toISOString(),
        });

      if (insertErr) {
        throw new Error(`Insert xətası: ${insertErr.message}`);
      }
    } else {
      console.log(`✅ Mövcud kateqoriya tapıldı (${catRecord.slug}). '${targetLocale}' sütun/sahəsi yenilənir...`);
      const currentDesc = (catRecord.description && typeof catRecord.description === 'object')
        ? catRecord.description
        : {};

      currentDesc[targetLocale] = rewrittenHtml;

      const { error: updateErr } = await supabase
        .from('categories')
        .update({
          description: currentDesc,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', slug);

      if (updateErr) {
        throw new Error(`Update xətası: ${updateErr.message}`);
      }
    }

    console.log('🎉 UĞURLA TAMAMLANDI! Məlumat Supabase-ə yazıldı və aktivləşdirildi.');
    console.log('==============================================================');
  } catch (err) {
    console.error(`❌ Supabase-ə yazılarkən xəta: ${err.message}`);
    process.exit(1);
  }
}

runBot();
