// src/app/api/proposals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, recordAuditLog } from '@/lib/auth/session';
import { query, queryOne, execute, transaction } from '@/lib/db/connection';
import { ProposalStatus, CurrencyCode } from '@/lib/db/types';
import { generateInvoiceNumber } from '@/lib/billing/invoices';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: proposalId } = await params;

    const proposal = await queryOne(`
      SELECT p.*,
             c.company_name, c.industry, c.country_id as client_country_id,
             co.code as country_code, co.name as country_name,
             rep_p.first_name as rep_first_name, rep_p.last_name as rep_last_name,
             l.business_name as lead_business_name,
             proj.code as project_code, proj.status as project_status
      FROM proposals p
      JOIN clients c ON p.client_id = c.id
      JOIN countries co ON c.country_id = co.id
      LEFT JOIN representatives r ON p.representative_id = r.id
      LEFT JOIN users rep_u ON r.user_id = rep_u.id
      LEFT JOIN user_profiles rep_p ON rep_u.id = rep_p.user_id
      LEFT JOIN leads l ON p.lead_id = l.id
      LEFT JOIN projects proj ON p.project_id = proj.id
      WHERE p.id = ?
    `, [proposalId]);

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const { role, userId } = session;

    // RBAC: Client isolation
    if (role === 'CLIENT') {
      const client = await queryOne('SELECT id FROM clients WHERE user_id = ?', [userId]);
      if (!client || client.id !== proposal.client_id) {
        return NextResponse.json({ error: 'Forbidden: You cannot access this proposal' }, { status: 403 });
      }

      // Check if validity has passed -> auto-transition to EXPIRED
      if (
        (proposal.status === 'SENT' || proposal.status === 'VIEWED') &&
        proposal.valid_until &&
        new Date(proposal.valid_until).getTime() < Date.now()
      ) {
        const now = new Date().toISOString();
        await execute(`
          UPDATE proposals
          SET status = 'EXPIRED', updated_at = ?
          WHERE id = ?
        `, [now, proposalId]);

        proposal.status = 'EXPIRED';

        await recordAuditLog({
          userId,
          action: 'PROPOSAL_EXPIRED',
          entity: 'proposals',
          entityId: proposalId,
          metadata: { proposalNumber: proposal.proposal_number, version: proposal.version, expiredAt: now },
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        });
      }

      // Automatic Status Transition: SENT -> VIEWED
      if (proposal.status === 'SENT') {
        const now = new Date().toISOString();
        await execute(`
          UPDATE proposals
          SET status = 'VIEWED', viewed_at = ?, updated_at = ?
          WHERE id = ?
        `, [now, now, proposalId]);

        proposal.status = 'VIEWED';
        proposal.viewed_at = now;

        await recordAuditLog({
          userId,
          action: 'PROPOSAL_VIEWED',
          entity: 'proposals',
          entityId: proposalId,
          metadata: { proposalNumber: proposal.proposal_number, version: proposal.version },
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        });
      }
    } else if (role === 'REPRESENTATIVE') {
      const rep = await queryOne('SELECT id FROM representatives WHERE user_id = ?', [userId]);
      if (!rep || rep.id !== proposal.representative_id) {
        return NextResponse.json({ error: 'Forbidden: You cannot access this proposal' }, { status: 403 });
      }
    } else if (role === 'COUNTRY_MANAGER') {
      const profile = await queryOne('SELECT country_id FROM user_profiles WHERE user_id = ?', [userId]);
      if (!profile?.country_id || profile.country_id !== proposal.client_country_id) {
        return NextResponse.json({ error: 'Forbidden: Proposal is outside your country' }, { status: 403 });
      }
    }

    // Fetch version history for this proposal
    const versionHistory = await query(`
      SELECT id, proposal_number, version, is_current, status, total_amount_minor, currency, created_at
      FROM proposals
      WHERE proposal_number = ?
      ORDER BY version DESC
    `, [proposal.proposal_number]);

    let deliverables: string[] = [];
    try {
      deliverables = JSON.parse(proposal.deliverables_json || '[]');
    } catch {
      deliverables = [];
    }

    let defaultSchedule: any[] = [];
    try {
      defaultSchedule = JSON.parse(proposal.payment_schedule_json || '[]');
    } catch {
      defaultSchedule = [];
    }

    // Fetch active invoices and payment schedules
    const schedules = await query('SELECT * FROM payment_schedules WHERE proposal_id = ? ORDER BY order_index ASC', [proposal.id]);
    const invoices = await query(`
      SELECT * FROM invoices 
      WHERE proposal_id = ? OR (project_id IS NOT NULL AND project_id = ?)
      ORDER BY created_at DESC
    `, [proposal.id, proposal.project_id || '']);

    return NextResponse.json({
      proposal: {
        ...proposal,
        deliverables,
        paymentSchedule: schedules.length > 0 ? schedules : defaultSchedule,
        invoices,
        versionHistory,
      },
    });
  } catch (err: any) {
    console.error('Failed to get proposal:', err);
    return NextResponse.json({ error: 'Failed to retrieve proposal' }, { status: 500 });
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

    const { id: proposalId } = await params;
    const body = await req.json();
    const { action } = body;

    const proposal = await queryOne('SELECT * FROM proposals WHERE id = ?', [proposalId]);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const { role, userId } = session;

    // 1. ACTION: SEND (Admin authors -> sends to client)
    if (action === 'SEND') {
      if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden: Only administrators can transmit proposals' }, { status: 403 });
      }

      if (proposal.status !== 'DRAFT') {
        return NextResponse.json({ error: `Invalid transition: Cannot send proposal in '${proposal.status}' status` }, { status: 400 });
      }

      const now = new Date().toISOString();
      await execute(`
        UPDATE proposals
        SET status = 'SENT', sent_at = ?, updated_at = ?
        WHERE id = ?
      `, [now, now, proposalId]);

      await recordAuditLog({
        userId,
        action: 'PROPOSAL_SENT',
        entity: 'proposals',
        entityId: proposalId,
        metadata: { proposalNumber: proposal.proposal_number, version: proposal.version },
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({ success: true, status: 'SENT' });
    }

    // 2. ACTION: EDIT (Admin edits scope, deliverables, or pricing)
    if (action === 'EDIT') {
      if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden: Only administrators can edit proposals' }, { status: 403 });
      }
    if (proposal.status === 'CLIENT_APPROVED') {
        return NextResponse.json({ error: 'Approved proposals are immutable and cannot be modified.' }, { status: 400 });
      }

      const { title, scopeOfWork, deliverables, paymentStructureType, paymentSchedule, totalAmountMinor, validUntil, termsNotes } = body;
      const cleanAmountMinor = totalAmountMinor !== undefined ? Number(totalAmountMinor) : proposal.total_amount_minor;
      const deliverablesJson = deliverables !== undefined ? JSON.stringify(deliverables) : proposal.deliverables_json;
      const finalStructureType = paymentStructureType || proposal.payment_structure_type || 'FULL_UPFRONT';
      const paymentScheduleJson = paymentSchedule !== undefined ? JSON.stringify(paymentSchedule) : proposal.payment_schedule_json;

      // Versioning rule:
      // If still in DRAFT, update in place
      // If already SENT or VIEWED, create a NEW VERSION to preserve history!
      if (proposal.status === 'DRAFT') {
        await execute(`
          UPDATE proposals
          SET title = COALESCE(?, title),
              scope_of_work = COALESCE(?, scope_of_work),
              deliverables_json = COALESCE(?, deliverables_json),
              payment_structure_type = ?,
              payment_schedule_json = COALESCE(?, payment_schedule_json),
              total_amount_minor = ?,
              valid_until = COALESCE(?, valid_until),
              terms_notes = COALESCE(?, terms_notes),
              updated_at = datetime('now')
          WHERE id = ?
        `, [
          title || null,
          scopeOfWork || null,
          deliverablesJson || null,
          finalStructureType,
          paymentScheduleJson || null,
          cleanAmountMinor,
          validUntil || null,
          termsNotes || null,
          proposalId
        ]);

        await recordAuditLog({
          userId,
          action: 'PROPOSAL_EDITED',
          entity: 'proposals',
          entityId: proposalId,
          metadata: { proposalNumber: proposal.proposal_number, version: proposal.version, inPlace: true },
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        });

        return NextResponse.json({ success: true, version: proposal.version, proposalId });
      } else if (proposal.status === 'SENT' || proposal.status === 'VIEWED') {
        const nextVersion = proposal.version + 1;
        const newProposalId = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

        await transaction(async (tx) => {
          // Mark current version as superseded
          await tx.execute('UPDATE proposals SET is_current = 0, updated_at = datetime(\'now\') WHERE id = ?', [proposalId]);

          // Insert new version
          await tx.execute(`
            INSERT INTO proposals (
              id, proposal_number, version, is_current, lead_id, client_id,
              project_id, representative_id, title, scope_of_work, deliverables_json,
              payment_structure_type, payment_schedule_json,
              total_amount_minor, currency, status, valid_until, terms_notes,
              created_by, sent_at, created_at, updated_at
            )
            VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SENT', ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
          `, [
            newProposalId,
            proposal.proposal_number,
            nextVersion,
            proposal.lead_id,
            proposal.client_id,
            proposal.project_id,
            proposal.representative_id,
            title || proposal.title,
            scopeOfWork || proposal.scope_of_work,
            deliverablesJson,
            finalStructureType,
            paymentScheduleJson,
            cleanAmountMinor,
            proposal.currency,
            validUntil || proposal.valid_until,
            termsNotes || proposal.terms_notes,
            userId,
          ]);
        });

        await recordAuditLog({
          userId,
          action: 'PROPOSAL_EDITED',
          entity: 'proposals',
          entityId: newProposalId,
          metadata: {
            proposalNumber: proposal.proposal_number,
            previousVersion: proposal.version,
            newVersion: nextVersion,
            supersededId: proposalId,
          },
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        });

        return NextResponse.json({
          success: true,
          version: nextVersion,
          proposalId: newProposalId,
          message: `Created new proposal version ${nextVersion}. Previous version preserved in history.`,
        });
      } else {
        return NextResponse.json({ error: `Cannot edit proposal in status '${proposal.status}'` }, { status: 400 });
      }
    }

    // 3. ACTION: CLIENT_APPROVE (Client approves proposal)
    if (action === 'CLIENT_APPROVE') {
      // Must be authenticated as CLIENT
      if (role !== 'CLIENT') {
        return NextResponse.json({ error: 'Forbidden: Only the designated client can approve this proposal' }, { status: 403 });
      }

      // Verify client identity strictly from session
      const client = await queryOne('SELECT id, company_name, country_id FROM clients WHERE user_id = ?', [userId]);
      if (!client || client.id !== proposal.client_id) {
        return NextResponse.json({ error: 'Forbidden: You do not own this proposal' }, { status: 403 });
      }

      // Version check: Client can only approve current active version
      if (Number(proposal.is_current) !== 1) {
        return NextResponse.json({ error: 'This proposal version has been superseded by a newer version. Please review the current active version.' }, { status: 400 });
      }

      // Check if proposal has expired
      if (proposal.status === 'EXPIRED' || (proposal.valid_until && new Date(proposal.valid_until).getTime() < Date.now())) {
        if (proposal.status !== 'EXPIRED') {
          await execute("UPDATE proposals SET status = 'EXPIRED', updated_at = datetime('now') WHERE id = ?", [proposalId]);
          await recordAuditLog({
            userId,
            action: 'PROPOSAL_EXPIRED',
            entity: 'proposals',
            entityId: proposalId,
            metadata: { proposalNumber: proposal.proposal_number, version: proposal.version },
            ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });
        }
        return NextResponse.json({ error: 'This proposal has expired and cannot be approved. Please request an updated proposal.' }, { status: 400 });
      }

      // Idempotency: If already approved, return success, existing project, and existing initial invoice
      if (proposal.status === 'CLIENT_APPROVED') {
        const existingInv = await queryOne('SELECT id, invoice_number, status, amount_minor FROM invoices WHERE proposal_id = ? ORDER BY created_at ASC LIMIT 1', [proposalId]);
        return NextResponse.json({
          success: true,
          status: 'CLIENT_APPROVED',
          approvedVersion: proposal.approved_version || proposal.version,
          projectId: proposal.project_id,
          invoiceId: existingInv?.id,
          message: 'Proposal was already approved. Active project and initial invoice confirmed.',
        });
      }

      // Enforce valid status transition
      if (proposal.status !== 'SENT' && proposal.status !== 'VIEWED') {
        return NextResponse.json({ error: `Invalid transition: Cannot approve proposal in '${proposal.status}' state` }, { status: 400 });
      }

      const now = new Date().toISOString();
      let finalProjectId = proposal.project_id;
      let initialInvoiceId: string | null = null;

      await transaction(async (tx) => {
        // Idempotent Project creation: check if project already exists
        if (!finalProjectId) {
          const existingProject = await tx.queryOne('SELECT id FROM projects WHERE client_id = ? AND lead_id = ?', [proposal.client_id, proposal.lead_id]);
          if (existingProject) {
            finalProjectId = existingProject.id;
          } else {
            finalProjectId = `prj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const projectCode = `PRJ-${proposal.currency}-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

            await tx.execute(`
              INSERT INTO projects (
                id, code, title, description, client_id, representative_id, lead_id,
                status, payment_status, budget_minor, total_paid_minor, currency, country_id, created_at, updated_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, 'AWAITING_PAYMENT', 'UNPAID', ?, 0, ?, ?, datetime('now'), datetime('now'))
            `, [
              finalProjectId,
              projectCode,
              proposal.title,
              proposal.scope_of_work,
              proposal.client_id,
              proposal.representative_id,
              proposal.lead_id,
              proposal.total_amount_minor,
              proposal.currency,
              client.country_id,
            ]);

            // Milestones initialization (Pending project kickoff)
            const milestones = [
              ['Requirement Specs & Technical Architecture', 'Formal sign-off of deliverables and systems architecture.', 1, 'PENDING'],
              ['Core Platform Engineering', 'Full-stack engineering sprint covering core deliverables.', 2, 'PENDING'],
              ['Internal QA & Security Review', 'End-to-end integration and security vulnerability scans.', 3, 'PENDING'],
              ['Client Acceptance & Handover', 'Final user testing, deployment, and admin handover.', 4, 'PENDING'],
            ];

            for (const [mTitle, mDesc, mOrder, mStatus] of milestones) {
              const msId = `ms_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
              await tx.execute(`
                INSERT INTO project_milestones (id, project_id, title, description, order_index, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
              `, [msId, finalProjectId, mTitle, mDesc, mOrder, mStatus]);
            }
          }
        }

        // Initialize Payment Schedules and Initial Invoice idempotently
        const existingSchedules = await tx.query('SELECT * FROM payment_schedules WHERE proposal_id = ?', [proposalId]);
        if (existingSchedules.length === 0) {
          let scheduleItems: any[] = [];
          try {
            scheduleItems = JSON.parse(proposal.payment_schedule_json || '[]');
          } catch {
            scheduleItems = [];
          }

          if (scheduleItems.length === 0) {
            scheduleItems = [
              {
                name: '100% Full Upfront Payment',
                orderIndex: 1,
                percentageBps: 10000,
                amountMinor: proposal.total_amount_minor,
                isRequiredToStart: 1,
                billingTrigger: 'UPFRONT_APPROVAL',
              },
            ];
          }

          for (const item of scheduleItems) {
            const schedId = `psch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const isStartReq = item.isRequiredToStart ? 1 : 0;
            const schedStatus = isStartReq ? 'INVOICED' : 'SCHEDULED';

            // Insert payment schedule first to satisfy foreign key in invoices (payment_schedule_id)
            await tx.execute(`
              INSERT INTO payment_schedules (
                id, proposal_id, project_id, schedule_type, name, order_index,
                percentage_bps, amount_minor, currency, is_required_to_start,
                billing_trigger, status, invoice_id, created_at, updated_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `, [
              schedId,
              proposalId,
              finalProjectId,
              proposal.payment_structure_type || 'FULL_UPFRONT',
              item.name,
              item.orderIndex || 1,
              item.percentageBps,
              item.amountMinor,
              proposal.currency,
              isStartReq,
              item.billingTrigger || 'UPFRONT_APPROVAL',
              schedStatus,
              null,
            ]);

            if (isStartReq && !initialInvoiceId) {
              initialInvoiceId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
              const invNumber = await generateInvoiceNumber(proposal.currency);
              const dueDate = proposal.valid_until || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

              await tx.execute(`
                INSERT INTO invoices (
                  id, invoice_number, proposal_id, project_id, client_id, representative_id,
                  payment_schedule_id, title, description, amount_minor, amount_paid_minor,
                  codebridge_amount_minor, third_party_reimbursement_minor, line_items_json,
                  currency, status, due_date, issued_at, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'ISSUED', ?, datetime('now'), datetime('now'), datetime('now'))
              `, [
                initialInvoiceId,
                invNumber,
                proposalId,
                finalProjectId,
                proposal.client_id,
                proposal.representative_id,
                schedId,
                `${proposal.title} - ${item.name}`,
                `Initial invoice for ${item.name}. Project kickoff begins immediately after payment is verified.`,
                item.amountMinor,
                proposal.codebridge_total_minor ?? item.amountMinor,
                proposal.third_party_total_minor ?? 0,
                proposal.line_items_json || '[]',
                proposal.currency,
                dueDate,
              ]);

              await tx.execute(`
                UPDATE payment_schedules
                SET invoice_id = ?
                WHERE id = ?
              `, [initialInvoiceId, schedId]);

              await recordAuditLog({
                userId,
                action: 'INVOICE_ISSUED',
                entity: 'invoices',
                entityId: initialInvoiceId,
                metadata: {
                  invoiceNumber: invNumber,
                  amountMinor: item.amountMinor,
                  currency: proposal.currency,
                  scheduleName: item.name,
                },
                ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
              });
            }
          }
        } else {
          const existingInv = await tx.queryOne('SELECT id FROM invoices WHERE proposal_id = ? LIMIT 1', [proposalId]);
          initialInvoiceId = existingInv?.id || null;
        }

        // Update Proposal status to CLIENT_APPROVED
        await tx.execute(`
          UPDATE proposals
          SET status = 'CLIENT_APPROVED',
              project_id = ?,
              approved_at = ?,
              approved_version = ?,
              updated_at = ?
          WHERE id = ?
        `, [finalProjectId, now, proposal.version, now, proposalId]);

        // Advance linked lead to WON atomically
        if (proposal.lead_id) {
          await tx.execute(`
            UPDATE leads
            SET status = 'WON', updated_at = datetime('now')
            WHERE id = ?
          `, [proposal.lead_id]);

          // Migrate messages from lead to the new project
          await tx.execute(`
            UPDATE messages
            SET project_id = ?
            WHERE lead_id = ? AND project_id IS NULL
          `, [finalProjectId, proposal.lead_id]);

          // Migrate message read cursors from lead to the new project
          await tx.execute(`
            UPDATE message_read_cursors
            SET project_id = ?, lead_id = NULL
            WHERE lead_id = ? AND project_id IS NULL
          `, [finalProjectId, proposal.lead_id]);
        }
      });

      // Audit Log
      await recordAuditLog({
        userId,
        action: 'PROPOSAL_APPROVED',
        entity: 'proposals',
        entityId: proposalId,
        metadata: {
          proposalNumber: proposal.proposal_number,
          approvedVersion: proposal.version,
          projectId: finalProjectId,
          initialInvoiceId,
          amountMinor: proposal.total_amount_minor,
          currency: proposal.currency,
        },
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        status: 'CLIENT_APPROVED',
        approvedVersion: proposal.version,
        projectId: finalProjectId,
        invoiceId: initialInvoiceId,
        message: 'Proposal approved successfully. Project created in awaiting-payment status, and initial invoice issued.',
      });
    }

    // 4. ACTION: CLIENT_REJECT (Client rejects proposal with feedback)
    if (action === 'CLIENT_REJECT') {
      if (role !== 'CLIENT') {
        return NextResponse.json({ error: 'Forbidden: Only the designated client can reject this proposal' }, { status: 403 });
      }

      const client = await queryOne('SELECT id FROM clients WHERE user_id = ?', [userId]);
      if (!client || client.id !== proposal.client_id) {
        return NextResponse.json({ error: 'Forbidden: You do not own this proposal' }, { status: 403 });
      }

      if (proposal.status !== 'SENT' && proposal.status !== 'VIEWED') {
        return NextResponse.json({ error: `Invalid transition: Cannot reject proposal in '${proposal.status}' state` }, { status: 400 });
      }

      const { rejectionReason } = body;
      if (!rejectionReason || !rejectionReason.trim()) {
        return NextResponse.json({ error: 'Please provide a reason or modification request for the rejection.' }, { status: 400 });
      }

      const now = new Date().toISOString();
      await execute(`
        UPDATE proposals
        SET status = 'CLIENT_REJECTED',
            rejection_reason = ?,
            rejected_at = ?,
            updated_at = ?
        WHERE id = ?
      `, [rejectionReason.trim(), now, now, proposalId]);

      await recordAuditLog({
        userId,
        action: 'PROPOSAL_REJECTED',
        entity: 'proposals',
        entityId: proposalId,
        metadata: {
          proposalNumber: proposal.proposal_number,
          version: proposal.version,
          rejectionReason: rejectionReason.trim(),
        },
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        status: 'CLIENT_REJECTED',
        message: 'Proposal decline feedback recorded. Technical desk has been notified.',
      });
    }

    // 5. ACTION: CANCEL (Admin cancels proposal)
    if (action === 'CANCEL') {
      if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden: Only administrators can cancel proposals' }, { status: 403 });
      }

      if (proposal.status === 'CLIENT_APPROVED') {
        return NextResponse.json({ error: 'Approved proposals cannot be cancelled directly.' }, { status: 400 });
      }

      await execute(`
        UPDATE proposals
        SET status = 'CANCELLED', updated_at = datetime('now')
        WHERE id = ?
      `, [proposalId]);

      await recordAuditLog({
        userId,
        action: 'PROPOSAL_CANCELLED',
        entity: 'proposals',
        entityId: proposalId,
        metadata: { proposalNumber: proposal.proposal_number, version: proposal.version },
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({ success: true, status: 'CANCELLED' });
    }

    // 6. ACTION: EXPIRE (Admin or automatic system expires proposal)
    if (action === 'EXPIRE') {
      if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden: Only administrators can manually expire proposals' }, { status: 403 });
      }

      if (proposal.status !== 'SENT' && proposal.status !== 'VIEWED') {
        return NextResponse.json({ error: `Invalid transition: Cannot expire proposal in '${proposal.status}' status` }, { status: 400 });
      }

      const now = new Date().toISOString();
      await execute(`
        UPDATE proposals
        SET status = 'EXPIRED', updated_at = ?
        WHERE id = ?
      `, [now, proposalId]);

      await recordAuditLog({
        userId,
        action: 'PROPOSAL_EXPIRED',
        entity: 'proposals',
        entityId: proposalId,
        metadata: { proposalNumber: proposal.proposal_number, version: proposal.version, expiredAt: now },
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({ success: true, status: 'EXPIRED' });
    }

    return NextResponse.json({ error: 'Invalid proposal action requested' }, { status: 400 });
  } catch (err: any) {
    console.error('Failed to update proposal:', err);
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}
