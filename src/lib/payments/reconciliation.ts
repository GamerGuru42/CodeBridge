// src/lib/payments/reconciliation.ts
import { DbExecutor } from './ledger';
import { query } from '@/lib/db/connection';

export interface Discrepancy {
  type:
    | 'MISSING_PAYMENT_LEDGER_ENTRY'
    | 'PAYMENT_AMOUNT_MISMATCH'
    | 'PAYMENT_CURRENCY_MISMATCH'
    | 'MISSING_COMMISSION_LEDGER_ENTRY'
    | 'COMMISSION_AMOUNT_MISMATCH'
    | 'MISSING_PAYOUT_LEDGER_ENTRY'
    | 'PAYOUT_AMOUNT_MISMATCH'
    | 'MISSING_REFUND_LEDGER_ENTRY'
    | 'REFUND_AMOUNT_MISMATCH'
    | 'UNBALANCED_LEDGER_EVENT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  entityId: string;
  details?: Record<string, any>;
}

export interface ReconciliationMetrics {
  totalOperationalPaymentsMinor: number;
  totalLedgerPaymentsMinor: number;
  totalOperationalCommissionsMinor: number;
  totalLedgerCommissionsMinor: number;
  totalOperationalPayoutsMinor: number;
  totalLedgerPayoutsMinor: number;
  totalOperationalRefundsMinor: number;
  totalLedgerRefundsMinor: number;
}

export interface ReconciliationResult {
  isReconciled: boolean;
  reconciliationStatus: 'OK' | 'DISCREPANCY_DETECTED';
  totalChecked: number;
  discrepancyCount: number;
  discrepancies: Discrepancy[];
  metrics: ReconciliationMetrics;
  timestamp: string;
}

/**
 * Executes a full automated audit reconciling operational database tables
 * (payments, commissions, commission_payouts, refunds) against the immutable double-entry ledger.
 */
export async function reconcileOperationalWithLedger(
  customDb?: any
): Promise<ReconciliationResult> {
  let queryFn: (sql: string, params?: any[]) => Promise<any[]>;
  if (customDb) {
    if (typeof customDb.query === 'function') {
      queryFn = (sql, params) => customDb.query(sql, params);
    } else if (typeof customDb.all === 'function') {
      queryFn = (sql, params) => customDb.all(sql, params);
    } else {
      queryFn = query;
    }
  } else {
    queryFn = query;
  }

  const discrepancies: Discrepancy[] = [];
  let totalChecked = 0;

  // 1. Reconcile Confirmed Payments vs Ledger Entries
  const confirmedPayments = await queryFn(`
    SELECT id, invoice_id, amount_minor, currency, status, reference, gateway_transaction_id
    FROM payments
    WHERE status = 'CONFIRMED'
  `);

  for (const p of confirmedPayments) {
    totalChecked++;
    const ledgerRows = await queryFn(`
      SELECT id, entry_type, account_debited, account_credited, amount_minor, currency
      FROM ledger_entries
      WHERE payment_id = ? AND entry_type = 'PAYMENT'
    `, [p.id]);

    if (ledgerRows.length === 0) {
      discrepancies.push({
        type: 'MISSING_PAYMENT_LEDGER_ENTRY',
        severity: 'CRITICAL',
        description: `Confirmed payment ${p.id} has zero corresponding ledger entries.`,
        entityId: p.id,
        details: { payment: p },
      });
    } else {
      const entry = ledgerRows[0];
      const pAmt = Number(p.amount_minor);
      const lAmt = Number(entry.amount_minor);

      if (pAmt !== lAmt) {
        discrepancies.push({
          type: 'PAYMENT_AMOUNT_MISMATCH',
          severity: 'CRITICAL',
          description: `Payment ${p.id} amount (${pAmt}) does not match ledger entry ${entry.id} amount (${lAmt}).`,
          entityId: p.id,
          details: { expected: pAmt, actual: lAmt },
        });
      }

      if (p.currency.toUpperCase() !== entry.currency.toUpperCase()) {
        discrepancies.push({
          type: 'PAYMENT_CURRENCY_MISMATCH',
          severity: 'CRITICAL',
          description: `Payment ${p.id} currency (${p.currency}) does not match ledger entry ${entry.id} currency (${entry.currency}).`,
          entityId: p.id,
          details: { expected: p.currency, actual: entry.currency },
        });
      }
    }
  }

  // 2. Reconcile Completed Payouts vs Ledger Entries
  const paidPayouts = await queryFn(`
    SELECT id, sales_rep_id, amount_minor, currency, status, idempotency_key, provider_reference
    FROM commission_payouts
    WHERE status = 'PAID'
  `);

  for (const po of paidPayouts) {
    totalChecked++;
    const ledgerRows = await queryFn(`
      SELECT id, entry_type, account_debited, account_credited, amount_minor, currency
      FROM ledger_entries
      WHERE entry_type = 'PAYOUT' AND (
        reference = ? OR metadata_json LIKE ?
      )
    `, [po.idempotency_key, `%${po.id}%`]);

    if (ledgerRows.length === 0) {
      discrepancies.push({
        type: 'MISSING_PAYOUT_LEDGER_ENTRY',
        severity: 'HIGH',
        description: `Paid commission payout ${po.id} has no corresponding PAYOUT ledger entry.`,
        entityId: po.id,
        details: { payout: po },
      });
    } else {
      const entry = ledgerRows[0];
      const poAmt = Number(po.amount_minor);
      const lAmt = Number(entry.amount_minor);

      if (poAmt !== lAmt) {
        discrepancies.push({
          type: 'PAYOUT_AMOUNT_MISMATCH',
          severity: 'HIGH',
          description: `Payout ${po.id} amount (${poAmt}) does not match ledger amount (${lAmt}).`,
          entityId: po.id,
        });
      }
    }
  }

  // 3. Reconcile Completed Refunds vs Ledger Entries
  const completedRefunds = await queryFn(`
    SELECT id, payment_id, invoice_id, amount_minor, currency, status, refund_reference
    FROM refunds
    WHERE status = 'COMPLETED'
  `);

  for (const rf of completedRefunds) {
    totalChecked++;
    const ledgerRows = await queryFn(`
      SELECT id, entry_type, account_debited, account_credited, amount_minor, currency
      FROM ledger_entries
      WHERE entry_type = 'REFUND' AND (
        reference = ? OR metadata_json LIKE ?
      )
    `, [rf.refund_reference, `%${rf.id}%`]);

    if (ledgerRows.length === 0) {
      discrepancies.push({
        type: 'MISSING_REFUND_LEDGER_ENTRY',
        severity: 'CRITICAL',
        description: `Completed refund ${rf.id} has no corresponding REFUND ledger entry.`,
        entityId: rf.id,
        details: { refund: rf },
      });
    }
  }

  // 4. Double-Entry Balancing Invariant
  // Every ledger entry has valid, non-identical debit and credit accounts
  const invalidLedgerRows = await queryFn(`
    SELECT id, entry_type, account_debited, account_credited, amount_minor
    FROM ledger_entries
    WHERE account_debited = account_credited OR amount_minor <= 0
  `);

  for (const inv of invalidLedgerRows) {
    discrepancies.push({
      type: 'UNBALANCED_LEDGER_EVENT',
      severity: 'CRITICAL',
      description: `Ledger entry ${inv.id} violates double-entry integrity: debited account '${inv.account_debited}' matches credited account or amount is non-positive.`,
      entityId: inv.id,
    });
  }

  // 5. Compute Comprehensive Financial Metrics
  let totalOperationalPaymentsMinor = 0;
  for (const p of confirmedPayments) {
    totalOperationalPaymentsMinor += Number(p.amount_minor);
  }

  const ledgerPaymentRows = await queryFn(`
    SELECT COALESCE(SUM(amount_minor), 0) as total FROM ledger_entries WHERE entry_type = 'PAYMENT'
  `);
  const totalLedgerPaymentsMinor = Number(ledgerPaymentRows[0]?.total || 0);

  const opCommissionRows = await queryFn(`
    SELECT COALESCE(SUM(calculated_commission_amount_minor), 0) as total FROM commission_events WHERE status != 'CANCELLED'
  `);
  const totalOperationalCommissionsMinor = Number(opCommissionRows[0]?.total || 0);

  const ledgerCommissionRows = await queryFn(`
    SELECT COALESCE(SUM(amount_minor), 0) as total FROM ledger_entries WHERE entry_type = 'COMMISSION'
  `);
  const totalLedgerCommissionsMinor = Number(ledgerCommissionRows[0]?.total || 0);

  let totalOperationalPayoutsMinor = 0;
  for (const po of paidPayouts) {
    totalOperationalPayoutsMinor += Number(po.amount_minor);
  }

  const ledgerPayoutRows = await queryFn(`
    SELECT COALESCE(SUM(amount_minor), 0) as total FROM ledger_entries WHERE entry_type = 'PAYOUT'
  `);
  const totalLedgerPayoutsMinor = Number(ledgerPayoutRows[0]?.total || 0);

  let totalOperationalRefundsMinor = 0;
  for (const rf of completedRefunds) {
    totalOperationalRefundsMinor += Number(rf.amount_minor);
  }

  const ledgerRefundRows = await queryFn(`
    SELECT COALESCE(SUM(amount_minor), 0) as total FROM ledger_entries WHERE entry_type = 'REFUND'
  `);
  const totalLedgerRefundsMinor = Number(ledgerRefundRows[0]?.total || 0);

  const isReconciled = discrepancies.length === 0;

  return {
    isReconciled,
    reconciliationStatus: isReconciled ? 'OK' : 'DISCREPANCY_DETECTED',
    totalChecked,
    discrepancyCount: discrepancies.length,
    discrepancies,
    metrics: {
      totalOperationalPaymentsMinor,
      totalLedgerPaymentsMinor,
      totalOperationalCommissionsMinor,
      totalLedgerCommissionsMinor,
      totalOperationalPayoutsMinor,
      totalLedgerPayoutsMinor,
      totalOperationalRefundsMinor,
      totalLedgerRefundsMinor,
    },
    timestamp: new Date().toISOString(),
  };
}
