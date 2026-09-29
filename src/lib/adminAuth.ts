import { cookies } from 'next/headers';
import { supabase, getSupabaseAdmin } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export async function getAdminSession(): Promise<{ authorized: boolean; user?: AdminUser }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ph_admin_token')?.value;

    if (!token) {
      return { authorized: false };
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return { authorized: false };
    }

    const email = data.user.email || '';
    const role = data.user.user_metadata?.role || (email === 'info@pornhub.net.co' ? 'admin' : 'user');

    if (email === 'info@pornhub.net.co' || role === 'admin') {
      return {
        authorized: true,
        user: {
          id: data.user.id,
          email,
          role: 'admin',
          name: data.user.user_metadata?.name || 'Samir (Admin)',
        },
      };
    }

    return { authorized: false };
  } catch (err) {
    console.error('[AdminAuth] Error verifying session:', err);
    return { authorized: false };
  }
}
