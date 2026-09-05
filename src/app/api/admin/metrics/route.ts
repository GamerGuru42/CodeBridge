// src/app/api/admin/metrics/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { query, queryOne } from '@/lib/db/connection';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientCount = (await queryOne('SELECT COUNT(*) as count FROM clients'))?.count || 0;
    const totalReps = (await queryOne('SELECT COUNT(*) as count FROM representatives'))?.count || 0;
    const activeReps = (await queryOne("SELECT COUNT(*) as count FROM representatives WHERE approval_status = 'ACTIVE'"))?.count || 0;
    const pendingReps = (await queryOne("SELECT COUNT(*) as count FROM representatives WHERE approval_status = 'PENDING'"))?.count || 0;
    const totalLeads = (await queryOne('SELECT COUNT(*) as count FROM leads'))?.count || 0;
    const activeProjects = (await queryOne("SELECT COUNT(*) as count FROM projects WHERE status NOT IN ('COMPLETED', 'DRAFT')"))?.count || 0;

    // Pipeline breakdown
    const pipeline = await query(`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
    `);

    // Countries
    const countries = await query(`
      SELECT c.code, c.name, c.currency,
             (SELECT COUNT(*) FROM clients WHERE country_id = c.id) as client_count,
             (SELECT COUNT(*) FROM representatives WHERE country_id = c.id) as rep_count,
             (SELECT COUNT(*) FROM leads WHERE country_id = c.id) as lead_count
      FROM countries c
      WHERE c.is_active = 1
    `);

    // Modeled Commissions (Integer minor units, no fake money movement)
    const commissionsKES = (await queryOne(`
      SELECT COALESCE(SUM(commission_amount_minor), 0) as total
      FROM commissions
      WHERE currency = 'KES'
    `))?.total || 0;

    const commissionsNGN = (await queryOne(`
      SELECT COALESCE(SUM(commission_amount_minor), 0) as total
      FROM commissions
      WHERE currency = 'NGN'
    `))?.total || 0;

    // Commercial Proposals Metrics (Strictly isolated by currency)
    const totalProposals = (await queryOne('SELECT COUNT(*) as count FROM proposals WHERE is_current = 1'))?.count || 0;
    const approvedProposals = (await queryOne("SELECT COUNT(*) as count FROM proposals WHERE is_current = 1 AND status = 'CLIENT_APPROVED'"))?.count || 0;
    const proposalsKES_minor = (await queryOne(`
      SELECT COALESCE(SUM(total_amount_minor), 0) as total
      FROM proposals
      WHERE is_current = 1 AND status = 'CLIENT_APPROVED' AND currency = 'KES'
    `))?.total || 0;
    const proposalsNGN_minor = (await queryOne(`
      SELECT COALESCE(SUM(total_amount_minor), 0) as total
      FROM proposals
      WHERE is_current = 1 AND status = 'CLIENT_APPROVED' AND currency = 'NGN'
    `))?.total || 0;

    // Phase 2B Commercial Billing & Receivables Metrics (Strictly isolated by currency)
    const totalInvoices = (await queryOne('SELECT COUNT(*) as count FROM invoices'))?.count || 0;
    const paidInvoices = (await queryOne("SELECT COUNT(*) as count FROM invoices WHERE status = 'PAID'"))?.count || 0;

    const invoicedKES_minor = (await queryOne("SELECT COALESCE(SUM(amount_minor), 0) as total FROM invoices WHERE currency = 'KES' AND status != 'CANCELLED'"))?.total || 0;
    const invoicedNGN_minor = (await queryOne("SELECT COALESCE(SUM(amount_minor), 0) as total FROM invoices WHERE currency = 'NGN' AND status != 'CANCELLED'"))?.total || 0;

    const verifiedPaidKES_minor = (await queryOne("SELECT COALESCE(SUM(amount_paid_minor), 0) as total FROM invoices WHERE currency = 'KES'"))?.total || 0;
    const verifiedPaidNGN_minor = (await queryOne("SELECT COALESCE(SUM(amount_paid_minor), 0) as total FROM invoices WHERE currency = 'NGN'"))?.total || 0;

    const receivablesKES_minor = Math.max(0, invoicedKES_minor - verifiedPaidKES_minor);
    const receivablesNGN_minor = Math.max(0, invoicedNGN_minor - verifiedPaidNGN_minor);

    const commissionEventsCount = (await queryOne('SELECT COUNT(*) as count FROM commission_events'))?.count || 0;

    // Recent Audit Logs
    const recentAuditLogs = await query(`
      SELECT a.*, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    return NextResponse.json({
      overview: {
        totalClients: clientCount,
        totalReps,
        activeReps,
        pendingReps,
        totalLeads,
        activeProjects,
        proposals: {
          total: totalProposals,
          approved: approvedProposals,
          approvedKES_minor: proposalsKES_minor,
          approvedNGN_minor: proposalsNGN_minor,
        },
        billing: {
          totalInvoices,
          paidInvoices,
          invoicedKES_minor,
          invoicedNGN_minor,
          verifiedPaidKES_minor,
          verifiedPaidNGN_minor,
          receivablesKES_minor,
          receivablesNGN_minor,
          commissionEventsCount,
        },
        commissionsModeled: {
          KES_minor: commissionsKES,
          NGN_minor: commissionsNGN,
        },
      },
      pipeline,
      countries,
      recentAuditLogs,
    });
  } catch (err: any) {
    console.error('Failed to fetch admin metrics:', err);
    return NextResponse.json({ error: 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
