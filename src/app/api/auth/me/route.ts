// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { queryOne } from '@/lib/db/connection';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = await queryOne(`
    SELECT u.id, u.email, u.role, u.status, u.email_verified,
           p.first_name, p.last_name, p.phone, p.country_id, p.timezone,
           c.code as country_code, c.name as country_name, c.currency as country_currency,
           r.approval_status as rep_status, r.commission_rate_bps
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    LEFT JOIN countries c ON p.country_id = c.id
    LEFT JOIN representatives r ON u.id = r.user_id
    WHERE u.id = ?
  `, [session.userId]);

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      country: {
        id: user.country_id,
        code: user.country_code,
        name: user.country_name,
        currency: user.country_currency,
      },
      representative: user.role === 'REPRESENTATIVE' ? {
        status: user.rep_status,
        commissionRateBps: user.commission_rate_bps,
      } : null,
    },
  });
}
