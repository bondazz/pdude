import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email və şifrə tələb olunur.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: 'Email və ya şifrə yanlışdır.' },
        { status: 401 }
      );
    }

    const user = data.user;
    const isAuthorized =
      user.email === 'info@pornhub.net.co' ||
      user.user_metadata?.role === 'admin';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Bu hesabla Admin Panelə giriş icazəniz yoxdur.' },
        { status: 403 }
      );
    }

    // Set secure auth cookie
    const cookieStore = await cookies();
    cookieStore.set('ph_admin_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: 'admin',
        name: user.user_metadata?.name || 'Samir (Admin)',
      },
    });
  } catch (err: any) {
    console.error('[AdminLogin] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Sistem xətası baş verdi.' },
      { status: 500 }
    );
  }
}
