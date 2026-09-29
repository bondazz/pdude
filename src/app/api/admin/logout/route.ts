import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('ph_admin_token');
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete('ph_admin_token');
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
