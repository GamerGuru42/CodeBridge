import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // Determine the user's role and get relevant lead/project IDs
    const userId = session.userId;
    let relevantProjectIds: string[] = [];
    let relevantLeadIds: string[] = [];

    // This logic approximates the count of unread messages across all relevant threads for a user.
    // In a full production system with high volume, this query would be optimized or cached.

    // A simpler approach for the badge is to just sum up all messages where created_at > last_read_at
    // for all threads the user has access to, or just where recipient_id = user_id if we have direct DMs.
    // Currently, our system uses message_read_cursors to track read status.

    // We can do a global query:
    // Count all messages in leads/projects where the user is a participant, minus the ones they've read.
    // To make this robust, we should calculate per lead/project.
    
    // For simplicity, let's query the unread count by doing a left join on cursors.
    
    let accessCondition = '';
    
    if (session.role === 'CLIENT') {
       accessCondition = `
         (m.lead_id IN (SELECT id FROM leads WHERE client_id = (SELECT id FROM clients WHERE user_id = ?)))
         OR
         (m.project_id IN (SELECT id FROM projects WHERE client_id = (SELECT id FROM clients WHERE user_id = ?)))
       `;
    } else if (session.role === 'REPRESENTATIVE') {
       accessCondition = `
         (m.lead_id IN (SELECT id FROM leads WHERE representative_id = (SELECT id FROM representatives WHERE user_id = ?)))
         OR
         (m.project_id IN (SELECT id FROM projects WHERE representative_id = (SELECT id FROM representatives WHERE user_id = ?)))
       `;
    } else if (session.role === 'COUNTRY_MANAGER') {
       accessCondition = `
         (m.lead_id IN (SELECT id FROM leads WHERE country_id = (SELECT country_id FROM user_profiles WHERE user_id = ?)))
         OR
         (m.project_id IN (SELECT id FROM projects WHERE country_id = (SELECT country_id FROM user_profiles WHERE user_id = ?)))
       `;
    } else if (['SUPER_ADMIN', 'ADMIN', 'DEVELOPER'].includes(session.role)) {
       accessCondition = '1=1'; // Admins see all for now, devs might need refinement
    }

    if (accessCondition) {
      // Find messages that the user hasn't read.
      // A message is unread if its created_at > COALESCE(cursor.last_read_at, '1970-01-01')
      const countRes = await queryOne(`
        SELECT COUNT(*) as count
        FROM messages m
        LEFT JOIN message_read_cursors c ON 
          (c.user_id = ? AND ((m.lead_id IS NOT NULL AND c.lead_id = m.lead_id) OR (m.project_id IS NOT NULL AND c.project_id = m.project_id)))
        WHERE m.sender_id != ? 
        AND (m.created_at > COALESCE(c.last_read_at, '1970-01-01'))
        AND (${accessCondition})
      `, session.role === 'CLIENT' || session.role === 'REPRESENTATIVE' || session.role === 'COUNTRY_MANAGER' 
         ? [userId, userId, userId, userId] 
         : [userId, userId]);
      
      return NextResponse.json({ unreadCount: countRes?.count || 0 });
    }

    return NextResponse.json({ unreadCount: 0 });
  } catch (err: any) {
    console.error('Failed to get unread count:', err);
    return NextResponse.json({ unreadCount: 0 });
  }
}
