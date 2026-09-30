import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import https from 'https';
import http from 'http';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';

export const maxDuration = 60; // Allow up to 60 seconds for AI rewrite

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
        timeout: 20000,
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

function parseSlug(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'top-porn-tube-sites';
    const knownLocales = [
      'ar', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'he',
      'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'nl', 'no', 'pl',
      'pt', 'ro', 'ru', 'sl', 'sv', 'th', 'tr', 'vi', 'zh', 'az',
    ];
    if (knownLocales.includes(parts[0]) && parts.length > 1) {
      return parts[1];
    }
    return parts[parts.length - 1];
  } catch {
    return 'top-porn-tube-sites';
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const url = body.url || 'https://theporndude.com/top-porn-tube-sites';
    const locale = body.locale || 'en';
    const saveToDb = body.saveToDb !== false;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY mühit dəyişəni təyin olunmayıb.' },
        { status: 500 }
      );
    }

    // Step 1: Ctrl+U Fetch
    const rawHtml = await fetchPageSource(url);

    // Step 2: Cheerio extract
    const $ = cheerio.load(rawHtml);
    let descContainer = $('.category-desc.scrollbox.custom-scrollbar');
    if (!descContainer.length) {
      descContainer = $('.category-desc');
    }

    if (!descContainer.length) {
      return NextResponse.json(
        { error: 'category-desc bloku səhifədə tapılmadı.' },
        { status: 400 }
      );
    }

    const rawDescHtml = descContainer.html()?.trim() || '';
    const rawText = descContainer.text().trim();
    const slug = parseSlug(url);

    // Step 3: OpenAI Human Rewrite
    const openai = new OpenAI({ apiKey });
    const languageNames: Record<string, string> = {
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
   Output clean semantic HTML (using <h3>, <p>, <strong> where appropriate) matching the original structure so it renders flawlessly in web browsers. Do not wrap in markdown code blocks.
5. LANGUAGE:
   The output MUST be written in ${targetLang}.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Rewrite the following category description text into 100% human-written, authentic copy for PornHub.net.co:\n\n${rawDescHtml}` },
      ],
      temperature: 0.85,
    });

    let rewrittenHtml = response.choices[0]?.message?.content?.trim() || '';
    rewrittenHtml = rewrittenHtml.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Step 4: Save to Supabase if requested
    let saved = false;
    if (saveToDb) {
      const supabase = getSupabaseAdmin();
      const { data: catRecord } = await supabase
        .from('categories')
        .select('id, slug, description, name')
        .eq('slug', slug)
        .single();

      if (!catRecord) {
        await supabase.from('categories').insert({
          id: slug,
          slug,
          name: { [locale]: slug.replace(/-/g, ' ').toUpperCase() },
          description: { [locale]: rewrittenHtml },
          tagline: { [locale]: `Best verified ${slug.replace(/-/g, ' ')} of 2026` },
          updated_at: new Date().toISOString(),
        });
      } else {
        const currentDesc = (catRecord.description && typeof catRecord.description === 'object')
          ? catRecord.description
          : {};
        currentDesc[locale] = rewrittenHtml;

        await supabase
          .from('categories')
          .update({
            description: currentDesc,
            updated_at: new Date().toISOString(),
          })
          .eq('slug', slug);
      }
      saved = true;
    }

    return NextResponse.json({
      success: true,
      slug,
      locale,
      url,
      rawHtmlLength: rawDescHtml.length,
      rawTextPreview: rawText.slice(0, 300) + '...',
      rewrittenHtml,
      saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scraper xətası' }, { status: 500 });
  }
}
