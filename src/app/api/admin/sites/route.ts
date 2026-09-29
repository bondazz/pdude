import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { invalidateDataCache } from '@/lib/dataService';

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('q');

    let query = supabase.from('sites').select('*').order('rating', { ascending: false });

    if (category) {
      query = query.eq('category_slug', category);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, sites: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const body = await request.json();
    const {
      name,
      slug,
      domain,
      url,
      category_slug,
      rating,
      is_free,
      is_safe,
      is_trending,
      badge,
      short_description,
      pricing_info,
    } = body;

    if (!name || !url || !category_slug) {
      return NextResponse.json(
        { error: 'Sayt adı, URL və Kateqoriya tələb olunur.' },
        { status: 400 }
      );
    }

    const cleanSlug = (slug || name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-');

    const cleanDomain = domain || new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');

    const id = cleanSlug;

    const { data, error } = await supabase.from('sites').insert({
      id,
      slug: cleanSlug,
      name,
      domain: cleanDomain,
      url,
      category_slug,
      rating: Number(rating) || 9.0,
      is_free: is_free !== undefined ? is_free : true,
      is_safe: is_safe !== undefined ? is_safe : true,
      is_trending: Boolean(is_trending),
      badge: badge || '',
      short_description: typeof short_description === 'object' ? short_description : { en: short_description || '' },
      pricing_info: pricing_info || (is_free ? '100% Free' : 'Premium'),
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateDataCache();
    return NextResponse.json({ success: true, site: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { id, name, slug, domain, url, category_slug, rating, is_free, is_safe, is_trending, badge, short_description, pricing_info } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID tələb olunur.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sites')
      .update({
        name,
        slug,
        domain,
        url,
        category_slug,
        rating: Number(rating),
        is_free,
        is_safe,
        is_trending,
        badge,
        short_description: typeof short_description === 'object' ? short_description : { en: short_description || '' },
        pricing_info,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateDataCache();
    return NextResponse.json({ success: true, site: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID tələb olunur.' }, { status: 400 });
    }

    const { error } = await supabase.from('sites').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateDataCache();
    return NextResponse.json({ success: true, message: 'Sayt uğurla silindi.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
