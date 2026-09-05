// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, getCurrentSession, recordAuditLog } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session) {
      recordAuditLog({
        userId: session.userId,
        action: 'USER_LOGOUT',
        entity: 'users',
        entityId: session.userId,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Failed to logout cleanly.' }, { status: 500 });
  }
}
