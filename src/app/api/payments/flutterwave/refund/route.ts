// src/app/api/payments/flutterwave/refund/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { executeClientRefund } from '@/lib/payments/refund';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can process refunds.' }, { status: 403 });
    }

    const body = await req.json();
    const { paymentId, amountMinor, reason } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required.' }, { status: 400 });
    }

    const result = await executeClientRefund({
      paymentId,
      amountMinor: amountMinor ? Number(amountMinor) : undefined,
      reason,
      adminUserId: session.userId,
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'PAYMENT_REFUNDED',
      entity: 'refunds',
      entityId: result.refundId,
      metadata: { paymentId, amountMinor: result.refundAmountMinor, reversalMinor: result.commissionReversalMinor, reason },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      ...result,
      message: 'Refund executed successfully and financial ledger updated.',
    });
  } catch (err: any) {
    console.error('[Refund API Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to process refund.' }, { status: 400 });
  }
}
