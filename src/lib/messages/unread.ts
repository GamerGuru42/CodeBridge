import { queryOne } from '@/lib/db/connection';
import type { SessionPayload } from '@/lib/auth/jwt';

export async function getUnreadMessagesCount(session: SessionPayload): Promise<number> {
  const userId = session.userId;
  let accessCondition = '';
  const params: any[] = [userId, userId]; // 1: c.user_id = ?, 2: m.sender_id != ?

  if (session.role === 'CLIENT') {
    accessCondition = `
      (m.lead_id IN (SELECT id FROM leads WHERE client_id = (SELECT id FROM clients WHERE user_id = ?)))
      OR
      (m.project_id IN (SELECT id FROM projects WHERE client_id = (SELECT id FROM clients WHERE user_id = ?)))
    `;
    params.push(userId, userId);
  } else if (session.role === 'REPRESENTATIVE') {
    accessCondition = `
      (m.lead_id IN (SELECT id FROM leads WHERE representative_id = (SELECT id FROM representatives WHERE user_id = ?)))
      OR
      (m.project_id IN (SELECT id FROM projects WHERE representative_id = (SELECT id FROM representatives WHERE user_id = ?)))
    `;
    params.push(userId, userId);
  } else if (session.role === 'COUNTRY_MANAGER') {
    accessCondition = `
      (m.lead_id IN (SELECT id FROM leads WHERE country_id = (SELECT country_id FROM user_profiles WHERE user_id = ?)))
      OR
      (m.project_id IN (SELECT id FROM projects WHERE country_id = (SELECT country_id FROM user_profiles WHERE user_id = ?)))
    `;
    params.push(userId, userId);
  } else if (session.role === 'DEVELOPER') {
    accessCondition = `
      (m.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?))
    `;
    params.push(userId);
  } else if (['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
    accessCondition = '1=1';
  }

  if (!accessCondition) {
    return 0;
  }

  try {
    const countRes = await queryOne<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM messages m
      LEFT JOIN message_read_cursors c ON 
        (c.user_id = ? AND ((m.lead_id IS NOT NULL AND c.lead_id = m.lead_id) OR (m.project_id IS NOT NULL AND c.project_id = m.project_id)))
      WHERE m.sender_id != ? 
      AND (m.created_at > COALESCE(c.last_read_at, '1970-01-01'))
      AND (${accessCondition})
    `, params);

    return countRes?.count || 0;
  } catch (err) {
    console.error('Failed to query unread message count:', err);
    return 0;
  }
}
