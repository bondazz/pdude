import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await getAdminSession();
  if (!session.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Table might not exist yet if user hasn't run migration in SQL editor
      return NextResponse.json({ success: true, blogs: [], needsMigration: true, message: error.message });
    }

    return NextResponse.json({ success: true, blogs: data || [] });
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
    const { title, slug, content, excerpt, cover_image, author, published, tags } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Başlıq, slug və məzmun tələb olunur.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('blogs').insert({
      title,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
      content,
      excerpt: excerpt || '',
      cover_image: cover_image || '',
      author: author || session.user?.name || 'Samir (Admin)',
      published: published !== undefined ? published : true,
      tags: Array.isArray(tags) ? tags : [],
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, blog: data });
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
    const { id, title, slug, content, excerpt, cover_image, author, published, tags } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID tələb olunur.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('blogs')
      .update({
        title,
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
        content,
        excerpt: excerpt || '',
        cover_image: cover_image || '',
        author: author || 'Samir (Admin)',
        published: published !== undefined ? published : true,
        tags: Array.isArray(tags) ? tags : [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, blog: data });
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

    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Bloq uğurla silindi.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
