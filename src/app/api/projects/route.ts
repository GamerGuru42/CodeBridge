// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { query, queryOne } from '@/lib/db/connection';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, userId } = session;
    let sql = `
      SELECT p.*,
             c.company_name, c.industry,
             co.code as country_code, co.name as country_name,
             s.name as service_name, s.category as service_category,
             rep_p.first_name as rep_first_name, rep_p.last_name as rep_last_name
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      JOIN countries co ON p.country_id = co.id
      LEFT JOIN services s ON p.service_id = s.id
      LEFT JOIN representatives r ON p.representative_id = r.id
      LEFT JOIN users rep_u ON r.user_id = rep_u.id
      LEFT JOIN user_profiles rep_p ON rep_u.id = rep_p.user_id
    `;
    let params: any[] = [];

    if (role === 'CLIENT') {
      const client = await queryOne('SELECT id FROM clients WHERE user_id = ?', [userId]);
      if (!client) return NextResponse.json({ projects: [] });
      sql += ' WHERE p.client_id = ? ORDER BY p.created_at DESC';
      params = [client.id];
    } else if (role === 'REPRESENTATIVE') {
      const rep = await queryOne('SELECT id FROM representatives WHERE user_id = ?', [userId]);
      if (!rep) return NextResponse.json({ projects: [] });
      sql += ' WHERE p.representative_id = ? ORDER BY p.created_at DESC';
      params = [rep.id];
    } else if (role === 'DEVELOPER') {
      sql += `
        WHERE p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)
           OR ? = 'SUPER_ADMIN'
        ORDER BY p.created_at DESC
      `;
      params = [userId, role];
    } else if (role === 'COUNTRY_MANAGER') {
      const profile = await queryOne('SELECT country_id FROM user_profiles WHERE user_id = ?', [userId]);
      if (profile?.country_id) {
        sql += ' WHERE p.country_id = ? ORDER BY p.created_at DESC';
        params = [profile.country_id];
      } else {
        sql += ' ORDER BY p.created_at DESC';
      }
    } else {
      // SUPER_ADMIN / ADMIN
      sql += ' ORDER BY p.created_at DESC';
    }

    const projects = await query(sql, params);

    // Fetch milestones for projects
    const projectsWithMilestones = await Promise.all(
      projects.map(async (proj) => {
        const milestones = await query(`
          SELECT * FROM project_milestones
          WHERE project_id = ?
          ORDER BY order_index ASC
        `, [proj.id]);
        return { ...proj, milestones };
      })
    );

    return NextResponse.json({ projects: projectsWithMilestones });
  } catch (err: any) {
    console.error('Failed to fetch projects:', err);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
