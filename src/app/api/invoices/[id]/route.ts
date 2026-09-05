// src/app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { query, queryOne, execute, transaction } from '@/lib/db/connection';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: invoiceId } = await params;
    const { role, userId } = session;

    const invoice = await queryOne(`
      SELECT i.*,
             c.company_name, c.industry, c.country_id as client_country_id,
             co.code as country_code, co.name as country_name,
             p.title as project_title, p.code as project_code, p.status as project_status,
             prop.proposal_number,
             psch.name as schedule_name, psch.billing_trigger, psch.is_required_to_start,
             rep_p.first_name as rep_first_name, rep_p.last_name as rep_last_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      JOIN countries co ON c.country_id = co.id
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN proposals prop ON i.proposal_id = prop.id
      LEFT JOIN payment_schedules psch ON i.payment_schedule_id = psch.id
      LEFT JOIN representatives r ON i.representative_id = r.id
      LEFT JOIN users rep_u ON r.user_id = rep_u.id
      LEFT JOIN user_profiles rep_p ON rep_u.id = rep_p.user_id
      WHERE i.id = ?
    `, [invoiceId]);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Role-based authorization
    if (role === 'CLIENT') {
      const client = await queryOne('SELECT id FROM clients WHERE user_id = ?', [userId]);
      if (!client || client.id !== invoice.client_id) {
        return NextResponse.json({ error: 'Forbidden: You do not own this invoice' }, { status: 403 });
      }
    } else if (role === 'REPRESENTATIVE') {
      const rep = await queryOne('SELECT id FROM representatives WHERE user_id = ?', [userId]);
      if (!rep || rep.id !== invoice.representative_id) {
        return NextResponse.json({ error: 'Forbidden: Invoice not linked to your portfolio' }, { status: 403 });
      }
    } else if (role === 'COUNTRY_MANAGER') {
      const profile = await queryOne('SELECT country_id FROM user_profiles WHERE user_id = ?', [userId]);
      if (!profile?.country_id || profile.country_id !== invoice.client_country_id) {
        return NextResponse.json({ error: 'Forbidden: Invoice is outside your country' }, { status: 403 });
      }
    }

    // Fetch verified payments history
    const payments = await query(`
      SELECT p.*, u.email as verified_by_email
      FROM payments p
      LEFT JOIN users u ON p.verified_by = u.id
      WHERE p.invoice_id = ?
      ORDER BY p.verified_at DESC
    `, [invoiceId]);

    return NextResponse.json({
      invoice: {
        ...invoice,
        payments,
      },
    });
  } catch (err: any) {
    console.error('Failed to get invoice:', err);
    return NextResponse.json({ error: 'Failed to retrieve invoice' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can update invoice status' }, { status: 403 });
    }

    const { id: invoiceId } = await params;
    const body = await req.json();
    const { action, notes } = body;

    const invoice = await queryOne('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (action === 'CANCEL') {
      if (invoice.status === 'PAID') {
        return NextResponse.json({ error: 'Cannot cancel an invoice that is already paid.' }, { status: 400 });
      }

      await transaction(async (tx) => {
        await tx.execute(`
          UPDATE invoices
          SET status = 'CANCELLED', notes = COALESCE(?, notes), updated_at = datetime('now')
          WHERE id = ?
        `, [notes || 'Cancelled by administrator', invoiceId]);

        if (invoice.payment_schedule_id) {
          await tx.execute(`
            UPDATE payment_schedules
            SET status = 'CANCELLED', updated_at = datetime('now')
            WHERE id = ?
          `, [invoice.payment_schedule_id]);
        }
      });

      await recordAuditLog({
        userId: session.userId,
        action: 'INVOICE_CANCELLED',
        entity: 'invoices',
        entityId: invoiceId,
        metadata: { invoiceNumber: invoice.invoice_number },
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({ success: true, status: 'CANCELLED' });
    }

    return NextResponse.json({ error: 'Invalid invoice action' }, { status: 400 });
  } catch (err: any) {
    console.error('Failed to update invoice:', err);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
