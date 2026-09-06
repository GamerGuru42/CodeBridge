import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';
import type { Project } from '@/lib/db/types';

// Access Rule for Change Requests:
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

    const changeRequests = await query(
      `SELECT cr.*, p.first_name as requester_first_name, p.last_name as requester_last_name, u.role as requester_role
       FROM change_requests cr
       LEFT JOIN user_profiles p ON cr.requested_by = p.user_id
       LEFT JOIN users u ON cr.requested_by = u.id
       WHERE cr.project_id = ?
       ORDER BY cr.created_at DESC`,
      [projectId]
    );

    return NextResponse.json({ success: true, data: changeRequests });
  } catch (err: any) {
    console.error('Failed to fetch change requests:', err);
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
    const { title, description } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const crId = `cr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    await execute(
      `INSERT INTO change_requests (id, project_id, requested_by, title, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'PENDING', datetime('now'), datetime('now'))`,
      [crId, projectId, session.userId, title.trim(), description.trim()]
    );

    const newRequest = await queryOne(
      `SELECT cr.*, p.first_name as requester_first_name, p.last_name as requester_last_name, u.role as requester_role
       FROM change_requests cr
       LEFT JOIN user_profiles p ON cr.requested_by = p.user_id
       LEFT JOIN users u ON cr.requested_by = u.id
       WHERE cr.id = ?`,
      [crId]
    );

    return NextResponse.json({ success: true, data: newRequest });
  } catch (err: any) {
    console.error('Failed to create change request:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
