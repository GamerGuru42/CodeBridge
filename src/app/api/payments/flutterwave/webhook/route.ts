// src/app/api/payments/flutterwave/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, transaction } from '@/lib/db/connection';
import { recordAuditLog } from '@/lib/auth/session';
import { verifyWebhookSignature, verifyFlutterwaveTransaction } from '@/lib/payments/flutterwave';
import { sendPaymentConfirmationNotification } from '@/lib/notifications/email';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const verifHash = req.headers.get('verif-hash');
    const flutterwaveSignature = req.headers.get('flutterwave-signature');

    // 1. Authenticate / Validate Webhook Signature (Dual Mechanism: verif-hash OR flutterwave-signature HMAC)
    const isSignatureValid = verifyWebhookSignature(
      { verifHash, flutterwaveSignature },
      rawBody
    );

    if (!isSignatureValid) {
      console.warn('[Flutterwave Webhook] Unauthorized request: Neither verif-hash nor flutterwave-signature matched.');
      return NextResponse.json(
        { error: 'Webhook signature validation failed.' },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { event, data } = payload;
    console.log(`[Flutterwave Webhook] Authenticated event: '${event}', tx_ref: '${data?.tx_ref}', id: ${data?.id}`);

    // If event is not charge completed, acknowledge without state change
    if (event !== 'charge.completed' && data?.status !== 'successful') {
      return NextResponse.json({ message: 'Event acknowledged (non-charge event).' }, { status: 200 });
    }

    const transactionId = data?.id;
    const txRef = data?.tx_ref;

    if (!transactionId || !txRef) {
      return NextResponse.json({ error: 'Missing transaction id or tx_ref in webhook payload.' }, { status: 400 });
    }

    // 2. Authoritatively Verify Transaction with Flutterwave API (Never trust raw webhook data alone)
    const verificationResponse = await verifyFlutterwaveTransaction(transactionId);
    if (verificationResponse.status !== 'success' || !verificationResponse.data) {
      console.error('[Flutterwave Webhook] API transaction verification failed:', verificationResponse);
      return NextResponse.json({ error: 'Authoritative transaction verification failed.' }, { status: 400 });
    }

    const verifyData = verificationResponse.data;

    if (verifyData.status !== 'successful') {
      console.warn(`[Flutterwave Webhook] Transaction ${transactionId} status is '${verifyData.status}', not 'successful'.`);
      return NextResponse.json({ message: 'Transaction not successful. No action taken.' }, { status: 200 });
    }

    // 3. Locate Associated Payment / Invoice by tx_ref
    const existingPayment = await queryOne<any>(
      'SELECT * FROM payments WHERE reference = ? OR gateway_reference = ? OR gateway_transaction_id = ?',
      [txRef, txRef, String(transactionId)]
    );

    let invoiceId = existingPayment?.invoice_id;
    if (!invoiceId && verifyData.flw_ref) {
      const metaInvoiceId = payload.data?.meta?.invoice_id || payload.meta?.invoice_id;
      if (metaInvoiceId) invoiceId = metaInvoiceId;
    }

    if (!invoiceId) {
      const parts = txRef.split('-');
      if (parts.length >= 2) {
        const potentialInvoiceId = `inv_${parts[1]}`;
        const inv = await queryOne<any>('SELECT id FROM invoices WHERE id = ? OR id LIKE ?', [potentialInvoiceId, `%${parts[1]}%`]);
        if (inv) invoiceId = inv.id;
      }
    }

    if (!invoiceId) {
      console.error(`[Flutterwave Webhook] Could not associate tx_ref '${txRef}' with any known invoice.`);
      return NextResponse.json({ error: 'Associated invoice could not be located.' }, { status: 404 });
    }

    const invoice = await queryOne<any>('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    }

    // 4. Idempotency Protection: If already confirmed/paid, return HTTP 200 immediately
    if (existingPayment && ['CONFIRMED', 'SUCCESSFUL'].includes(existingPayment.status)) {
      console.log(`[Flutterwave Webhook] Idempotent skip: Transaction ${transactionId} (tx_ref: ${txRef}) is already confirmed.`);
      return NextResponse.json({ status: 'already_processed', message: 'Payment previously verified.' }, { status: 200 });
    }

    if (invoice.status === 'PAID') {
      console.log(`[Flutterwave Webhook] Idempotent skip: Invoice ${invoice.invoice_number} is already paid in full.`);
      return NextResponse.json({ status: 'already_processed', message: 'Invoice already marked PAID.' }, { status: 200 });
    }

    // 5. Verification Integrity Checks: Currency & Amount Matching
    if (verifyData.currency.toUpperCase() !== invoice.currency.toUpperCase()) {
      console.error(`[Flutterwave Webhook] Currency mismatch: Invoice expects ${invoice.currency}, Flutterwave transaction was ${verifyData.currency}`);
      return NextResponse.json({
        error: `Currency mismatch: Expected ${invoice.currency}, received ${verifyData.currency}.`,
      }, { status: 400 });
    }

    // Amount validation in integer minor units
    const verifiedAmountMinor = Math.round(Number(verifyData.amount) * 100);
    if (verifiedAmountMinor <= 0) {
      return NextResponse.json({ error: 'Invalid transaction amount.' }, { status: 400 });
    }

    const invoiceTotalMinor = Number(invoice.amount_minor);
    const previousPaidMinor = Number(invoice.amount_paid_minor || 0);
    const unpaidOutstandingMinor = invoiceTotalMinor - previousPaidMinor;

    // Reject overpayments safely
    if (verifiedAmountMinor > unpaidOutstandingMinor) {
      console.error(`[Flutterwave Webhook] Overpayment rejected: Paid amount (${verifiedAmountMinor} minor) exceeds remaining balance (${unpaidOutstandingMinor} minor) for invoice ${invoice.id}.`);
      return NextResponse.json({
        error: `Overpayment violation: Paid amount exceeds outstanding balance. Expected at most ${unpaidOutstandingMinor / 100} ${invoice.currency}.`,
      }, { status: 400 });
    }

    const newTotalPaidMinor = previousPaidMinor + verifiedAmountMinor;
    const remainingAfterThisMinor = Math.max(0, invoiceTotalMinor - newTotalPaidMinor);
    const isFullyPaid = newTotalPaidMinor >= invoiceTotalMinor;
    const newInvoiceStatus = isFullyPaid ? 'PAID' : 'PARTIALLY_PAID';

    // Gateway Fee and Settlement calculations (From Authoritative Flutterwave Response)
    const gatewayFeeMinor = Math.round(Number(verifyData.app_fee || 0) * 100);
    const netAmountMinor = verifyData.amount_settled
      ? Math.round(Number(verifyData.amount_settled) * 100)
      : Math.max(0, verifiedAmountMinor - gatewayFeeMinor);

    const settlementStatus = verifyData.amount_settled ? 'SETTLED' : 'PENDING';
    const settlementCurrency = verifyData.currency;
    const settlementAmountMinor = verifyData.amount_settled ? Math.round(Number(verifyData.amount_settled) * 100) : null;

    // Authoritative Payment Method mapping
    let paymentMethod = 'FLUTTERWAVE';
    if (verifyData.payment_type) {
      const pt = verifyData.payment_type.toLowerCase();
      if (pt.includes('mpesa') || pt.includes('mobilemoney')) {
        paymentMethod = 'MPESA';
      } else if (pt.includes('card')) {
        paymentMethod = 'CARD';
      } else if (pt.includes('bank') || pt.includes('transfer')) {
        paymentMethod = 'BANK_TRANSFER';
      } else if (pt.includes('ussd')) {
        paymentMethod = 'USSD';
      } else {
        paymentMethod = verifyData.payment_type.toUpperCase();
      }
    } else if (invoice.currency === 'KES') {
      paymentMethod = 'MPESA';
    } else {
      paymentMethod = 'CARD';
    }

    const paymentId = existingPayment?.id || `pay_flw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    // 6. Atomic Database State Transition
    await transaction(async (tx) => {
      // (a) Upsert confirmed Payment record
      if (existingPayment) {
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
              settlement_destination = 'Configured Flutterwave Merchant Settlement',
              metadata_json = ?,
              paid_at = ?,
              verified_at = ?,
              verified_by = 'system_flutterwave',
              verification_notes = 'Verified authoritatively via Flutterwave Webhook'
          WHERE id = ?
        `, [
          String(transactionId),
          txRef,
          paymentMethod,
          verifiedAmountMinor,
          gatewayFeeMinor,
          netAmountMinor,
          settlementStatus,
          settlementCurrency,
          settlementAmountMinor,
          JSON.stringify(verifyData),
          now,
          now,
          existingPayment.id,
        ]);
      } else {
        await tx.execute(`
          INSERT INTO payments (
            id, invoice_id, project_id, amount_minor, currency, payment_method,
            verification_source, status, reference, gateway, gateway_transaction_id,
            gateway_reference, gross_amount_minor, gateway_fee_minor, net_amount_minor,
            settlement_status, settlement_currency, settlement_amount_minor,
            settlement_destination, metadata_json, paid_at, verified_at, verified_by,
            verification_notes, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, 'FLUTTERWAVE_WEBHOOK', 'CONFIRMED', ?, 'flutterwave', ?, ?, ?, ?, ?, ?, ?, ?, 'Configured Flutterwave Merchant Settlement', ?, ?, ?, 'system_flutterwave', 'Verified authoritatively via Flutterwave Webhook', datetime('now'))
        `, [
          paymentId,
          invoice.id,
          invoice.project_id,
          verifiedAmountMinor,
          invoice.currency,
          paymentMethod,
          txRef,
          String(transactionId),
          txRef,
          verifiedAmountMinor,
          gatewayFeeMinor,
          netAmountMinor,
          settlementStatus,
          settlementCurrency,
          settlementAmountMinor,
          JSON.stringify(verifyData),
          now,
          now,
        ]);
      }

      // (b) Update Invoice Balance and Status (PAID or PARTIALLY_PAID)
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

      // (c) Update Payment Schedule & Project Automation
      if (invoice.payment_schedule_id) {
        await tx.execute(`
          UPDATE payment_schedules
          SET status = ?,
              paid_at = ?,
              updated_at = datetime('now')
          WHERE id = ?
        `, [isFullyPaid ? 'PAID' : 'PARTIALLY_PAID', now, invoice.payment_schedule_id]);

        const schedule = await tx.queryOne<any>('SELECT is_required_to_start FROM payment_schedules WHERE id = ?', [invoice.payment_schedule_id]);
        if (schedule?.is_required_to_start === 1) {
          const project = await tx.queryOne<any>('SELECT status FROM projects WHERE id = ?', [invoice.project_id]);
          if (project?.status === 'AWAITING_PAYMENT') {
            await tx.execute(`
              UPDATE projects
              SET status = 'IN_PROGRESS',
                  payment_status = ?,
                  started_at = COALESCE(started_at, ?),
                  updated_at = datetime('now')
              WHERE id = ?
            `, [isFullyPaid ? 'PAID' : 'PARTIALLY_PAID', now, invoice.project_id]);
          }
        }
      } else if (isFullyPaid) {
        // Direct project advance if project was awaiting payment
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

      // (d) Partner Commission Calculation (Strictly on CodeBridge Service Revenue, Excluding Third-Party Fees!)
      const project = await tx.queryOne<any>('SELECT representative_id FROM projects WHERE id = ?', [invoice.project_id]);
      const repId = project?.representative_id || invoice.representative_id;

      if (repId) {
        const rep = await tx.queryOne<any>('SELECT commission_rate_bps FROM representatives WHERE id = ?', [repId]);
        const commissionRateBps = Number(rep?.commission_rate_bps || 2000); // 20.00% default

        // Commission is calculated strictly from CodeBridge Service Revenue, not third-party reimbursements
        const codebridgeRevenueMinor = Number(invoice.codebridge_service_total_minor || invoice.amount_minor);
        // Prorate commission if partial payment
        const paymentRatio = verifiedAmountMinor / invoiceTotalMinor;
        const eligibleMinorForThisPayment = Math.round(codebridgeRevenueMinor * Math.min(1, paymentRatio));
        const calculatedCommissionMinor = Math.floor((eligibleMinorForThisPayment * commissionRateBps) / 10000);

        const idempotencyKey = `COMMISSION_FLW_${transactionId}`;
        const existingCommissionEvent = await tx.queryOne<any>('SELECT id FROM commission_events WHERE idempotency_key = ?', [idempotencyKey]);

        if (!existingCommissionEvent && calculatedCommissionMinor > 0) {
          const commissionEventId = `cev_flw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          await tx.execute(`
            INSERT INTO commission_events (
              id, payment_id, invoice_id, project_id, proposal_id, representative_id,
              currency, verified_amount_minor, commission_rate_bps_at_time_of_payment,
              calculated_commission_amount_minor, verified_at, idempotency_key, status, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECORDED', datetime('now'))
          `, [
            commissionEventId,
            paymentId,
            invoice.id,
            invoice.project_id,
            invoice.proposal_id || null,
            repId,
            invoice.currency,
            eligibleMinorForThisPayment,
            commissionRateBps,
            calculatedCommissionMinor,
            now,
            idempotencyKey,
          ]);
        }
      }
    });

    // 7. Audit Logging
    await recordAuditLog({
      userId: 'system_flutterwave',
      action: 'PAYMENT_VERIFIED',
      entity: 'payments',
      entityId: paymentId,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        transactionId,
        txRef,
        verifiedAmountMinor,
        currency: invoice.currency,
        settlementStatus,
        paymentMethod,
        isFullyPaid,
        source: 'FLUTTERWAVE_WEBHOOK',
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    if (isFullyPaid) {
      await recordAuditLog({
        userId: 'system_flutterwave',
        action: 'INVOICE_MARKED_PAID',
        entity: 'invoices',
        entityId: invoice.id,
        metadata: {
          invoiceNumber: invoice.invoice_number,
          paymentId,
          amountPaidMinor: newTotalPaidMinor,
          currency: invoice.currency,
        },
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
    }

    // 8. Automated Non-blocking Email and In-App Notification Dispatch
    try {
      const client = await queryOne<any>(`
        SELECT c.id, c.company_name, u.id as user_id, u.email, up.first_name, up.last_name
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
          transactionReference: txRef,
          paidAt: now,
          isFullPayment: isFullyPaid,
          remainingMinor: remainingAfterThisMinor,
        });
      }
    } catch (notifErr: any) {
      // Notification errors are logged but MUST NOT disrupt confirmed payment
      console.error('[Flutterwave Webhook] Notification dispatch error (non-fatal):', notifErr.message);
    }

    console.log(`[Flutterwave Webhook] Successfully processed payment for invoice ${invoice.invoice_number}: ${invoice.currency} ${verifiedAmountMinor / 100} (${newInvoiceStatus}).`);
    return NextResponse.json({
      status: 'success',
      message: `Payment verified. Invoice status is now ${newInvoiceStatus}.`,
      invoiceStatus: newInvoiceStatus,
      amountPaidMinor: newTotalPaidMinor,
      remainingMinor: remainingAfterThisMinor,
    }, { status: 200 });
  } catch (err: any) {
    console.error('[Flutterwave Webhook] Fatal processing error:', err);
    return NextResponse.json({ error: 'Webhook processing error.' }, { status: 500 });
  }
}
