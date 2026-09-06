// src/app/dashboard/client/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Plus,
  ShieldCheck,
  FileText,
  MessageSquare
} from 'lucide-react';

import ChatDrawer from '@/components/dashboard/ChatDrawer';

export default function ClientDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectionMode, setRejectionMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatEntityId, setChatEntityId] = useState<string | null>(null);
  const [chatEntityType, setChatEntityType] = useState<'LEAD' | 'PROJECT'>('PROJECT');

  const loadData = async () => {
    try {
      const [resMe, resProjects, resProposals, resInvoices] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/projects'),
        fetch('/api/proposals'),
        fetch('/api/invoices'),
      ]);

      if (resMe.ok) {
        const d = await resMe.json();
        setCurrentUser(d.user || null);
      }
      if (resProjects.ok) {
        const d = await resProjects.json();
        setProjects(d.projects || []);
      }
      if (resProposals.ok) {
        const d = await resProposals.json();
        setProposals(d.proposals || []);
      }
      if (resInvoices.ok) {
        const d = await resInvoices.json();
        setInvoices(d.invoices || []);
      }
    } catch (err) {
      console.error('Failed to load client data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openProposalReview = async (propId: string) => {
    try {
      const res = await fetch(`/api/proposals/${propId}`);
      if (res.ok) {
        const d = await res.json();
        setSelectedProposal(d.proposal);
        setRejectionMode(false);
        setRejectionReason('');
        setReviewModalOpen(true);
        // Refresh proposals list to reflect automatic VIEWED transition
        loadData();
      }
    } catch {
      alert('Failed to load proposal details.');
    }
  };

  const handleApprove = async (propId: string) => {
    try {
      const res = await fetch(`/api/proposals/${propId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLIENT_APPROVE' }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionFeedback(data.message || 'Proposal approved! Project kickoff initialized.');
        setReviewModalOpen(false);
        setTimeout(() => setActionFeedback(''), 5000);
        loadData();
      } else {
        alert(data.error || 'Failed to approve proposal.');
      }
    } catch {
      alert('Network error approving proposal.');
    }
  };

  const handleReject = async (propId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason or revision request.');
      return;
    }

    try {
      const res = await fetch(`/api/proposals/${propId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLIENT_REJECT', rejectionReason }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionFeedback(data.message || 'Feedback transmitted to technical desk.');
        setReviewModalOpen(false);
        setTimeout(() => setActionFeedback(''), 5000);
        loadData();
      } else {
        alert(data.error || 'Failed to reject proposal.');
      }
    } catch {
      alert('Network error submitting feedback.');
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--cb-text-muted)', padding: '20px' }}>Loading Client Workspace...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="cb-badge cb-badge-neutral" style={{ marginBottom: '8px' }}>
            <Briefcase size={13} /> Enterprise Client Portal
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            My Projects & Delivery Milestones
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            Real-time visibility into engineering sprints, architectural deliverables, and project status.
          </p>
          {currentUser?.client && (
            <div style={{
              marginTop: '10px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              border: '1px solid var(--cb-border-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--cb-text-secondary)'
            }}>
              <span>Client Entity: <strong style={{ color: '#FFFFFF' }}>{currentUser.client.companyName}</strong></span>
              {currentUser.client.industry && <span>&bull; Industry: {currentUser.client.industry}</span>}
              {currentUser.country?.name && <span>&bull; Market: {currentUser.country.name} ({currentUser.country.currency})</span>}
            </div>
          )}
        </div>

        <Link href="/request-project" className="cb-btn cb-btn-primary" style={{ gap: '8px' }}>
          <Plus size={16} /> Request New Service
        </Link>
      </div>

      {actionFeedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(5, 150, 105, 0.15)',
          border: '1px solid rgba(5, 150, 105, 0.3)',
          color: '#34D399',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px',
          fontSize: '13px'
        }}>
          <CheckCircle2 size={16} />
          {actionFeedback}
        </div>
      )}

      {/* Commercial Proposals Section */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
              Commercial Proposals & Quotes
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
              Review architectural scope, deliverables, and commercial pricing issued by CodeBridge.
            </p>
          </div>
          <span className="cb-badge cb-badge-neutral">{proposals.length} Proposals</span>
        </div>

        {proposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: 'var(--cb-text-muted)', fontSize: '13px' }}>
            No proposals awaiting review. When a proposal is issued for your requirements, it will appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {proposals.map((prop) => {
              const amountFormatted = ((prop.total_amount_minor || 0) / 100).toLocaleString();
              const isPendingAction = prop.status === 'SENT' || prop.status === 'VIEWED';

              return (
                <div key={prop.id} style={{
                  padding: '18px 20px',
                  borderRadius: '10px',
                  backgroundColor: isPendingAction ? 'rgba(30, 80, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  border: isPendingAction ? '1px solid rgba(30, 80, 255, 0.3)' : '1px solid var(--cb-border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--cb-font-mono)', fontSize: '12px', color: 'var(--cb-blue-400)', fontWeight: 700 }}>
                        {prop.proposal_number} (v{prop.version})
                      </span>
                      <span className={`cb-badge ${prop.status === 'CLIENT_APPROVED' ? 'cb-badge-emerald' : prop.status === 'CLIENT_REJECTED' ? 'cb-badge-rose' : 'cb-badge-amber'}`} style={{ fontSize: '10px' }}>
                        {prop.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                      {prop.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', marginTop: '2px' }}>
                      Deliverables: {prop.deliverables?.length || 0} items &bull; Valid until: {prop.valid_until || 'Open'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>Fixed Scope Total</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                        {amountFormatted} {prop.currency}
                      </div>
                    </div>

                    <button
                      onClick={() => openProposalReview(prop.id)}
                      className={`cb-btn cb-btn-sm ${isPendingAction ? 'cb-btn-primary' : 'cb-btn-secondary'}`}
                    >
                      {isPendingAction ? 'Review & Respond' : 'View Scope'} &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Commercial Invoices & Payment Schedule (Phase 2B) */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
              Commercial Invoices & Billing Settlements
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
              Official billing statements and milestones for your technology infrastructure.
            </p>
          </div>
          <span className="cb-badge cb-badge-neutral">{invoices.length} Invoices</span>
        </div>

        {/* Kickoff Policy Alert */}
        <div style={{
          padding: '14px 18px',
          borderRadius: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <Clock size={20} color="#60A5FA" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: '#BFDBFE', lineHeight: '1.5' }}>
            <strong>Project Kickoff Policy:</strong> CodeBridge operates on an upfront commercial model. Engineering delivery and sprint kickoff begin immediately once initial payment verification is confirmed by operations.
          </div>
        </div>

        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--cb-text-muted)' }}>
            <FileText size={32} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <p>No invoices issued yet. Upon approving an agreed proposal, your initial invoice will appear here.</p>
          </div>
        ) : (
          <div className="cb-table-container">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Scope / Description</th>
                  <th>Total Amount</th>
                  <th>Verified Paid</th>
                  <th>Outstanding Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const amountMinor = inv.amount_minor || 0;
                  const paidMinor = inv.amount_paid_minor || 0;
                  const balanceMinor = Math.max(0, amountMinor - paidMinor);
                  return (
                    <tr key={inv.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--cb-accent)' }}>
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{inv.title}</div>
                        {inv.project_code && (
                          <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>
                            Project: {inv.project_code}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                          {((amountMinor) / 100).toLocaleString()} {inv.currency}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: paidMinor > 0 ? '#34D399' : 'var(--cb-text-muted)', fontWeight: 600 }}>
                          {((paidMinor) / 100).toLocaleString()} {inv.currency}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: balanceMinor > 0 ? '#FBBF24' : '#10B981', fontWeight: 700 }}>
                          {balanceMinor > 0 ? `${((balanceMinor) / 100).toLocaleString()} ${inv.currency}` : 'Fully Settled'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--cb-text-secondary)' }}>
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`cb-badge ${
                          inv.status === 'PAID'
                            ? 'cb-badge-emerald'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'cb-badge-amber'
                            : inv.status === 'CANCELLED'
                            ? 'cb-badge-rose'
                            : 'cb-badge-blue'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Proposal Modal */}
      {reviewModalOpen && selectedProposal && (
        <div className="cb-modal-overlay">
          <div className="cb-modal" style={{ maxWidth: '640px' }}>
            <div className="cb-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--cb-font-mono)', fontSize: '12px', color: 'var(--cb-blue-400)', fontWeight: 700 }}>
                    {selectedProposal.proposal_number} (v{selectedProposal.version})
                  </span>
                  <span className={`cb-badge ${selectedProposal.status === 'CLIENT_APPROVED' ? 'cb-badge-emerald' : selectedProposal.status === 'CLIENT_REJECTED' ? 'cb-badge-rose' : 'cb-badge-amber'}`} style={{ fontSize: '10px' }}>
                    {selectedProposal.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                  {selectedProposal.title}
                </h3>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--cb-text-muted)', cursor: 'pointer', fontSize: '18px' }}
              >
                &times;
              </button>
            </div>

            <div className="cb-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Scope of Work
                </div>
                <div style={{ fontSize: '14px', color: 'var(--cb-text-primary)', lineHeight: 1.6, backgroundColor: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px' }}>
                  {selectedProposal.scope_of_work}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Deliverables & Milestones
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(selectedProposal.deliverables || []).map((item: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--cb-text-secondary)' }}>
                      <CheckCircle2 size={15} color="#34D399" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '14px 16px',
                backgroundColor: 'rgba(30, 80, 255, 0.08)',
                border: '1px solid rgba(30, 80, 255, 0.25)',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--cb-blue-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Commercial Payment Structure
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                  {selectedProposal.payment_structure_type === 'FULL_UPFRONT'
                    ? 'Option A: 100% Full Payment Upfront (Standard)'
                    : selectedProposal.payment_structure_type === 'DEPOSIT_MILESTONES'
                    ? 'Option B: Staged Milestones (Deposit + Milestones)'
                    : 'Option C: Custom Commercial Schedule'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
                  {selectedProposal.payment_structure_type === 'FULL_UPFRONT'
                    ? '100% upfront settlement upon approval. Project officially initiates into sprint planning upon verified receipt.'
                    : 'Initial required deposit is invoiced at approval. Subsequent milestones remain scheduled until technical deliverables are completed.'}
                </div>
              </div>

              {selectedProposal.paymentSchedule && selectedProposal.paymentSchedule.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Payment & Billing Milestones Schedule
                  </div>
                  <div style={{ borderRadius: '8px', border: '1px solid var(--cb-border-subtle)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--cb-text-secondary)' }}>
                        <tr>
                          <th style={{ padding: '8px 12px' }}>Milestone Scope</th>
                          <th style={{ padding: '8px 12px' }}>Percentage</th>
                          <th style={{ padding: '8px 12px' }}>Amount</th>
                          <th style={{ padding: '8px 12px' }}>Kickoff Trigger</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProposal.paymentSchedule.map((s: any, idx: number) => (
                          <tr key={idx} style={{ borderTop: '1px solid var(--cb-border-subtle)' }}>
                            <td style={{ padding: '8px 12px', color: '#FFFFFF', fontWeight: 600 }}>{s.title}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--cb-blue-400)' }}>{(s.percentage_bps / 100).toFixed(0)}%</td>
                            <td style={{ padding: '8px 12px', color: '#FFFFFF' }}>{((s.amount_minor || 0) / 100).toLocaleString()} {selectedProposal.currency}</td>
                            <td style={{ padding: '8px 12px' }}>
                              {s.is_required_to_start ? (
                                <span className="cb-badge cb-badge-amber" style={{ fontSize: '10px' }}>Required for Kickoff</span>
                              ) : (
                                <span className="cb-badge cb-badge-neutral" style={{ fontSize: '10px' }}>On Deliverable</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>Commercial Value</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>
                    {((selectedProposal.total_amount_minor || 0) / 100).toLocaleString()} {selectedProposal.currency}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>Validity Deadline</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cb-text-secondary)' }}>
                    {selectedProposal.valid_until || 'Standard 30 days'}
                  </div>
                </div>
              </div>

              {selectedProposal.terms_notes && (
                <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', marginBottom: '16px', fontStyle: 'italic' }}>
                  Terms & Notes: {selectedProposal.terms_notes}
                </div>
              )}

              {selectedProposal.status === 'CLIENT_REJECTED' && (
                <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)', color: '#FB7185', fontSize: '13px' }}>
                  <strong>Decline Reason:</strong> {selectedProposal.rejection_reason}
                </div>
              )}

              {rejectionMode && (
                <div style={{ marginTop: '16px' }}>
                  <label className="cb-label" style={{ color: '#FB7185' }}>
                    Please explain what requires adjustment or why you are declining:
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="cb-textarea"
                    placeholder="e.g. Please adjust the timeline, or revise scope item #2..."
                  />
                </div>
              )}
            </div>

            <div className="cb-modal-footer">
              {rejectionMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setRejectionMode(false)}
                    className="cb-btn cb-btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(selectedProposal.id)}
                    className="cb-btn cb-btn-danger"
                  >
                    Submit Revision / Decline Request
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="cb-btn cb-btn-secondary"
                  >
                    Close
                  </button>
                  {(selectedProposal.status === 'SENT' || selectedProposal.status === 'VIEWED') && (
                    <>
                      <button
                        type="button"
                        onClick={() => setRejectionMode(true)}
                        className="cb-btn cb-btn-outline"
                        style={{ color: '#FB7185', borderColor: 'rgba(225,29,72,0.3)' }}
                      >
                        Request Changes / Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedProposal.id)}
                        className="cb-btn cb-btn-primary"
                        style={{ backgroundColor: 'var(--cb-emerald-500)', borderColor: 'transparent' }}
                      >
                        Accept & Approve Proposal
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {projects.length === 0 ? (
        <div className="cb-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--cb-text-muted)' }}>
          <Briefcase size={36} style={{ margin: '0 auto 14px auto', opacity: 0.4 }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
            No Active Engineering Projects Yet
          </h3>
          <p style={{ fontSize: '13px', maxWidth: '460px', margin: '0 auto 20px auto', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
            Once you review and approve a commercial proposal, your engineering project, sprint milestones, and development deliverables will be tracked live here.
          </p>
          <Link href="/request-project" className="cb-btn cb-btn-secondary cb-btn-sm" style={{ gap: '6px' }}>
            <Plus size={14} /> Request a Project Scope
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {projects.map((proj) => {
            const completedCount = (proj.milestones || []).filter((m: any) => m.status === 'COMPLETED').length;
            const totalCount = (proj.milestones || []).length;
            const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isAwaitingPayment = proj.status === 'AWAITING_PAYMENT';

            return (
              <div key={proj.id} className="cb-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'var(--cb-font-mono)', fontSize: '12px', color: 'var(--cb-blue-400)', fontWeight: 700 }}>
                        {proj.code}
                      </span>
                      <span className={`cb-badge ${isAwaitingPayment ? 'cb-badge-amber' : proj.status === 'COMPLETED' ? 'cb-badge-emerald' : 'cb-badge-blue'}`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                      <span className="cb-badge cb-badge-neutral">{proj.country_name}</span>
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
                      {proj.title}
                    </h2>
                    <div style={{ fontSize: '13px', color: 'var(--cb-text-muted)', marginTop: '4px' }}>
                      Service: {proj.service_name || 'Custom Solution'} &bull; Client: {proj.company_name}
                    </div>
                  </div>

                  {proj.rep_first_name && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--cb-border-subtle)',
                      fontSize: '12px'
                    }}>
                      <div style={{ color: 'var(--cb-text-muted)', textTransform: 'uppercase', fontSize: '11px', marginBottom: '2px' }}>
                        Assigned Representative
                      </div>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {proj.rep_first_name} {proj.rep_last_name}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setChatEntityId(proj.id);
                      setChatEntityType('PROJECT');
                      setChatOpen(true);
                    }}
                    className="cb-btn cb-btn-secondary cb-btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <MessageSquare size={14} /> Message Team
                  </button>
                </div>

                {isAwaitingPayment && (
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(217, 119, 6, 0.12)',
                    border: '1px solid rgba(217, 119, 6, 0.3)',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#FBBF24',
                    fontSize: '13px'
                  }}>
                    <Clock size={20} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Awaiting Payment Verification:</strong> This project is waiting for verified receipt of the initial invoice settlement. Once confirmed by our finance desk, sprint kickoff begins immediately.
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--cb-text-secondary)' }}>Overall Project Completion</span>
                    <span style={{ fontWeight: 700, color: '#34D399' }}>{progressPct}% Completed</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progressPct}%`,
                      height: '100%',
                      backgroundColor: isAwaitingPayment ? 'var(--cb-amber-500)' : 'var(--cb-blue-600)',
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                {/* Milestones Timeline */}
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                  Project Milestones
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(proj.milestones || []).map((ms: any) => {
                    const isDone = ms.status === 'COMPLETED';
                    const isProg = ms.status === 'IN_PROGRESS';

                    return (
                      <div key={ms.id} style={{
                        padding: '14px 18px',
                        borderRadius: '10px',
                        backgroundColor: isDone ? 'rgba(5, 150, 105, 0.08)' : (isProg ? 'rgba(30, 80, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)'),
                        border: `1px solid ${isDone ? 'rgba(5, 150, 105, 0.25)' : (isProg ? 'rgba(30, 80, 255, 0.25)' : 'var(--cb-border-subtle)')}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {isDone && <CheckCircle2 size={20} color="#34D399" />}
                          {isProg && <Clock size={20} color="var(--cb-blue-400)" />}
                          {!isDone && !isProg && <Clock size={20} color="var(--cb-text-muted)" />}
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: isDone ? '#34D399' : '#FFFFFF' }}>
                              {ms.order_index}. {ms.title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
                              {ms.description}
                            </div>
                          </div>
                        </div>

                        <span className={`cb-badge ${isDone ? 'cb-badge-emerald' : isProg ? 'cb-badge-blue' : 'cb-badge-neutral'}`}>
                          {ms.status.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => {
          setChatOpen(false);
          loadData(); // Refresh unread count when chat is closed
        }}
        entityId={chatEntityId}
        entityType={chatEntityType}
        currentUser={currentUser}
      />
    </div>
  );
}
