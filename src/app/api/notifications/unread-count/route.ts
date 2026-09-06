import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notifCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifCount?.count || 0,
        messages: 0,
      }
    });
  } catch (err: any) {
    console.error('Failed to fetch unread count:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

