import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, transaction } from '@/lib/db/connection';
import { getCurrentSession as getSession } from '@/lib/auth/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Only ADMIN/SUPER_ADMIN can review/update change requests for now
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Only administrators can update change requests' }, { status: 403 });
    }

    const { id: crId } = await params;
    
    const cr = await queryOne('SELECT * FROM change_requests WHERE id = ?', [crId]);
    if (!cr) return NextResponse.json({ error: 'Change request not found' }, { status: 404 });

    const body = await req.json();
    const { action, impactAssessment, reviewNotes, requiresProposalRevision } = body;
    
    const now = new Date().toISOString();

    if (action === 'APPROVE') {
      if (cr.status !== 'PENDING' && cr.status !== 'UNDER_REVIEW') {
         return NextResponse.json({ error: `Cannot approve from status ${cr.status}` }, { status: 400 });
      }
      
      await execute(`
        UPDATE change_requests
        SET status = 'APPROVED',
            impact_assessment = COALESCE(?, impact_assessment),
            review_notes = COALESCE(?, review_notes),
            requires_proposal_revision = COALESCE(?, requires_proposal_revision),
            reviewed_by = ?,
            reviewed_at = ?,
            updated_at = ?
        WHERE id = ?
      `, [
        impactAssessment || null,
        reviewNotes || null,
        requiresProposalRevision ? 1 : 0,
        session.userId,
        now,
        now,
        crId
      ]);
      
      return NextResponse.json({ success: true, status: 'APPROVED' });
    }
    
    if (action === 'REJECT') {
      if (cr.status !== 'PENDING' && cr.status !== 'UNDER_REVIEW') {
         return NextResponse.json({ error: `Cannot reject from status ${cr.status}` }, { status: 400 });
      }

      await execute(`
        UPDATE change_requests
        SET status = 'REJECTED',
            review_notes = COALESCE(?, review_notes),
            reviewed_by = ?,
            reviewed_at = ?,
            updated_at = ?
        WHERE id = ?
      `, [
        reviewNotes || null,
        session.userId,
        now,
        now,
        crId
      ]);

      return NextResponse.json({ success: true, status: 'REJECTED' });
    }

    if (action === 'UPDATE_IMPACT') {
      await execute(`
        UPDATE change_requests
        SET status = 'UNDER_REVIEW',
            impact_assessment = ?,
            requires_proposal_revision = ?,
            updated_at = ?
        WHERE id = ?
      `, [
        impactAssessment || null,
        requiresProposalRevision ? 1 : 0,
        now,
        crId
      ]);
      return NextResponse.json({ success: true, status: 'UNDER_REVIEW' });
    }
    
    if (action === 'MARK_IMPLEMENTED') {
      if (cr.status !== 'APPROVED') {
         return NextResponse.json({ error: `Cannot mark implemented from status ${cr.status}` }, { status: 400 });
      }
      
      await execute(`
        UPDATE change_requests
        SET status = 'IMPLEMENTED',
            updated_at = ?
        WHERE id = ?
      `, [now, crId]);

      return NextResponse.json({ success: true, status: 'IMPLEMENTED' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Failed to update change request:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
