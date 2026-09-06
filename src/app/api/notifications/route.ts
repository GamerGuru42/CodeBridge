import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notifications = await query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [session.userId]
    );

    return NextResponse.json({ success: true, data: notifications });
  } catch (err: any) {
    console.error('Failed to fetch notifications:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

