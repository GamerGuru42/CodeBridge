// src/lib/payments/ledger.ts
import type { LedgerEntry, LedgerEntryType, DoubleEntryAccount } from '@/lib/db/types';
import { query } from '@/lib/db/connection';

export interface DbExecutor {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid?: number | bigint }>;
}

export interface RecordEntryParams {
  entryType: LedgerEntryType;
  accountDebited: DoubleEntryAccount | string;
  accountCredited: DoubleEntryAccount | string;
  currency: string;
  amountMinor: number;
  invoiceId?: string | null;
  paymentId?: string | null;
  salesRepId?: string | null;
  projectId?: string | null;
  clientId?: string | null;
  reference: string;
  notes?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Validates and records an immutable double-entry ledger record.
 * This table is strictly append-only. Zero UPDATE or DELETE operations are permitted.
 */
export async function recordDoubleEntry(
  db: DbExecutor,
  params: RecordEntryParams
): Promise<LedgerEntry> {
  const amountMinor = Math.floor(params.amountMinor);

  if (amountMinor <= 0) {
    throw new Error(`[Financial Ledger Error] Invalid amount: ${params.amountMinor}. Ledger entries must be positive integer minor units.`);
  }

  if (!params.accountDebited || !params.accountCredited) {
    throw new Error('[Financial Ledger Error] Both accountDebited and accountCredited are mandatory for double-entry records.');
  }

  if (params.accountDebited === params.accountCredited) {
    throw new Error(`[Financial Ledger Error] Circular booking violation: account ${params.accountDebited} cannot be debited and credited simultaneously.`);
  }

  if (!params.currency) {
    throw new Error('[Financial Ledger Error] Currency code is mandatory.');
  }

  if (!params.reference) {
    throw new Error('[Financial Ledger Error] Reference is mandatory for audit traceability.');
  }

  const id = `ledg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const metadataJson = params.metadata ? JSON.stringify(params.metadata) : null;

  await db.execute(`
    INSERT INTO ledger_entries (
      id, entry_type, account_debited, account_credited,
      currency, amount_minor, invoice_id, payment_id,
      sales_rep_id, project_id, client_id, reference,
      notes, metadata_json, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `, [
    id,
    params.entryType,
    params.accountDebited,
    params.accountCredited,
    params.currency.toUpperCase(),
    amountMinor,
    params.invoiceId || null,
    params.paymentId || null,
    params.salesRepId || null,
    params.projectId || null,
    params.clientId || null,
    params.reference,
    params.notes || null,
    metadataJson,
  ]);

  return {
    id,
    entry_type: params.entryType,
    account_debited: params.accountDebited,
    account_credited: params.accountCredited,
    currency: params.currency.toUpperCase(),
    amount_minor: amountMinor,
    invoice_id: params.invoiceId || null,
    payment_id: params.paymentId || null,
    sales_rep_id: params.salesRepId || null,
    project_id: params.projectId || null,
    client_id: params.clientId || null,
    reference: params.reference,
    notes: params.notes || null,
    metadata_json: metadataJson,
    created_at: new Date().toISOString(),
  };
}

/**
 * Standard Double-Entry Event: Client Payment Confirmed
 * Debit: BUSINESS_CASH (+Amount)
 * Credit: CLIENT_RECEIVABLE (-Amount)
 */
export async function recordPaymentLedgerEntry(
  db: DbExecutor,
  params: {
    paymentId: string;
    invoiceId: string;
    projectId?: string | null;
    clientId?: string | null;
    salesRepId?: string | null;
    currency: string;
    amountMinor: number;
    reference: string;
    notes?: string;
  }
): Promise<LedgerEntry> {
  return recordDoubleEntry(db, {
    entryType: 'PAYMENT',
    accountDebited: 'BUSINESS_CASH',
    accountCredited: 'CLIENT_RECEIVABLE',
    currency: params.currency,
    amountMinor: params.amountMinor,
    invoiceId: params.invoiceId,
    paymentId: params.paymentId,
    projectId: params.projectId,
    clientId: params.clientId,
    salesRepId: params.salesRepId,
    reference: params.reference,
    notes: params.notes || `Client payment confirmed for invoice ${params.invoiceId}`,
  });
}

/**
 * Standard Double-Entry Event: Sales Rep Commission Accrued
 * Debit: COMMISSION_EXPENSE (+Expense)
 * Credit: COMMISSION_PAYABLE (+Liability owed to Rep)
 */
export async function recordCommissionAccrualLedgerEntry(
  db: DbExecutor,
  params: {
    commissionId: string;
    salesRepId: string;
    paymentId: string;
    invoiceId: string;
    projectId?: string | null;
    clientId?: string | null;
    currency: string;
    amountMinor: number;
    rateBps: number;
    reference: string;
  }
): Promise<LedgerEntry> {
  return recordDoubleEntry(db, {
    entryType: 'COMMISSION',
    accountDebited: 'COMMISSION_EXPENSE',
    accountCredited: 'COMMISSION_PAYABLE',
    currency: params.currency,
    amountMinor: params.amountMinor,
    invoiceId: params.invoiceId,
    paymentId: params.paymentId,
    projectId: params.projectId,
    clientId: params.clientId,
    salesRepId: params.salesRepId,
    reference: params.reference,
    notes: `Sales commission accrual (${params.rateBps / 100}%) for payment ${params.paymentId}`,
    metadata: { commissionId: params.commissionId, rateBps: params.rateBps },
  });
}

/**
 * Standard Double-Entry Event: Commission Payout Confirmed (Transferred via Flutterwave)
 * Debit: COMMISSION_PAYABLE (-Liability)
 * Credit: BUSINESS_CASH (-Cash transferred out)
 */
export async function recordPayoutSuccessLedgerEntry(
  db: DbExecutor,
  params: {
    payoutId: string;
    salesRepId: string;
    currency: string;
    amountMinor: number;
    reference: string;
    providerTransferId?: string | null;
  }
): Promise<LedgerEntry> {
  return recordDoubleEntry(db, {
    entryType: 'PAYOUT',
    accountDebited: 'COMMISSION_PAYABLE',
    accountCredited: 'BUSINESS_CASH',
    currency: params.currency,
    amountMinor: params.amountMinor,
    salesRepId: params.salesRepId,
    reference: params.reference,
    notes: `Confirmed Flutterwave transfer disbursement to representative ${params.salesRepId}`,
    metadata: { payoutId: params.payoutId, providerTransferId: params.providerTransferId },
  });
}

/**
 * Standard Double-Entry Event: Commission Reversal (When refund occurs BEFORE payout)
 * Debit: COMMISSION_PAYABLE (-Liability)
 * Credit: COMMISSION_EXPENSE (-Expense)
 */
export async function recordCommissionReversalLedgerEntry(
  db: DbExecutor,
  params: {
    salesRepId: string;
    invoiceId: string;
    paymentId: string;
    refundId?: string | null;
    currency: string;
    amountMinor: number;
    reference: string;
    notes?: string;
  }
): Promise<LedgerEntry> {
  return recordDoubleEntry(db, {
    entryType: 'REVERSAL',
    accountDebited: 'COMMISSION_PAYABLE',
    accountCredited: 'COMMISSION_EXPENSE',
    currency: params.currency,
    amountMinor: params.amountMinor,
    invoiceId: params.invoiceId,
    paymentId: params.paymentId,
    salesRepId: params.salesRepId,
    reference: params.reference,
    notes: params.notes || `Commission reversal due to client refund on payment ${params.paymentId}`,
    metadata: { refundId: params.refundId },
  });
}

/**
 * Standard Double-Entry Event: Client Refund Confirmed
 * Debit: REFUND_EXPENSE (or CLIENT_RECEIVABLE) (+Refund)
 * Credit: BUSINESS_CASH (-Cash returned to client)
 */
export async function recordRefundLedgerEntry(
  db: DbExecutor,
  params: {
    refundId: string;
    paymentId: string;
    invoiceId: string;
    projectId?: string | null;
    clientId?: string | null;
    salesRepId?: string | null;
    currency: string;
    amountMinor: number;
    reference: string;
    reason?: string | null;
  }
): Promise<LedgerEntry> {
  return recordDoubleEntry(db, {
    entryType: 'REFUND',
    accountDebited: 'REFUND_EXPENSE',
    accountCredited: 'BUSINESS_CASH',
    currency: params.currency,
    amountMinor: params.amountMinor,
    invoiceId: params.invoiceId,
    paymentId: params.paymentId,
    projectId: params.projectId,
    clientId: params.clientId,
    salesRepId: params.salesRepId,
    reference: params.reference,
    notes: params.reason ? `Client refund: ${params.reason}` : `Client refund on payment ${params.paymentId}`,
    metadata: { refundId: params.refundId },
  });
}

/**
 * Standard Double-Entry Event: Commission Recovery Obligation (When refund occurs AFTER payout)
 * Original payout remains completely intact.
 * Debit: RECOVERY_RECEIVABLE (+Receivable owed back by rep)
 * Credit: COMMISSION_EXPENSE (-Expense offset)
 */
export async function recordRecoveryReceivableLedgerEntry(
  db: DbExecutor,
  params: {
    salesRepId: string;
    refundId: string;
    paymentId: string;
    invoiceId: string;
    currency: string;
    amountMinor: number;
    reference: string;
    notes?: string;
  }
): Promise<LedgerEntry> {
  return recordDoubleEntry(db, {
    entryType: 'RECOVERY',
    accountDebited: 'RECOVERY_RECEIVABLE',
    accountCredited: 'COMMISSION_EXPENSE',
    currency: params.currency,
    amountMinor: params.amountMinor,
    invoiceId: params.invoiceId,
    paymentId: params.paymentId,
    salesRepId: params.salesRepId,
    reference: params.reference,
    notes: params.notes || `Recovery obligation created for commission already paid on refunded payment ${params.paymentId}`,
    metadata: { refundId: params.refundId },
  });
}

/**
 * Standard Double-Entry Event: Recovery Offset Against Future Commission
 * Debit: COMMISSION_PAYABLE (-New commission payable)
 * Credit: RECOVERY_RECEIVABLE (-Recovery receivable owed)
 */
export async function recordRecoveryOffsetLedgerEntry(
  db: DbExecutor,
  params: {
    salesRepId: string;
    newCommissionId: string;
    currency: string;
    amountMinor: number;
    reference: string;
    notes?: string;
  }
): Promise<LedgerEntry> {
  return recordDoubleEntry(db, {
    entryType: 'RECOVERY_OFFSET',
    accountDebited: 'COMMISSION_PAYABLE',
    accountCredited: 'RECOVERY_RECEIVABLE',
    currency: params.currency,
    amountMinor: params.amountMinor,
    salesRepId: params.salesRepId,
    reference: params.reference,
    notes: params.notes || `Recovery balance offset against new commission ${params.newCommissionId}`,
    metadata: { newCommissionId: params.newCommissionId },
  });
}

/**
 * Derives comprehensive, authoritative financial balances from immutable ledger entries.
 */
export async function deriveRepFinancialSummary(
  param1: DbExecutor | string,
  param2?: string
): Promise<{
  salesRepId: string;
  currency: string;
  totalEarnedMinor: number;
  totalPaidMinor: number;
  totalReversedMinor: number;
  totalPendingMinor: number;
  recoveryBalanceMinor: number;
  netPayableMinor: number;
}> {
  let repId: string;
  let queryFn: (sql: string, params?: any[]) => Promise<any[]>;

  if (typeof param1 === 'string') {
    repId = param1;
    queryFn = query;
  } else {
    repId = param2!;
    const executor: any = param1;
    if (typeof executor.query === 'function') {
      queryFn = (sql, params) => executor.query(sql, params);
    } else if (typeof executor.all === 'function') {
      queryFn = (sql, params) => executor.all(sql, params);
    } else {
      queryFn = query;
    }
  }

  const rows = await queryFn(`
    SELECT entry_type, account_debited, account_credited, currency, amount_minor
    FROM ledger_entries
    WHERE sales_rep_id = ?
  `, [repId]);

  let totalEarnedMinor = 0;
  let totalPaidMinor = 0;
  let totalReversedMinor = 0;
  let recoveryCreatedMinor = 0;
  let recoveryOffsetMinor = 0;
  let defaultCurrency = 'KES';

  for (const r of rows) {
    const amt = Number(r.amount_minor);
    defaultCurrency = r.currency;

    if (r.entry_type === 'COMMISSION') {
      totalEarnedMinor += amt;
    } else if (r.entry_type === 'PAYOUT') {
      totalPaidMinor += amt;
    } else if (r.entry_type === 'REVERSAL') {
      totalReversedMinor += amt;
    } else if (r.entry_type === 'RECOVERY') {
      recoveryCreatedMinor += amt;
    } else if (r.entry_type === 'RECOVERY_OFFSET') {
      recoveryOffsetMinor += amt;
    }
  }

  const recoveryBalanceMinor = Math.max(0, recoveryCreatedMinor - recoveryOffsetMinor);
  // Total pending is earned minus paid minus reversed
  const totalPendingMinor = Math.max(0, totalEarnedMinor - totalPaidMinor - totalReversedMinor);
  // Net payable after deducting recovery balance
  const netPayableMinor = Math.max(0, totalPendingMinor - recoveryBalanceMinor);

  return {
    salesRepId: repId,
    currency: defaultCurrency,
    totalEarnedMinor,
    totalPaidMinor,
    totalReversedMinor,
    totalPendingMinor,
    recoveryBalanceMinor,
    netPayableMinor,
  };
}
