import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, transaction } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';
import type { Message, UserProfile, Lead } from '@/lib/db/types';

// Access Rule for Lead Messages:
// CLIENT: leads.client_id matches their client record
// REPRESENTATIVE: leads.representative_id matches their rep record
// COUNTRY_MANAGER: leads.country_id matches their country
// ADMIN / SUPER_ADMIN: All leads

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: leadId } = await params;
    const lead = await checkAccess(session, leadId);
    if (!lead) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });

    const messages = await query(
      `SELECT m.*, p.first_name as sender_first_name, p.last_name as sender_last_name, u.role as sender_role
       FROM messages m
       LEFT JOIN user_profiles p ON m.sender_id = p.user_id
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.lead_id = ?
       ORDER BY m.created_at ASC`,
      [leadId]
    );

    return NextResponse.json({ success: true, data: messages });
  } catch (err: any) {
    console.error('Failed to fetch lead messages:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Message exceeds 5000 characters' }, { status: 400 });
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const cleanContent = content.trim().replace(/<[^>]*>?/gm, '');

    await execute(
      `INSERT INTO messages (id, lead_id, sender_id, content, message_type, created_at)
       VALUES (?, ?, ?, ?, 'CHAT', datetime('now'))`,
      [messageId, leadId, session.userId, cleanContent]
    );

    const message = await queryOne(
      `SELECT m.*, p.first_name as sender_first_name, p.last_name as sender_last_name, u.role as sender_role
       FROM messages m
       LEFT JOIN user_profiles p ON m.sender_id = p.user_id
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [messageId]
    );

    return NextResponse.json({ success: true, data: message });
  } catch (err: any) {
    console.error('Failed to send lead message:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
