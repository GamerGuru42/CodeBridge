// src/app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { query, queryOne, execute, transaction } from '@/lib/db/connection';
import { CurrencyCode, InvoiceStatus } from '@/lib/db/types';
import { generateInvoiceNumber } from '@/lib/billing/invoices';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, userId } = session;
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get('status');
    const projectIdFilter = url.searchParams.get('projectId');
    const clientIdFilter = url.searchParams.get('clientId');

    let sql = `
      SELECT i.*,
             c.company_name, c.industry,
             co.code as country_code, co.name as country_name,
             p.title as project_title, p.code as project_code, p.status as project_status,
             prop.proposal_number,
             rep_p.first_name as rep_first_name, rep_p.last_name as rep_last_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      JOIN countries co ON c.country_id = co.id
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN proposals prop ON i.proposal_id = prop.id
      LEFT JOIN representatives r ON i.representative_id = r.id
      LEFT JOIN users rep_u ON r.user_id = rep_u.id
      LEFT JOIN user_profiles rep_p ON rep_u.id = rep_p.user_id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    // Role-based scoping
    if (role === 'CLIENT') {
      const client = await queryOne('SELECT id FROM clients WHERE user_id = ?', [userId]);
      if (!client) {
        return NextResponse.json({ invoices: [] });
      }
      conditions.push('i.client_id = ?');
      params.push(client.id);
      // Clients only see ISSUED or PAID or OVERDUE, not internal DRAFT
      conditions.push("i.status NOT IN ('DRAFT')");
    } else if (role === 'REPRESENTATIVE') {
      const rep = await queryOne('SELECT id FROM representatives WHERE user_id = ?', [userId]);
      if (!rep) {
        return NextResponse.json({ invoices: [] });
      }
      conditions.push('i.representative_id = ?');
      params.push(rep.id);
    } else if (role === 'COUNTRY_MANAGER') {
      const profile = await queryOne('SELECT country_id FROM user_profiles WHERE user_id = ?', [userId]);
      if (profile?.country_id) {
        conditions.push('c.country_id = ?');
        params.push(profile.country_id);
      } else {
        conditions.push('1 = 0');
      }
    } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      // Full administrative visibility
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (statusFilter) {
      conditions.push('i.status = ?');
      params.push(statusFilter);
    }
    if (projectIdFilter) {
      conditions.push('i.project_id = ?');
      params.push(projectIdFilter);
    }
    if (clientIdFilter) {
      conditions.push('i.client_id = ?');
      params.push(clientIdFilter);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY i.created_at DESC';

    const invoices = await query(sql, params);
    return NextResponse.json({ invoices });
  } catch (err: any) {
    console.error('Failed to list invoices:', err);
    return NextResponse.json({ error: 'Failed to list invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can create invoices' }, { status: 403 });
    }

    const body = await req.json();
    const {
      projectId,
      clientId,
      proposalId,
      paymentScheduleId,
      title,
      description,
      amountMinor,
      currency,
      dueDate,
      notes,
    } = body;

    if (!projectId || !clientId || !title || amountMinor === undefined || !currency) {
      return NextResponse.json({ error: 'Project ID, client ID, title, amount, and currency are required.' }, { status: 400 });
    }

    const cleanAmountMinor = Number(amountMinor);
    if (!Number.isInteger(cleanAmountMinor) || cleanAmountMinor <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive integer in minor units.' }, { status: 400 });
    }

    if (!['KES', 'NGN'].includes(currency)) {
      return NextResponse.json({ error: 'Currency must be KES or NGN.' }, { status: 400 });
    }

    const project = await queryOne('SELECT id, representative_id, currency FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.currency !== currency) {
      return NextResponse.json({
        error: `Currency mismatch: Project currency is ${project.currency} but invoice requested ${currency}.`,
      }, { status: 400 });
    }

    const client = await queryOne('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const invoiceNumber = await generateInvoiceNumber(currency as CurrencyCode);
    const finalDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    await execute(`
      INSERT INTO invoices (
        id, invoice_number, proposal_id, project_id, client_id, representative_id,
        payment_schedule_id, title, description, amount_minor, amount_paid_minor,
        currency, status, due_date, issued_at, notes, created_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'ISSUED', ?, datetime('now'), ?, ?, datetime('now'), datetime('now'))
    `, [
      invoiceId,
      invoiceNumber,
      proposalId || null,
      projectId,
      clientId,
      project.representative_id || null,
      paymentScheduleId || null,
      title.trim(),
      description ? description.trim() : null,
      cleanAmountMinor,
      currency,
      finalDueDate,
      notes ? notes.trim() : null,
      session.userId,
    ]);

    await recordAuditLog({
      userId: session.userId,
      action: 'INVOICE_CREATED',
      entity: 'invoices',
      entityId: invoiceId,
      metadata: {
        invoiceNumber,
        amountMinor: cleanAmountMinor,
        currency,
        projectId,
        clientId,
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoiceId,
        invoiceNumber,
        amountMinor: cleanAmountMinor,
        currency,
        status: 'ISSUED',
        dueDate: finalDueDate,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create invoice:', err);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
