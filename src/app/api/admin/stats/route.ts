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
    // 1. Sites count
    const { count: sitesCount } = await supabase
      .from('sites')
      .select('*', { count: 'exact', head: true });

    // 2. Categories count
    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    // 3. Blogs count (safe fallback to 0 if table not yet created)
    let blogsCount = 0;
    try {
      const { count } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true });
      if (typeof count === 'number') blogsCount = count;
    } catch {}

    // 4. Reviews count
    let reviewsCount = 0;
    try {
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });
      if (typeof count === 'number') reviewsCount = count;
    } catch {}

    // 5. Users count from Supabase Auth
    let usersCount = 0;
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      if (authUsers?.users) {
        usersCount = authUsers.users.length;
      }
    } catch {}

    return NextResponse.json({
      success: true,
      stats: {
        sitesCount: sitesCount || 0,
        categoriesCount: categoriesCount || 0,
        blogsCount,
        reviewsCount,
        usersCount,
      },
    });
  } catch (err: any) {
    console.error('[AdminStats] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
