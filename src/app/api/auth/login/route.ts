// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db/connection';
import { verifyPassword } from '@/lib/auth/password';
import { signSessionToken } from '@/lib/auth/jwt';
import { SESSION_COOKIE_NAME, getDefaultDashboardPath, recordAuditLog } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user and profile
    const user = await queryOne(`
      SELECT u.id, u.email, u.password_hash, u.role, u.status, u.email_verified,
             p.first_name, p.last_name, p.country_id
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE LOWER(u.email) = ?
    `, [cleanEmail]);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Representatives must authenticate exclusively via Google OAuth
    if (user.role === 'REPRESENTATIVE' || (user.password_hash && user.password_hash.startsWith('oauth:'))) {
      return NextResponse.json(
        { error: 'Sales Representatives must sign in using "Continue with Google".' },
        { status: 403 }
      );
    }

    if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
      return NextResponse.json(
        { error: `Your account has been ${user.status.toLowerCase()}. Please contact support.` },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Sign session token
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      countryId: user.country_id,
      firstName: user.first_name,
      lastName: user.last_name,
    });

    const targetDashboard = getDefaultDashboardPath(user.role);

    // Record audit log
    recordAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'users',
      entityId: user.id,
      metadata: { role: user.role },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      redirectTo: targetDashboard,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
