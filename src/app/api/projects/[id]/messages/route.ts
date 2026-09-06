import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';
import type { Project } from '@/lib/db/types';

// Access Rule for Project Messages:
// CLIENT: projects.client_id matches their client record
// REPRESENTATIVE: projects.representative_id matches their rep record
// COUNTRY_MANAGER: projects.country_id matches their country
// ADMIN / SUPER_ADMIN: All projects

async function checkAccess(session: any, projectId: string): Promise<Project | null> {
  const project = await queryOne<Project>('SELECT * FROM projects WHERE id = ?', [projectId]);
  if (!project) return null;

  if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
    return project;
  }

  if (session.role === 'CLIENT') {
    const client = await queryOne('SELECT id FROM clients WHERE user_id = ?', [session.userId]);
    if (client && project.client_id === client.id) return project;
  }

  if (session.role === 'REPRESENTATIVE') {
    const rep = await queryOne('SELECT id FROM representatives WHERE user_id = ?', [session.userId]);
    if (rep && project.representative_id === rep.id) return project;
  }

  if (session.role === 'COUNTRY_MANAGER') {
    const profile = await queryOne('SELECT country_id FROM user_profiles WHERE user_id = ?', [session.userId]);
    if (profile && project.country_id === profile.country_id) return project;
  }

  if (session.role === 'DEVELOPER') {
    const member = await queryOne('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, session.userId]);
    if (member) return project;
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

    const { id: projectId } = await params;
    const project = await checkAccess(session, projectId);
    if (!project) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });

    const messages = await query(
      `SELECT m.*, p.first_name as sender_first_name, p.last_name as sender_last_name, u.role as sender_role
       FROM messages m
       LEFT JOIN user_profiles p ON m.sender_id = p.user_id
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.project_id = ?
       ORDER BY m.created_at ASC`,
      [projectId]
    );

    return NextResponse.json({ success: true, data: messages });
  } catch (err: any) {
    console.error('Failed to fetch project messages:', err);
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

    const { id: projectId } = await params;
    const project = await checkAccess(session, projectId);
    if (!project) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });

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
      `INSERT INTO messages (id, project_id, sender_id, content, message_type, created_at)
       VALUES (?, ?, ?, ?, 'CHAT', datetime('now'))`,
      [messageId, projectId, session.userId, cleanContent]
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
    console.error('Failed to send project message:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
