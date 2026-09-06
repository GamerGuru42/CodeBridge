// src/app/api/representative/delete-account/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentSession, SESSION_COOKIE_NAME, recordAuditLog } from '@/lib/auth/session';
import { queryOne, execute } from '@/lib/db/connection';

export async function DELETE() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const userId = session.userId;

    // Fetch user details
    const user = await queryOne(`
      SELECT u.id, u.email, u.role, r.id as representative_id, r.referral_code
      FROM users u
      LEFT JOIN representatives r ON u.id = r.user_id
      WHERE u.id = ?
    `, [userId]);

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.role !== 'REPRESENTATIVE' && !user.representative_id) {
      return NextResponse.json({ error: 'Only Sales Representative accounts can be deleted through this endpoint.' }, { status: 403 });
    }

    const repId = user.representative_id;

    // Helper to safely execute cleanup queries without throwing on optional/missing auxiliary tables
    const safeExecute = async (sql: string, params: any[] = []) => {
      try {
        await execute(sql, params);
      } catch (err: any) {
        console.warn(`[delete-account] Warning during cleanup query: ${err?.message}`);
      }
    };

    // 1. Unlink commercial relations where representative is assigned
    if (repId) {
      await safeExecute('UPDATE clients SET representative_id = NULL WHERE representative_id = ?', [repId]);
      await safeExecute('UPDATE leads SET representative_id = NULL WHERE representative_id = ?', [repId]);
      await safeExecute('UPDATE projects SET representative_id = NULL WHERE representative_id = ?', [repId]);
      await safeExecute('UPDATE proposals SET representative_id = NULL WHERE representative_id = ?', [repId]);
      await safeExecute('UPDATE invoices SET representative_id = NULL WHERE representative_id = ?', [repId]);

      // 2. Remove commission ledger, events, and commission records for this representative
      await safeExecute('DELETE FROM commission_ledger WHERE representative_id = ?', [repId]);
      await safeExecute('DELETE FROM commission_events WHERE representative_id = ?', [repId]);
      await safeExecute('DELETE FROM commissions WHERE representative_id = ?', [repId]);

      // 3. Delete representative record
      await execute('DELETE FROM representatives WHERE id = ?', [repId]);
    }

    // 4. Clean up user references to prevent FK constraint failures
    await safeExecute('UPDATE audit_logs SET user_id = NULL WHERE user_id = ?', [userId]);
    await safeExecute('DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?', [userId, userId]);
    await safeExecute('DELETE FROM documents WHERE uploader_id = ?', [userId]);
    await safeExecute('DELETE FROM notifications WHERE user_id = ?', [userId]);
    await safeExecute('DELETE FROM message_read_cursors WHERE user_id = ?', [userId]);
    await safeExecute('DELETE FROM project_members WHERE user_id = ?', [userId]);

    // 5. Delete user profile and core user record
    await safeExecute('DELETE FROM user_profiles WHERE user_id = ?', [userId]);
    await execute('DELETE FROM users WHERE id = ?', [userId]);

    // 6. Record audit log of self-deletion
    await recordAuditLog({
      userId: null,
      action: 'REPRESENTATIVE_ACCOUNT_DELETED',
      entity: 'REPRESENTATIVE',
      entityId: repId || userId,
      metadata: { email: user.email, referralCode: user.referral_code },
    });

    // 7. Expire authentication session cookie
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: 'Your Sales Representative account has been permanently deleted.',
    });
  } catch (error: any) {
    console.error('Failed to delete representative account:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred while deleting your account. Please try again.' },
      { status: 500 }
    );
  }
}
