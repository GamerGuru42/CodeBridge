// src/lib/payments/refund.ts
import { DbExecutor, recordRefundLedgerEntry, recordCommissionReversalLedgerEntry, recordRecoveryReceivableLedgerEntry } from './ledger';
import { initiateFlutterwaveRefund } from './flutterwave';
import { query, queryOne, execute, transaction } from '@/lib/db/connection';

export interface ProcessRefundParams {
  paymentId: string;
  amountMinor?: number; // if omitted, full refund of remaining refundable amount
  reason?: string;
  adminUserId?: string;
}

export interface ProcessRefundResult {
  success: boolean;
  refundId: string;
  refundReference: string;
  refundAmountMinor: number;
  commissionReversalMinor: number;
  recoveryStatus: 'NONE' | 'RECOVERY_PENDING';
  status: string;
  message?: string;
}

/**
 * Authoritatively executes a full or partial refund for a client payment,
 * enforcing cumulative refund limits, double-entry ledger immutability,
 * proportional commission reversal, and recovery accounting if commission was already paid out.
 */
export async function executeClientRefund(
  params: ProcessRefundParams
): Promise<ProcessRefundResult> {
  // 1. Authoritative Payment and Invoice Lookup
  const payment = await queryOne<any>(`
    SELECT p.*, i.client_id, i.amount_minor as invoice_amount_minor, i.amount_paid_minor as invoice_paid_minor,
           i.representative_id as invoice_rep_id, i.currency as invoice_currency, i.invoice_number
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE p.id = ?
  `, [params.paymentId]);

  if (!payment) {
    throw new Error(`[Refund Error] Payment ${params.paymentId} not found.`);
  }

  if (payment.status !== 'CONFIRMED') {
    throw new Error(`[Refund Error] Cannot refund payment with status '${payment.status}'. Only CONFIRMED payments can be refunded.`);
  }

  const paymentAmountMinor = Number(payment.amount_minor);

  // 2. Cumulative Refund Enforcement
  const previousRefunds = await query<any>(`
    SELECT completed_amount_minor, amount_minor, status
    FROM refunds
    WHERE payment_id = ? AND status IN ('COMPLETED', 'PROCESSING', 'REQUESTED')
  `, [params.paymentId]);

  let cumulativeRefundedMinor = 0;
  for (const rf of previousRefunds) {
    cumulativeRefundedMinor += Number(rf.completed_amount_minor || rf.amount_minor);
  }

  const remainingRefundableMinor = Math.max(0, paymentAmountMinor - cumulativeRefundedMinor);

  if (remainingRefundableMinor <= 0) {
    throw new Error(`[Refund Error] Payment ${params.paymentId} has already been refunded in full.`);
  }

  const refundAmountMinor = params.amountMinor !== undefined
    ? Math.floor(params.amountMinor)
    : remainingRefundableMinor;

  if (refundAmountMinor <= 0) {
    throw new Error('[Refund Error] Refund amount must be greater than zero.');
  }

  if (refundAmountMinor > remainingRefundableMinor) {
    throw new Error(
      `[Refund Error] Requested refund (${refundAmountMinor / 100} ${payment.currency}) exceeds remaining refundable balance (${remainingRefundableMinor / 100} ${payment.currency}). Cumulative limit violation.`
    );
  }

  // 3. Proportional Commission Reversal Calculation
  let commissionReversalMinor = 0;
  let recoveryStatus: 'NONE' | 'RECOVERY_PENDING' = 'NONE';
  let targetRepId: string | null = null;
  let targetCommissionId: string | null = null;
  let isCommissionAlreadyPaid = false;

  const commissionEvent = await queryOne<any>(`
    SELECT ce.*, c.status as commission_status, c.id as commission_id, c.commission_amount_minor
    FROM commission_events ce
    LEFT JOIN commissions c ON c.id = REPLACE(ce.id, 'cev_', '') OR (c.project_id = ce.project_id AND c.representative_id = ce.representative_id)
    WHERE ce.payment_id = ? AND ce.status != 'CANCELLED'
    ORDER BY (CASE WHEN c.id = REPLACE(ce.id, 'cev_', '') THEN 0 ELSE 1 END), c.created_at DESC
    LIMIT 1
  `, [params.paymentId]);

  if (commissionEvent && commissionEvent.representative_id) {
    targetRepId = commissionEvent.representative_id;
    targetCommissionId = commissionEvent.commission_id;
    isCommissionAlreadyPaid = commissionEvent.commission_status === 'PAID';

    const originalCommMinor = Number(commissionEvent.calculated_commission_amount_minor);
    // Proportion of this payment being refunded
    const refundRatio = refundAmountMinor / paymentAmountMinor;
    commissionReversalMinor = Math.floor(originalCommMinor * Math.min(1, refundRatio));

    if (isCommissionAlreadyPaid) {
      recoveryStatus = 'RECOVERY_PENDING';
    }
  }

  const refundId = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const refundReference = `CB-REF-${payment.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}-${Date.now().toString().slice(-4)}`;

  // 4. Initiate with Flutterwave API (if gateway transaction exists)
  let flwResultStatus = 'COMPLETED';
  let providerRefundId: string | null = null;

  if (payment.gateway_transaction_id) {
    const majorAmount = refundAmountMinor / 100;
    const flwRes = await initiateFlutterwaveRefund({
      transactionId: payment.gateway_transaction_id,
      amount: majorAmount,
      comments: params.reason || `CodeBridge Refund on invoice ${payment.invoice_number}`,
    });

    providerRefundId = flwRes.refundId ? String(flwRes.refundId) : null;
    flwResultStatus = flwRes.status; // 'COMPLETED' or 'PROCESSING'
  }

  // 5. Atomic Financial Transaction: Record Refund, Adjust Commission & Post Ledger Entries
  await transaction(async (tx) => {
    // (a) Record Refund Operational Record
    await tx.execute(`
      INSERT INTO refunds (
        id, payment_id, invoice_id, project_id, client_id, sales_rep_id,
        currency, amount_minor, completed_amount_minor, commission_reversal_minor,
        status, refund_reference, provider_refund_id, reason, created_at, completed_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
    `, [
      refundId,
      payment.id,
      payment.invoice_id,
      payment.project_id,
      payment.client_id,
      targetRepId,
      payment.currency,
      refundAmountMinor,
      refundAmountMinor,
      commissionReversalMinor,
      flwResultStatus,
      refundReference,
      providerRefundId,
      params.reason || 'Client requested refund',
    ]);

    // (b) Post Double-Entry Refund Ledger Entry: Debit REFUND_EXPENSE, Credit BUSINESS_CASH
    await recordRefundLedgerEntry(tx, {
      refundId,
      paymentId: payment.id,
      invoiceId: payment.invoice_id,
      projectId: payment.project_id,
      clientId: payment.client_id,
      salesRepId: targetRepId,
      currency: payment.currency,
      amountMinor: refundAmountMinor,
      reference: refundReference,
      reason: params.reason,
    });

    // (c) Update Invoice Balance
    const previousInvoicePaid = Number(payment.invoice_paid_minor || 0);
    const newInvoicePaid = Math.max(0, previousInvoicePaid - refundAmountMinor);
    const newInvoiceStatus = newInvoicePaid <= 0 ? 'ISSUED' : 'PARTIALLY_PAID';

    await tx.execute(`
      UPDATE invoices
      SET amount_paid_minor = ?,
          status = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `, [newInvoicePaid, newInvoiceStatus, payment.invoice_id]);

    // (d) Handle Commission Reversal & Recovery
    if (commissionReversalMinor > 0 && targetRepId && targetCommissionId) {
      const adjustmentId = `adj_rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      await tx.execute(`
        INSERT INTO commission_adjustments (
          id, sales_rep_id, commission_id, refund_id, adjustment_type,
          currency, amount_minor, recovery_status, notes, created_at
        )
        VALUES (?, ?, ?, ?, 'REFUND_REVERSAL', ?, ?, ?, ?, datetime('now'))
      `, [
        adjustmentId,
        targetRepId,
        targetCommissionId,
        refundId,
        payment.currency,
        commissionReversalMinor,
        recoveryStatus,
        `Commission reversal on refund ${refundReference} (${recoveryStatus === 'RECOVERY_PENDING' ? 'Clawback recovery required' : 'Deducted before payout'})`,
      ]);

      if (isCommissionAlreadyPaid) {
        // Commission was already paid: Original payout ledger entry is NEVER edited.
        // Record Compensating Double-Entry: Debit RECOVERY_RECEIVABLE, Credit COMMISSION_EXPENSE
        await recordRecoveryReceivableLedgerEntry(tx, {
          salesRepId: targetRepId,
          refundId,
          paymentId: payment.id,
          invoiceId: payment.invoice_id,
          currency: payment.currency,
          amountMinor: commissionReversalMinor,
          reference: `REC-${refundReference}`,
          notes: `Recovery obligation created for commission already paid on refunded payment ${payment.id}`,
        });
      } else {
        // Commission was not yet paid: Reduce payable commission and ledger reversal
        await tx.execute(`
          UPDATE commissions
          SET commission_amount_minor = GREATEST(0, commission_amount_minor - ?),
              updated_at = datetime('now')
          WHERE id = ?
        `, [commissionReversalMinor, targetCommissionId]);

        // Double-Entry: Debit COMMISSION_PAYABLE, Credit COMMISSION_EXPENSE
        await recordCommissionReversalLedgerEntry(tx, {
          salesRepId: targetRepId,
          invoiceId: payment.invoice_id,
          paymentId: payment.id,
          refundId,
          currency: payment.currency,
          amountMinor: commissionReversalMinor,
          reference: `REV-${refundReference}`,
          notes: `Commission reversal on unpaid commission ${targetCommissionId}`,
        });
      }
    }
  });

  return {
    success: true,
    refundId,
    refundReference,
    refundAmountMinor,
    commissionReversalMinor,
    recoveryStatus,
    status: flwResultStatus,
  };
}
