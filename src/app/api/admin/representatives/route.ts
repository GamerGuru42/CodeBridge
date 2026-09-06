// src/app/api/admin/representatives/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { query, queryOne, execute, transaction } from '@/lib/db/connection';
import { RepApprovalStatus } from '@/lib/db/types';

function generateReferralCode(): string {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'COUNTRY_MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reps = await query(`
      SELECT r.id, r.user_id, r.approval_status, r.commission_rate_bps,
             r.referral_code, r.approved_at, r.notes, r.created_at,
             u.email, u.status as user_status,
             p.first_name, p.last_name, p.phone,
             c.code as country_code, c.name as country_name, c.currency,
             (SELECT COUNT(*) FROM leads WHERE representative_id = r.id) as total_leads,
             (SELECT COUNT(*) FROM projects WHERE representative_id = r.id) as total_projects,
             (SELECT COALESCE(SUM(commission_amount_minor), 0) FROM commissions WHERE representative_id = r.id) as total_commission_minor
      FROM representatives r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      JOIN countries c ON r.country_id = c.id
      ORDER BY r.created_at DESC
    `);

    return NextResponse.json({ representatives: reps });
  } catch (err: any) {
    console.error('Failed to fetch representatives:', err);
    return NextResponse.json({ error: 'Failed to fetch representatives' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { representativeId, action, commissionRateBps, notes } = body;

    if (!representativeId || !action) {
      return NextResponse.json({ error: 'Representative ID and action are required.' }, { status: 400 });
    }

    const rep = await queryOne('SELECT * FROM representatives WHERE id = ?', [representativeId]);
    if (!rep) {
      return NextResponse.json({ error: 'Representative not found' }, { status: 404 });
    }

    let newStatus: RepApprovalStatus;
    let newReferralCode: string | null = rep.referral_code || null;

    if (action === 'APPROVE') {
      newStatus = 'ACTIVE';
      if (!newReferralCode) {
        newReferralCode = generateReferralCode();
      }
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
    } else if (action === 'SUSPEND') {
      newStatus = 'SUSPENDED';
    } else if (action === 'SET_RATE') {
      newStatus = rep.approval_status;
    } else {
      return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }

    const rateBps = commissionRateBps !== undefined ? Number(commissionRateBps) : rep.commission_rate_bps;

    await transaction(async (tx) => {
      await tx.execute(`
        UPDATE representatives
        SET approval_status = ?,
            commission_rate_bps = ?,
            referral_code = COALESCE(referral_code, ?),
            approved_at = CASE WHEN ? = 'ACTIVE' THEN datetime('now') ELSE approved_at END,
            approved_by = CASE WHEN ? = 'ACTIVE' THEN ? ELSE approved_by END,
            notes = COALESCE(?, notes),
            updated_at = datetime('now')
        WHERE id = ?
      `, [
        newStatus,
        rateBps,
        newReferralCode,
        newStatus,
        newStatus,
        session.userId,
        notes ?? null,
        representativeId
      ]);

      // Sync user status
      const targetUserStatus = newStatus === 'ACTIVE' ? 'ACTIVE' : (newStatus === 'REJECTED' ? 'REJECTED' : (newStatus === 'SUSPENDED' ? 'SUSPENDED' : 'PENDING'));
      await tx.execute(`
        UPDATE users
        SET status = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [targetUserStatus, rep.user_id]);
    });

    await recordAuditLog({
      userId: session.userId,
      action: `REPRESENTATIVE_${action}`,
      entity: 'representatives',
      entityId: representativeId,
      metadata: { newStatus, commissionRateBps: rateBps, previousStatus: rep.approval_status },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
    });

    return NextResponse.json({
      success: true,
      representativeId,
      approvalStatus: newStatus,
      commissionRateBps: rateBps,
      message: `Representative successfully updated to ${newStatus}.`
    });
  } catch (err: any) {
    console.error('Failed to update representative:', err);
    return NextResponse.json({ error: 'Failed to update representative' }, { status: 500 });
  }
}
