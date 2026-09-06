import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const now = new Date().toISOString();
    const cursorId = `mrc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    await execute(`
      INSERT INTO message_read_cursors (id, user_id, project_id, last_read_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, project_id) DO UPDATE SET
        last_read_at = excluded.last_read_at,
        updated_at = excluded.updated_at
    `, [cursorId, session.userId, projectId, now, now]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to mark project messages as read:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
