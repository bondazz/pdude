import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Safe fallback URL and key to prevent build-time crashes if environment variables are missing
const safeUrl = supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co';
const safeAnonKey = supabaseAnonKey && supabaseAnonKey.length > 5 ? supabaseAnonKey : 'placeholder-anon-key';

// Client for public/browser operations
export const supabase: SupabaseClient = createClient(safeUrl, safeAnonKey);

// Server/Admin client (bypasses RLS) using SERVICE_ROLE_KEY
export const getSupabaseAdmin = (): SupabaseClient => {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 5
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : safeAnonKey;

  return createClient(safeUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
