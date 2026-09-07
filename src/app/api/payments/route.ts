// src/app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { query } from '@/lib/db/connection';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'COUNTRY_MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const payments = await query<any>(`
      SELECT p.*,
             i.invoice_number, i.title as invoice_title, i.codebridge_amount_minor, i.third_party_reimbursement_minor,
             c.company_name, co.code as country_code, co.name as country_name
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN clients c ON i.client_id = c.id
      JOIN countries co ON c.country_id = co.id
      ORDER BY p.created_at DESC
    `);

    // Calculate Authoritative Financial Metrics
    let grossCodeBridgeRevenueMinor = 0;
    let thirdPartyReimbursementsMinor = 0;
    let totalGatewayFeesMinor = 0;

    for (const p of payments) {
      if (['CONFIRMED', 'SUCCESSFUL'].includes(p.status)) {
        const codebridgeRev = p.codebridge_amount_minor != null ? Number(p.codebridge_amount_minor) : Number(p.amount_minor || 0);
        grossCodeBridgeRevenueMinor += codebridgeRev;
        thirdPartyReimbursementsMinor += Number(p.third_party_reimbursement_minor || 0);
        totalGatewayFeesMinor += Number(p.gateway_fee_minor || 0);
      }
    }

    const netCodeBridgeRevenueMinor = Math.max(0, grossCodeBridgeRevenueMinor - totalGatewayFeesMinor);

    return NextResponse.json({
      success: true,
      payments,
      summary: {
        grossCodeBridgeRevenueMinor,
        thirdPartyReimbursementsMinor,
        totalGatewayFeesMinor,
        netCodeBridgeRevenueMinor,
      },
    });
  } catch (err: any) {
    console.error('Failed to fetch payments:', err);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
