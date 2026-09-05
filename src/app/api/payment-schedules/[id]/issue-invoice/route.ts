// src/app/api/payment-schedules/[id]/issue-invoice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { queryOne, execute, transaction } from '@/lib/db/connection';
import { generateInvoiceNumber } from '@/lib/billing/invoices';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can issue milestone invoices' }, { status: 403 });
    }

    const { id: scheduleId } = await params;
    const body = await req.json().catch(() => ({}));
    const { dueDate, notes } = body;

    const schedule = await queryOne<any>('SELECT * FROM payment_schedules WHERE id = ?', [scheduleId]);
    if (!schedule) {
      return NextResponse.json({ error: 'Payment schedule item not found' }, { status: 404 });
    }

    if (schedule.status === 'INVOICED' && schedule.invoice_id) {
      return NextResponse.json({
        error: `Schedule item is already invoiced (Invoice ID: ${schedule.invoice_id}).`,
      }, { status: 400 });
    }

    if (schedule.status === 'PAID') {
      return NextResponse.json({ error: 'Schedule item is already paid.' }, { status: 400 });
    }

    if (schedule.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot issue invoice for a cancelled schedule item.' }, { status: 400 });
    }

    const proposal = await queryOne<any>('SELECT * FROM proposals WHERE id = ?', [schedule.proposal_id]);
    if (!proposal) {
      return NextResponse.json({ error: 'Linked proposal not found' }, { status: 404 });
    }

    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const invoiceNumber = await generateInvoiceNumber(schedule.currency);
    const finalDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    await transaction(async (tx) => {
      await tx.execute(`
        INSERT INTO invoices (
          id, invoice_number, proposal_id, project_id, client_id, representative_id,
          payment_schedule_id, title, description, amount_minor, amount_paid_minor,
          currency, status, due_date, issued_at, notes, created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'ISSUED', ?, datetime('now'), ?, ?, datetime('now'), datetime('now'))
      `, [
        invoiceId,
        invoiceNumber,
        schedule.proposal_id,
        schedule.project_id || proposal.project_id,
        proposal.client_id,
        proposal.representative_id,
        schedule.id,
        `${proposal.title} - ${schedule.name}`,
        notes || `Milestone invoice for ${schedule.name}.`,
        schedule.amount_minor,
        schedule.currency,
        finalDueDate,
        notes ? notes.trim() : null,
        session.userId,
      ]);

      await tx.execute(`
        UPDATE payment_schedules
        SET status = 'INVOICED', invoice_id = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [invoiceId, schedule.id]);
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'INVOICE_ISSUED',
      entity: 'invoices',
      entityId: invoiceId,
      metadata: {
        invoiceNumber,
        amountMinor: schedule.amount_minor,
        currency: schedule.currency,
        scheduleId: schedule.id,
        scheduleName: schedule.name,
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceNumber,
      scheduleStatus: 'INVOICED',
      amountMinor: schedule.amount_minor,
      currency: schedule.currency,
      message: `Invoice ${invoiceNumber} issued successfully for milestone ${schedule.name}.`,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to issue milestone invoice:', err);
    return NextResponse.json({ error: 'Failed to issue milestone invoice' }, { status: 500 });
  }
}
