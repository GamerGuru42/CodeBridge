import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    await execute(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, session.userId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to update notification:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
