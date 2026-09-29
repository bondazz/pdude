import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';

export async function GET() {
  const session = await getAdminSession();
  if (!session.authorized || !session.user) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  return NextResponse.json({
    authorized: true,
    user: session.user,
  });
}
