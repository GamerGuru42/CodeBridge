// src/app/api/invoices/[id]/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { queryOne, execute, transaction } from '@/lib/db/connection';
import { PaymentMethod, VerificationSource, CurrencyCode } from '@/lib/db/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Strict role check: Only Super Admin and Admin can verify payments
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can verify payments' }, { status: 403 });
    }

    const { id: invoiceId } = await params;
    const body = await req.json();
    const {
      amountMinor,
      currency,
      paymentMethod = 'BANK_TRANSFER',
      verificationSource = 'MANUAL_VERIFICATION',
      reference,
      verificationNotes,
    } = body;

    if (!amountMinor || !currency || !reference) {
      return NextResponse.json({ error: 'Amount, currency, and reference are required.' }, { status: 400 });
    }

    const cleanAmountMinor = Number(amountMinor);
    if (!Number.isInteger(cleanAmountMinor) || cleanAmountMinor <= 0) {
      return NextResponse.json({ error: 'Payment amount must be a positive integer in minor units.' }, { status: 400 });
    }

    const validMethods: PaymentMethod[] = ['BANK_TRANSFER', 'CASH', 'OTHER_MANUAL', 'GATEWAY_SIMULATION', 'MPESA', 'CARD', 'FLUTTERWAVE'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: `Invalid payment method: ${paymentMethod}` }, { status: 400 });
    }

    const validSources: VerificationSource[] = [
      'MANUAL_VERIFICATION',
      'BANK_TRANSFER_CONFIRMATION',
      'GATEWAY_SIMULATION',
      'FLUTTERWAVE_WEBHOOK',
      'M_PESA_CALLBACK',
    ];
    if (!validSources.includes(verificationSource)) {
      return NextResponse.json({ error: `Invalid verification source: ${verificationSource}` }, { status: 400 });
    }

    const cleanReference = String(reference).trim();
    if (!cleanReference) {
      return NextResponse.json({ error: 'Valid transaction reference is required.' }, { status: 400 });
    }

    // Retrieve Invoice & lock check
    const invoice = await queryOne<any>('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice is already paid in full.' }, { status: 400 });
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot apply payment to a cancelled invoice.' }, { status: 400 });
    }

    // Currency matching assertion
    if (invoice.currency !== currency) {
      return NextResponse.json({
        error: `Currency mismatch: Invoice is in ${invoice.currency} but payment submitted was in ${currency}.`,
      }, { status: 400 });
    }

    // Prevent overpayment
    const cleanInvoiceAmountMinor = Number(invoice.amount_minor);
    const cleanInvoiceAmountPaidMinor = Number(invoice.amount_paid_minor || 0);
    const remainingUnpaid = cleanInvoiceAmountMinor - cleanInvoiceAmountPaidMinor;
    if (cleanAmountMinor > remainingUnpaid) {
      return NextResponse.json({
        error: `Payment amount (${cleanAmountMinor}) exceeds remaining unpaid balance (${remainingUnpaid}) of invoice.`,
      }, { status: 400 });
    }

    // Idempotency: Reference uniqueness check
    const existingPayment = await queryOne('SELECT id FROM payments WHERE reference = ?', [cleanReference]);
    if (existingPayment) {
      return NextResponse.json({
        error: `Payment with reference '${cleanReference}' has already been verified (Payment ID: ${existingPayment.id}).`,
      }, { status: 409 });
    }

    const project = await queryOne<any>('SELECT * FROM projects WHERE id = ?', [invoice.project_id]);
    if (!project) {
      return NextResponse.json({ error: 'Linked project not found' }, { status: 404 });
    }

    // Currency integrity: project currency must match invoice currency
    if (project.currency !== currency) {
      return NextResponse.json({
        error: `Currency integrity violation: Project currency (${project.currency}) does not match invoice currency (${currency}).`,
      }, { status: 400 });
    }

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const commissionEventId = `cev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    let newInvoiceStatus = invoice.status;
    let projectStarted = false;

    // Execute atomic payment verification transaction
    await transaction(async (tx) => {
      // 1. Insert into payments
      await tx.execute(`
        INSERT INTO payments (
          id, invoice_id, project_id, amount_minor, currency, payment_method,
          verification_source, status, reference, verified_at, verified_by,
          verification_notes, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, datetime('now'))
      `, [
        paymentId,
        invoiceId,
        project.id,
        cleanAmountMinor,
        currency,
        paymentMethod,
        verificationSource,
        cleanReference,
        now,
        session.userId,
        verificationNotes ? verificationNotes.trim() : null,
      ]);

      // 2. Update invoice amount_paid_minor and status
      const updatedAmountPaid = cleanInvoiceAmountPaidMinor + cleanAmountMinor;
      newInvoiceStatus = updatedAmountPaid >= cleanInvoiceAmountMinor ? 'PAID' : 'PARTIALLY_PAID';
      const paidAtTimestamp = newInvoiceStatus === 'PAID' ? now : null;

      await tx.execute(`
        UPDATE invoices
        SET amount_paid_minor = ?, status = ?, paid_at = COALESCE(?, paid_at), updated_at = datetime('now')
        WHERE id = ?
      `, [updatedAmountPaid, newInvoiceStatus, paidAtTimestamp, invoiceId]);

      // 3. Update linked payment schedule item
      if (invoice.payment_schedule_id) {
        if (newInvoiceStatus === 'PAID') {
          await tx.execute(`
            UPDATE payment_schedules
            SET status = 'PAID', paid_at = ?, updated_at = datetime('now')
            WHERE id = ?
          `, [now, invoice.payment_schedule_id]);
        }
      }

      // 4. Update project total_paid_minor and payment_status
      const cleanProjectTotalPaidMinor = Number(project.total_paid_minor || 0);
      const cleanProjectBudgetMinor = Number(project.budget_minor);
      const updatedProjectPaid = cleanProjectTotalPaidMinor + cleanAmountMinor;
      const updatedProjectPaymentStatus =
        updatedProjectPaid >= cleanProjectBudgetMinor
          ? 'PAID'
          : updatedProjectPaid > 0
          ? 'PARTIALLY_PAID'
          : 'UNPAID';

      await tx.execute(`
        UPDATE projects
        SET total_paid_minor = ?, payment_status = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [updatedProjectPaid, updatedProjectPaymentStatus, project.id]);

      // 5. Evaluate Project Start Condition
      // Project starts if in AWAITING_PAYMENT and the required start payment is verified
      if (project.status === 'AWAITING_PAYMENT') {
        let isStartConditionMet = false;

        if (invoice.proposal_id) {
          const proposal = await tx.queryOne<any>('SELECT payment_structure_type FROM proposals WHERE id = ?', [invoice.proposal_id]);
          const structureType = proposal?.payment_structure_type || 'FULL_UPFRONT';

          if (structureType === 'FULL_UPFRONT') {
            // Full upfront requires 100% of project budget verified
            if (updatedProjectPaid >= cleanProjectBudgetMinor) {
              isStartConditionMet = true;
            }
          } else {
            // Milestone or Custom: check if all schedule items marked is_required_to_start are PAID
            const requiredUnpaid = await tx.queryOne<any>(`
              SELECT COUNT(*) as count FROM payment_schedules
              WHERE proposal_id = ? AND is_required_to_start = 1 AND status != 'PAID'
            `, [invoice.proposal_id]);

            if (requiredUnpaid && Number(requiredUnpaid.count) === 0) {
              isStartConditionMet = true;
            }
          }
        } else {
          // If no linked proposal, start upon any confirmed payment
          isStartConditionMet = true;
        }

        if (isStartConditionMet) {
          await tx.execute(`
            UPDATE projects
            SET status = 'PLANNING', started_at = ?, updated_at = datetime('now')
            WHERE id = ?
          `, [now, project.id]);
          projectStarted = true;
        }
      }

      // 6. Record Immutable Commission Event (Phase 2B -> Phase 2D Handoff)
      if (invoice.representative_id) {
        const rep = await tx.queryOne<any>('SELECT commission_rate_bps FROM representatives WHERE id = ?', [invoice.representative_id]);
        const rateBpsSnapshot = Number(rep?.commission_rate_bps ?? 2000); // Snapshots rate at time of payment
        const calculatedCommissionMinor = Math.floor((cleanAmountMinor * rateBpsSnapshot) / 10000);
        const idempotencyKey = `COMMISSION_PAYMENT_${paymentId}`;

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
          invoiceId,
          project.id,
          invoice.proposal_id || null,
          invoice.representative_id,
          currency,
          cleanAmountMinor,
          rateBpsSnapshot,
          calculatedCommissionMinor,
          now,
          idempotencyKey,
        ]);
      }
    });

    // Record Audit Logs
    await recordAuditLog({
      userId: session.userId,
      action: 'PAYMENT_VERIFIED',
      entity: 'payments',
      entityId: paymentId,
      metadata: {
        invoiceId,
        invoiceNumber: invoice.invoice_number,
        amountMinor: cleanAmountMinor,
        currency,
        reference: cleanReference,
        paymentMethod,
        verificationSource,
        newInvoiceStatus,
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    if (newInvoiceStatus === 'PAID') {
      await recordAuditLog({
        userId: session.userId,
        action: 'INVOICE_PAID',
        entity: 'invoices',
        entityId: invoiceId,
        metadata: { invoiceNumber: invoice.invoice_number, totalPaidMinor: invoice.amount_minor },
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
    }

    if (projectStarted) {
      await recordAuditLog({
        userId: session.userId,
        action: 'PROJECT_STARTED',
        entity: 'projects',
        entityId: project.id,
        metadata: { projectCode: project.code, startedAt: now, triggeredByPaymentId: paymentId },
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
    }

    return NextResponse.json({
      success: true,
      paymentId,
      invoiceId,
      invoiceNumber: invoice.invoice_number,
      invoiceStatus: newInvoiceStatus,
      amountVerifiedMinor: cleanAmountMinor,
      currency,
      reference: cleanReference,
      verificationSource,
      projectStarted,
      commissionEventRecorded: Boolean(invoice.representative_id),
      message: projectStarted
        ? 'Payment verified successfully. Required initial payment received: project work has officially started!'
        : 'Payment verified successfully and recorded.',
    }, { status: 200 });
  } catch (err: any) {
    console.error('Failed to verify payment:', err);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
