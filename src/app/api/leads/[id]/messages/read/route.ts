import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';
import type { Lead } from '@/lib/db/types';

async function checkAccess(session: any, leadId: string): Promise<Lead | null> {
  const lead = await queryOne<Lead>('SELECT * FROM leads WHERE id = ?', [leadId]);
  if (!lead) return null;

  if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
    return lead;
  }

  if (session.role === 'CLIENT') {
    const client = await queryOne('SELECT id FROM clients WHERE user_id = ?', [session.userId]);
    if (client && lead.client_id === client.id) return lead;
  }

  if (session.role === 'REPRESENTATIVE') {
    const rep = await queryOne('SELECT id FROM representatives WHERE user_id = ?', [session.userId]);
    if (rep && lead.representative_id === rep.id) return lead;
  }

  if (session.role === 'COUNTRY_MANAGER') {
    const profile = await queryOne('SELECT country_id FROM user_profiles WHERE user_id = ?', [session.userId]);
    if (profile && lead.country_id === profile.country_id) return lead;
  }

  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: leadId } = await params;
    const lead = await checkAccess(session, leadId);
    if (!lead) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });

    const cursorId = `cur_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    await execute(
      `INSERT INTO message_read_cursors (id, user_id, lead_id, last_read_at, updated_at)
       VALUES (?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT (user_id, lead_id) DO UPDATE SET 
       last_read_at = datetime('now'),
       updated_at = datetime('now')`,
      [cursorId, session.userId, leadId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to update read cursor:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
