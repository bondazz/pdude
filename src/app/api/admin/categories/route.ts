import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { invalidateDataCache } from '@/lib/dataService';

export async function GET() {
  const session = await getAdminSession();
  if (!session.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, categories: data || [] });
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
    const { name, slug, icon, badge, order_index, tagline, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Ad və slug tələb olunur.' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const id = cleanSlug;

    const { data, error } = await supabase.from('categories').insert({
      id,
      slug: cleanSlug,
      name: typeof name === 'object' ? name : { en: name },
      tagline: typeof tagline === 'object' ? tagline : { en: tagline || '' },
      description: typeof description === 'object' ? description : { en: description || '' },
      icon: icon || 'folder',
      badge: badge || '',
      order_index: Number(order_index) || 0,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateDataCache();
    return NextResponse.json({ success: true, category: data });
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
    const { id, name, slug, icon, badge, order_index, tagline, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID tələb olunur.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('categories')
      .update({
        slug,
        name: typeof name === 'object' ? name : { en: name },
        tagline: typeof tagline === 'object' ? tagline : { en: tagline || '' },
        description: typeof description === 'object' ? description : { en: description || '' },
        icon,
        badge,
        order_index: Number(order_index),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateDataCache();
    return NextResponse.json({ success: true, category: data });
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

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateDataCache();
    return NextResponse.json({ success: true, message: 'Kateqoriya uğurla silindi.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
