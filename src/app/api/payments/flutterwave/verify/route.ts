// src/app/api/payments/flutterwave/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { queryOne, execute, transaction } from '@/lib/db/connection';
import { verifyFlutterwaveTransaction } from '@/lib/payments/flutterwave';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Session required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoice_id');
    const txRef = searchParams.get('tx_ref');
    const transactionId = searchParams.get('transaction_id');

    if (!invoiceId && !txRef) {
      return NextResponse.json({ error: 'invoice_id or tx_ref is required.' }, { status: 400 });
    }

    // 1. Fetch Invoice
    let invoice = await queryOne<any>(
      'SELECT * FROM invoices WHERE id = ? OR invoice_number = ?',
      [invoiceId || '', invoiceId || '']
    );

    if (!invoice && txRef) {
      const paymentByRef = await queryOne<any>(
        'SELECT invoice_id FROM payments WHERE reference = ? OR gateway_reference = ?',
        [txRef, txRef]
      );
      if (paymentByRef) {
        invoice = await queryOne<any>('SELECT * FROM invoices WHERE id = ?', [paymentByRef.invoice_id]);
      }
    }

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    }

    // 2. Strict RBAC: Only client owner or admins can check status
    if (session.role === 'CLIENT') {
      const client = await queryOne<any>('SELECT id FROM clients WHERE user_id = ?', [session.userId]);
      if (!client || client.id !== invoice.client_id) {
        return NextResponse.json({ error: 'Forbidden: You do not own this invoice.' }, { status: 403 });
      }
    }

    // 3. Check Current DB State
    let payment = await queryOne<any>(
      'SELECT * FROM payments WHERE (invoice_id = ? AND status IN (\'CONFIRMED\', \'SUCCESSFUL\')) OR reference = ? OR gateway_reference = ? ORDER BY created_at DESC LIMIT 1',
      [invoice.id, txRef || '', txRef || '']
    );

    if (invoice.status === 'PAID' && payment && ['CONFIRMED', 'SUCCESSFUL'].includes(payment.status)) {
      return NextResponse.json({
        status: 'SUCCESSFUL',
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          amountMinor: invoice.amount_minor,
          currency: invoice.currency,
          status: invoice.status,
          paidAt: invoice.paid_at,
        },
        payment: {
          id: payment.id,
          reference: payment.reference,
          paymentMethod: payment.payment_method,
          gateway: payment.gateway,
          amountMinor: payment.amount_minor,
          currency: payment.currency,
          status: payment.status,
          settlementStatus: payment.settlement_status,
          settlementCurrency: payment.settlement_currency,
          settlementAmountMinor: payment.settlement_amount_minor,
        },
      });
    }

    // 4. If payment is still pending and transaction_id was returned from checkout redirect:
    if (transactionId) {
      try {
        const verifyResp = await verifyFlutterwaveTransaction(transactionId);
        if (verifyResp.status === 'success' && verifyResp.data && verifyResp.data.status === 'successful') {
          const vData = verifyResp.data;

          // Currency & amount integrity validation
          if (vData.currency.toUpperCase() === invoice.currency.toUpperCase()) {
            const verifiedAmountMinor = Math.round(Number(vData.amount) * 100);
            const unpaidRemaining = Number(invoice.amount_minor) - Number(invoice.amount_paid_minor || 0);

            if (verifiedAmountMinor > 0) {
              const currentPaidMinor = Number(invoice.amount_paid_minor || 0);
              const invoiceTotalMinor = Number(invoice.amount_minor);
              const newTotalPaidMinor = currentPaidMinor + verifiedAmountMinor;
              const isFullyPaid = newTotalPaidMinor >= invoiceTotalMinor;
              const newInvoiceStatus = isFullyPaid ? 'PAID' : 'PARTIALLY_PAID';

              const gatewayFeeMinor = Math.round(Number(vData.app_fee || 0) * 100);
              const netAmountMinor = vData.amount_settled
                ? Math.round(Number(vData.amount_settled) * 100)
                : Math.max(0, verifiedAmountMinor - gatewayFeeMinor);

              const settlementStatus = vData.amount_settled ? 'SETTLED' : 'PENDING';
              const settlementCurrency = vData.currency;
              const settlementAmountMinor = vData.amount_settled ? Math.round(Number(vData.amount_settled) * 100) : null;
              const paymentMethod = (vData.payment_type || (invoice.currency === 'KES' ? 'MPESA' : 'CARD')).toUpperCase();
              const now = new Date().toISOString();

              await transaction(async (tx) => {
                if (payment) {
                  await tx.execute(`
                    UPDATE payments
                    SET status = 'CONFIRMED',
                        gateway = 'flutterwave',
                        gateway_transaction_id = ?,
                        gateway_reference = ?,
                        payment_method = ?,
                        gross_amount_minor = ?,
                        gateway_fee_minor = ?,
                        net_amount_minor = ?,
                        settlement_status = ?,
                        settlement_currency = ?,
                        settlement_amount_minor = ?,
                        metadata_json = ?,
                        paid_at = ?,
                        verified_at = ?,
                        verified_by = ?
                    WHERE id = ?
                  `, [
                    String(transactionId),
                    vData.tx_ref,
                    paymentMethod,
                    verifiedAmountMinor,
                    gatewayFeeMinor,
                    netAmountMinor,
                    settlementStatus,
                    settlementCurrency,
                    settlementAmountMinor,
                    JSON.stringify(vData),
                    now,
                    now,
                    session.userId,
                    payment.id,
                  ]);
                } else {
                  const newPayId = `pay_flw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                  await tx.execute(`
                    INSERT INTO payments (
                      id, invoice_id, project_id, amount_minor, currency, payment_method,
                      verification_source, status, reference, gateway, gateway_transaction_id,
                      gateway_reference, gross_amount_minor, gateway_fee_minor, net_amount_minor,
                      settlement_status, settlement_currency, settlement_amount_minor,
                      metadata_json, paid_at, verified_at, verified_by, created_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, 'FLUTTERWAVE_WEBHOOK', 'CONFIRMED', ?, 'flutterwave', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                  `, [
                    newPayId,
                    invoice.id,
                    invoice.project_id,
                    verifiedAmountMinor,
                    invoice.currency,
                    paymentMethod,
                    vData.tx_ref,
                    String(transactionId),
                    vData.tx_ref,
                    verifiedAmountMinor,
                    gatewayFeeMinor,
                    netAmountMinor,
                    settlementStatus,
                    settlementCurrency,
                    settlementAmountMinor,
                    JSON.stringify(vData),
                    now,
                    now,
                    session.userId,
                  ]);
                }

                // Update invoice status and paid amount
                await tx.execute(`
                  UPDATE invoices
                  SET amount_paid_minor = ?,
                      status = ?,
                      paid_at = ?,
                      updated_at = datetime('now')
                  WHERE id = ?
                `, [
                  newTotalPaidMinor,
                  newInvoiceStatus,
                  isFullyPaid ? now : invoice.paid_at,
                  invoice.id,
                ]);

                // Payment schedule & project status
                if (invoice.payment_schedule_id) {
                  await tx.execute(`
                    UPDATE payment_schedules
                    SET status = ?, paid_at = ?, updated_at = datetime('now')
                    WHERE id = ?
                  `, [isFullyPaid ? 'PAID' : 'PARTIALLY_PAID', now, invoice.payment_schedule_id]);

                  const schedule = await tx.queryOne<any>('SELECT is_required_to_start FROM payment_schedules WHERE id = ?', [invoice.payment_schedule_id]);
                  if (schedule?.is_required_to_start === 1) {
                    await tx.execute(`
                      UPDATE projects
                      SET status = 'IN_PROGRESS', payment_status = ?, started_at = COALESCE(started_at, ?), updated_at = datetime('now')
                      WHERE id = ? AND status = 'AWAITING_PAYMENT'
                    `, [isFullyPaid ? 'PAID' : 'PARTIALLY_PAID', now, invoice.project_id]);
                  }
                } else if (isFullyPaid) {
                  await tx.execute(`
                    UPDATE projects
                    SET status = 'IN_PROGRESS', payment_status = 'PAID', started_at = COALESCE(started_at, ?), updated_at = datetime('now')
                    WHERE id = ? AND status = 'AWAITING_PAYMENT'
                  `, [now, invoice.project_id]);
                }
              });

              await recordAuditLog({
                userId: session.userId,
                action: 'PAYMENT_VERIFIED',
                entity: 'payments',
                entityId: payment?.id || invoice.id,
                metadata: {
                  invoiceId: invoice.id,
                  transactionId,
                  txRef: vData.tx_ref,
                  currency: invoice.currency,
                  verifiedAmountMinor,
                },
                ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
              });

              return NextResponse.json({
                status: 'SUCCESSFUL',
                message: 'Payment verified successfully.',
                invoice: {
                  id: invoice.id,
                  invoiceNumber: invoice.invoice_number,
                  amountMinor: invoice.amount_minor,
                  currency: invoice.currency,
                  status: 'PAID',
                  paidAt: now,
                },
              });
            }
          }
        } else if (verifyResp.data && ['failed', 'cancelled'].includes(verifyResp.data.status)) {
          if (payment) {
            await execute("UPDATE payments SET status = 'FAILED' WHERE id = ?", [payment.id]);
          }
          return NextResponse.json({
            status: 'FAILED',
            message: 'Payment was cancelled or rejected by the payment gateway.',
          });
        }
      } catch (err) {
        console.error('[Flutterwave Verify] Immediate verification error:', err);
      }
    }

    return NextResponse.json({
      status: 'PENDING',
      message: 'Payment confirmation is pending webhook arrival or gateway settlement.',
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        amountMinor: invoice.amount_minor,
        currency: invoice.currency,
        status: invoice.status,
      },
    });
  } catch (err: any) {
    console.error('Failed to verify payment status:', err);
    return NextResponse.json({ error: 'Failed to verify payment.' }, { status: 500 });
  }
}
