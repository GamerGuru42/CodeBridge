// src/app/api/payments/flutterwave/reconcile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, transaction } from '@/lib/db/connection';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { verifyFlutterwaveTransaction, verifyFlutterwaveByReference } from '@/lib/payments/flutterwave';
import { sendPaymentConfirmationNotification } from '@/lib/notifications/email';

/**
 * Webhook Failure Recovery & Polling Reconciliation Endpoint
 * Reconciles pending Flutterwave transactions by querying Flutterwave API.
 * Serverless & Vercel compatible: can be run as a cron job or triggered manually by admin.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const cronSecretHeader = req.headers.get('x-reconcile-secret') || req.headers.get('authorization');
    const isCronAuthorized = process.env.CRON_SECRET && cronSecretHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!session && !isCronAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Session or Cron secret required.' }, { status: 401 });
    }

    if (session && !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    // Optional specific parameters
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }
    const targetInvoiceId = body?.invoiceId;
    const targetPaymentId = body?.paymentId;

    let pendingPayments: any[] = [];
    if (targetPaymentId) {
      pendingPayments = await query<any>(
        'SELECT * FROM payments WHERE id = ? AND gateway = "flutterwave"',
        [targetPaymentId]
      );
    } else if (targetInvoiceId) {
      pendingPayments = await query<any>(
        'SELECT * FROM payments WHERE invoice_id = ? AND status = "PENDING" AND gateway = "flutterwave"',
        [targetInvoiceId]
      );
    } else {
      // Query pending payments created in the last 48 hours
      pendingPayments = await query<any>(
        `SELECT * FROM payments 
         WHERE status = 'PENDING' 
           AND gateway = 'flutterwave' 
           AND (reference IS NOT NULL OR gateway_reference IS NOT NULL OR gateway_transaction_id IS NOT NULL)
         ORDER BY created_at DESC 
         LIMIT 25`
      );
    }

    const results = {
      checked: pendingPayments.length,
      confirmed: 0,
      failed: 0,
      stillPending: 0,
      details: [] as any[],
    };

    for (const payment of pendingPayments) {
      try {
        let verifyResp: any = null;
        if (payment.gateway_transaction_id) {
          verifyResp = await verifyFlutterwaveTransaction(payment.gateway_transaction_id);
        } else if (payment.gateway_reference || payment.reference) {
          verifyResp = await verifyFlutterwaveByReference(payment.gateway_reference || payment.reference);
        }

        if (!verifyResp || verifyResp.status !== 'success' || !verifyResp.data) {
          results.stillPending++;
          results.details.push({ paymentId: payment.id, status: 'PENDING', note: 'No authoritative gateway record yet' });
          continue;
        }

        const vData = verifyResp.data;
        const invoice = await queryOne<any>('SELECT * FROM invoices WHERE id = ?', [payment.invoice_id]);
        if (!invoice) {
          results.details.push({ paymentId: payment.id, status: 'SKIPPED', note: 'Invoice not found' });
          continue;
        }

        if (vData.status === 'successful') {
          // Check currency match
          if (vData.currency.toUpperCase() !== invoice.currency.toUpperCase()) {
            results.details.push({ paymentId: payment.id, status: 'ERROR', note: 'Currency mismatch' });
            continue;
          }

          const verifiedAmountMinor = Math.round(Number(vData.amount) * 100);
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
            // Confirm payment record
            await tx.execute(`
              UPDATE payments
              SET status = 'CONFIRMED',
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
                  verified_by = 'system_reconciler',
                  verification_notes = 'Reconciled authoritatively via Flutterwave Reconciler'
              WHERE id = ?
            `, [
              String(vData.id),
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
              payment.id,
            ]);

            // Update invoice
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

            // Progress project if required
            if (isFullyPaid) {
              const project = await tx.queryOne<any>('SELECT status FROM projects WHERE id = ?', [invoice.project_id]);
              if (project?.status === 'AWAITING_PAYMENT') {
                await tx.execute(`
                  UPDATE projects
                  SET status = 'IN_PROGRESS',
                      payment_status = 'PAID',
                      started_at = COALESCE(started_at, ?),
                      updated_at = datetime('now')
                  WHERE id = ?
                `, [now, invoice.project_id]);
              }
            }
          });

          // Dispatch notification safely
          try {
            const client = await queryOne<any>(`
              SELECT c.company_name, u.id as user_id, u.email, up.first_name, up.last_name
              FROM clients c
              JOIN users u ON c.user_id = u.id
              LEFT JOIN user_profiles up ON u.id = up.user_id
              WHERE c.id = ?
            `, [invoice.client_id]);

            if (client?.email) {
              const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.company_name;
              await sendPaymentConfirmationNotification({
                recipientEmail: client.email,
                recipientName: clientName,
                recipientUserId: client.user_id,
                invoiceNumber: invoice.invoice_number,
                invoiceTitle: invoice.title,
                amountMinor: verifiedAmountMinor,
                currency: invoice.currency,
                paymentMethod,
                transactionReference: vData.tx_ref,
                paidAt: now,
                isFullPayment: isFullyPaid,
                remainingMinor: Math.max(0, invoiceTotalMinor - newTotalPaidMinor),
              });
            }
          } catch (notifErr: any) {
            console.error('[Reconciler] Notification error (non-fatal):', notifErr.message);
          }

          results.confirmed++;
          results.details.push({ paymentId: payment.id, status: 'CONFIRMED', invoiceId: invoice.id, invoiceStatus: newInvoiceStatus });
        } else if (['failed', 'cancelled'].includes(vData.status)) {
          await queryOne('UPDATE payments SET status = "FAILED", verification_notes = ? WHERE id = ?', [
            `Gateway reported ${vData.status}`,
            payment.id,
          ]);
          results.failed++;
          results.details.push({ paymentId: payment.id, status: 'FAILED' });
        } else {
          results.stillPending++;
          results.details.push({ paymentId: payment.id, status: 'PENDING' });
        }
      } catch (itemErr: any) {
        console.error(`[Reconciler] Error processing payment ${payment.id}:`, itemErr.message);
        results.details.push({ paymentId: payment.id, status: 'ERROR', error: itemErr.message });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Reconciler] Fatal error:', err);
    return NextResponse.json({ error: 'Reconciliation error: ' + err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
