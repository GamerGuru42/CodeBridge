import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession as getSession } from '@/lib/auth/session';
import { getUnreadMessagesCount } from '@/lib/messages/unread';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const unreadCount = await getUnreadMessagesCount(session);
    return NextResponse.json({ unreadCount });
  } catch (err: any) {
    console.error('Failed to get unread count:', err);
    return NextResponse.json({ unreadCount: 0 });
  }
}

