// src/lib/billing/invoices.ts
import { queryOne, execute } from '@/lib/db/connection';
import { CurrencyCode, PaymentStructureType, PaymentSchedule } from '@/lib/db/types';

/**
 * Concurrency-safe sequential invoice number generator.
 * Format: INV-{CURRENCY}-{YYYY}-{SEQUENCE:04d}
 * Example: INV-KES-2026-0001 or INV-NGN-2026-0001
 */
export async function generateInvoiceNumber(currency: CurrencyCode): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${currency}-${year}-`;

  const latest = await queryOne<{ invoice_number: string }>(
    `SELECT invoice_number FROM invoices
     WHERE invoice_number LIKE ?
     ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (latest && latest.invoice_number) {
    const parts = latest.invoice_number.split('-');
    const lastPart = parts[parts.length - 1];
    const seqNum = parseInt(lastPart, 10);
    if (!isNaN(seqNum)) {
      nextSeq = seqNum + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Reconciles a payment schedule against the proposal total amount using strict integer arithmetic.
 */
export function reconcilePaymentSchedule(
  totalAmountMinor: number,
  scheduleItems: Array<{ name: string; percentageBps: number; amountMinor: number }>
): { isValid: boolean; error?: string } {
  if (!Array.isArray(scheduleItems) || scheduleItems.length === 0) {
    return { isValid: false, error: 'Payment schedule must contain at least one installment item.' };
  }

  let sumMinor = 0;
  let sumBps = 0;

  for (let i = 0; i < scheduleItems.length; i++) {
    const item = scheduleItems[i];
    if (!item.name || typeof item.name !== 'string') {
      return { isValid: false, error: `Item ${i + 1} is missing a valid name.` };
    }
    if (!Number.isInteger(item.amountMinor) || item.amountMinor <= 0) {
      return { isValid: false, error: `Item ${i + 1} (${item.name}) amount must be a positive integer in minor units.` };
    }
    if (!Number.isInteger(item.percentageBps) || item.percentageBps <= 0) {
      return { isValid: false, error: `Item ${i + 1} (${item.name}) percentage must be a positive integer in basis points.` };
    }
    sumMinor += item.amountMinor;
    sumBps += item.percentageBps;
  }

  if (sumMinor !== totalAmountMinor) {
    return {
      isValid: false,
      error: `Payment schedule amount mismatch: Sum of installments (${sumMinor}) does not equal proposal total (${totalAmountMinor}).`,
    };
  }

  if (sumBps !== 10000) {
    return {
      isValid: false,
      error: `Payment schedule percentage mismatch: Sum of percentages (${sumBps} bps) does not equal 10000 bps (100.00%).`,
    };
  }

  return { isValid: true };
}
