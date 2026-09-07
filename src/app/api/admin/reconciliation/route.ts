// src/app/api/admin/reconciliation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { query, queryOne, execute } from '@/lib/db/connection';
import { reconcileOperationalWithLedger } from '@/lib/payments/reconciliation';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const db = { query, queryOne, execute };
    const result = await reconcileOperationalWithLedger(db);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Reconciliation error:', err);
    return NextResponse.json({ error: 'Failed to run reconciliation audit.' }, { status: 500 });
  }
}
