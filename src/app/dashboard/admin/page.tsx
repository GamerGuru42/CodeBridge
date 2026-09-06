// src/app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  Filter,
  Check,
  Plus,
  Send,
  FileText,
  Clock,
  X,
  RefreshCw,
  Eye,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

import ChatDrawer from '@/components/dashboard/ChatDrawer';

export default function AdminOpsDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [reps, setReps] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [selectedLeadForProposal, setSelectedLeadForProposal] = useState<any>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatEntityId, setChatEntityId] = useState<string | null>(null);
  const [chatEntityType, setChatEntityType] = useState<'LEAD' | 'PROJECT'>('LEAD');

  // Filters and search
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState('ALL');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [proposalFilterStatus, setProposalFilterStatus] = useState('ALL');
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');

  // Payment Verification Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    verificationSource: 'MANUAL_VERIFICATION',
    reference: '',
    verificationNotes: '',
  });

  // Proposal Form State
  const [proposalForm, setProposalForm] = useState({
    title: '',
    scopeOfWork: '',
    deliverables: 'Custom UI/UX System Architecture\nScalable API & Database Engineering\nInternal Quality Assurance & UAT\nProduction Deployment & Handover',
    paymentStructureType: 'FULL_UPFRONT',
    totalAmount: '280000',
    currency: 'KES',
    validDays: 14,
    termsNotes: 'Standard 4-milestone engineering schedule with 100% CodeBridge warranty.',
    status: 'SENT',
  });

  const loadData = async () => {
    try {
      const [resMe, resLeads, resReps, resProjects, resProposals, resInvoices] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/leads'),
        fetch('/api/admin/representatives'),
        fetch('/api/projects'),
        fetch('/api/proposals'),
        fetch('/api/invoices'),
      ]);

      if (resMe.ok) {
        const d = await resMe.json();
        setCurrentUser(d.user || null);
      }
      if (resLeads.ok) {
        const d = await resLeads.json();
        setLeads(d.leads || []);
      }
      if (resReps.ok) {
        const d = await resReps.json();
        setReps(d.representatives || []);
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
      console.error('Failed to load operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoiceForPayment(invoice);
    const unpaidMinor = invoice.amount_minor - invoice.amount_paid_minor;
    setPaymentForm({
      amount: (unpaidMinor / 100).toFixed(2),
      paymentMethod: 'BANK_TRANSFER',
      verificationSource: 'MANUAL_VERIFICATION',
      reference: `WIRE-${invoice.currency}-${Date.now().toString().slice(-6)}`,
      verificationNotes: `Direct wire confirmed via bank statement by operations admin.`,
    });
    setPaymentModalOpen(true);
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    try {
      const cleanMinor = Math.round(parseFloat(paymentForm.amount) * 100);
      const res = await fetch(`/api/invoices/${selectedInvoiceForPayment.id}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountMinor: cleanMinor,
          currency: selectedInvoiceForPayment.currency,
          paymentMethod: paymentForm.paymentMethod,
          verificationSource: paymentForm.verificationSource,
          reference: paymentForm.reference,
          verificationNotes: paymentForm.verificationNotes,
        }),
      });

      const d = await res.json();
      if (!res.ok) {
        setFeedback(d.error || 'Payment verification failed');
        return;
      }

      setFeedback(`✅ ${d.message}`);
      setPaymentModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback('Failed to verify payment');
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string, convertToClient: boolean = false) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, convertToClient }),
      });

      if (res.ok) {
        const d = await res.json();
        setFeedback(d.message || `Lead status updated to ${status}.`);
        setTimeout(() => setFeedback(''), 4000);
        loadData();
      }
    } catch {
      alert('Failed to update lead status.');
    }
  };

  const handleOpenProposalModal = (lead?: any) => {
    if (lead) {
      setSelectedLeadForProposal(lead);
      setProposalForm({
        title: `Digital Transformation for ${lead.business_name}`,
        scopeOfWork: `Design, engineer, and deploy high-performance software system tailored to ${lead.business_type} operations.`,
        deliverables: 'Custom UI/UX System Architecture\nScalable API & Database Engineering\nInternal Quality Assurance & UAT\nProduction Deployment & Handover',
        paymentStructureType: 'FULL_UPFRONT',
        totalAmount: ((lead.estimated_budget_minor || 28000000) / 100).toString(),
        currency: lead.currency || 'KES',
        validDays: 14,
        termsNotes: 'Standard 4-milestone engineering schedule with 100% CodeBridge warranty.',
        status: 'SENT',
      });
    } else {
      setSelectedLeadForProposal(null);
      setProposalForm({
        title: 'Custom Engineering & Digital Infrastructure',
        scopeOfWork: 'End-to-end full-stack software development, cloud infrastructure setup, and administrative enablement.',
        deliverables: 'Custom UI/UX System Architecture\nScalable API & Database Engineering\nInternal Quality Assurance & UAT\nProduction Deployment & Handover',
        paymentStructureType: 'FULL_UPFRONT',
        totalAmount: '280000',
        currency: 'KES',
        validDays: 14,
        termsNotes: 'Standard 4-milestone engineering schedule with 100% CodeBridge warranty.',
        status: 'SENT',
      });
    }
    setProposalModalOpen(true);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanMinor = Math.round(parseFloat(proposalForm.totalAmount) * 100);
      if (isNaN(cleanMinor) || cleanMinor <= 0) {
        alert('Please specify a valid positive pricing amount.');
        return;
      }

      const deliverablesArray = proposalForm.deliverables
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const validUntil = new Date(Date.now() + proposalForm.validDays * 86400000).toISOString();

      const payload: any = {
        title: proposalForm.title.trim(),
        scopeOfWork: proposalForm.scopeOfWork.trim(),
        deliverables: deliverablesArray,
        paymentStructureType: proposalForm.paymentStructureType,
        totalAmountMinor: cleanMinor,
        currency: proposalForm.currency,
        validUntil,
        termsNotes: proposalForm.termsNotes.trim(),
        status: proposalForm.status,
      };

      if (selectedLeadForProposal) {
        payload.leadId = selectedLeadForProposal.id;
      }

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (res.ok) {
        setProposalModalOpen(false);
        setFeedback(`Commercial proposal ${d.proposal.proposalNumber} created successfully (${d.proposal.status}).`);
        setTimeout(() => setFeedback(''), 5000);
        loadData();
      } else {
        alert(d.error || 'Failed to create proposal.');
      }
    } catch {
      alert('Error submitting proposal request.');
    }
  };

  const handleSendProposal = async (proposalId: string) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND' }),
      });

      if (res.ok) {
        setFeedback('Proposal transmitted to client for formal review.');
        setTimeout(() => setFeedback(''), 4000);
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to send proposal.');
      }
    } catch {
      alert('Network error sending proposal.');
    }
  };

  const handleCancelProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to cancel this proposal?')) return;
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL' }),
      });

      if (res.ok) {
        setFeedback('Proposal cancelled.');
        setTimeout(() => setFeedback(''), 4000);
        loadData();
      }
    } catch {
      alert('Failed to cancel proposal.');
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--cb-text-muted)', padding: '20px' }}>Loading CodeBridge Operations Console...</div>;
  }

  const filteredProposals = proposals.filter((p) => {
    const matchesStatus = proposalFilterStatus === 'ALL' || p.status === proposalFilterStatus;
    const q = proposalSearchQuery.trim().toLowerCase();
    const matchesQuery = !q ||
      (p.proposal_number && p.proposal_number.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.company_name && p.company_name.toLowerCase().includes(q)) ||
      (p.lead_business_name && p.lead_business_name.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = invoiceFilterStatus === 'ALL' || inv.status === invoiceFilterStatus;
    const q = invoiceSearchQuery.trim().toLowerCase();
    const matchesQuery = !q ||
      (inv.invoice_number && inv.invoice_number.toLowerCase().includes(q)) ||
      (inv.title && inv.title.toLowerCase().includes(q)) ||
      (inv.company_name && inv.company_name.toLowerCase().includes(q)) ||
      (inv.project_code && inv.project_code.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="cb-badge cb-badge-blue" style={{ marginBottom: '8px' }}>
            <LayoutDashboard size={13} /> Operations & Delivery Console
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Platform Operations & Commercial Engine
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            Manage commercial proposals, client contract sign-offs, and project execution across regional hubs.
          </p>
        </div>

        <button
          onClick={() => handleOpenProposalModal()}
          className="cb-btn cb-btn-primary"
          style={{ gap: '8px' }}
        >
          <Plus size={16} /> Author Commercial Proposal
        </button>
      </div>

      {feedback && (
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
          {feedback}
        </div>
      )}

      {/* Operational Stats Grid */}
      <div className="cb-grid-4" style={{ marginBottom: '32px' }}>
        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Pipeline Leads
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>{leads.length} Leads</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            {leads.filter(l => l.status === 'NEW').length} requiring qualification
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px', borderLeft: '4px solid var(--cb-blue-500)' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Commercial Proposals
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#60A5FA' }}>{proposals.length} Proposals</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            {proposals.filter(p => p.status === 'CLIENT_APPROVED').length} accepted & won
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Active Engineering
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>{projects.length} Projects</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            In development and quality review
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Field Representatives
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>{reps.length} Reps</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            {reps.filter(r => r.approval_status === 'ACTIVE').length} active in Kenya & Nigeria
          </div>
        </div>
      </div>

      {/* Commercial Proposals Management Table */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
              Commercial Proposals & Client Transmittals (Phase 2A)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
              Track proposal lifecycle: DRAFT &rarr; SENT &rarr; VIEWED &rarr; CLIENT_APPROVED / CLIENT_REJECTED. Versioning preserves historical revisions.
            </p>
          </div>
          <span className="cb-badge cb-badge-neutral">{filteredProposals.length} of {proposals.length} Proposals</span>
        </div>

        {/* Proposals Filter & Search Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'DRAFT', 'SENT', 'VIEWED', 'CLIENT_APPROVED', 'CLIENT_REJECTED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setProposalFilterStatus(st)}
                className={`cb-btn cb-btn-sm ${proposalFilterStatus === st ? 'cb-btn-primary' : 'cb-btn-outline'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={proposalSearchQuery}
            onChange={(e) => setProposalSearchQuery(e.target.value)}
            placeholder="Search proposals / clients..."
            className="cb-input"
            style={{ width: '220px', padding: '6px 12px', fontSize: '12px' }}
          />
        </div>

        {proposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--cb-text-muted)', fontSize: '13px' }}>
            No proposals drafted yet. Click "Author Commercial Proposal" to create a scope for a client.
          </div>
        ) : filteredProposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--cb-text-muted)', fontSize: '13px' }}>
            No proposals match your active filter criteria.
          </div>
        ) : (
          <div className="cb-table-container">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Proposal & Version</th>
                  <th>Client / Lead</th>
                  <th>Scope Title</th>
                  <th>Fixed Value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((p) => {
                  const amountFormatted = ((p.total_amount_minor || 0) / 100).toLocaleString();
                  const statusColors: any = {
                    DRAFT: 'cb-badge-neutral',
                    SENT: 'cb-badge-blue',
                    VIEWED: 'cb-badge-purple',
                    CLIENT_APPROVED: 'cb-badge-emerald',
                    CLIENT_REJECTED: 'cb-badge-rose',
                    EXPIRED: 'cb-badge-amber',
                    CANCELLED: 'cb-badge-neutral',
                  };

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '13px' }}>
                          {p.proposal_number}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>
                          Version {p.version} &bull; {p.country_code || 'KE'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>
                          {p.company_name || p.lead_business_name || 'Direct Business'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>
                          {p.industry || 'Technology'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', fontWeight: 500 }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>
                          {p.deliverables?.length || 0} Deliverables
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                          {amountFormatted} {p.currency}
                        </span>
                      </td>
                      <td>
                        <span className={`cb-badge ${statusColors[p.status] || 'cb-badge-blue'}`}>
                          {p.status}
                        </span>
                        {p.status === 'CLIENT_REJECTED' && p.rejection_reason && (
                          <div style={{ fontSize: '11px', color: '#F87171', marginTop: '4px', maxWidth: '200px' }}>
                            Feedback: {p.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {p.status === 'DRAFT' && (
                            <button
                              onClick={() => handleSendProposal(p.id)}
                              className="cb-btn cb-btn-primary cb-btn-sm"
                              style={{ gap: '4px' }}
                            >
                              <Send size={11} /> Send
                            </button>
                          )}
                          {p.status === 'CLIENT_REJECTED' && (
                            <button
                              onClick={() => {
                                setSelectedLeadForProposal({ id: p.lead_id, business_name: p.company_name, estimated_budget_minor: p.total_amount_minor, currency: p.currency });
                                setProposalForm({
                                  title: p.title + ' (Revised)',
                                  scopeOfWork: p.scope_of_work,
                                  deliverables: p.deliverables?.join('\n') || '',
                                  paymentStructureType: p.payment_structure_type || 'FULL_UPFRONT',
                                  totalAmount: ((p.total_amount_minor || 0) / 100).toString(),
                                  currency: p.currency,
                                  validDays: 14,
                                  termsNotes: p.terms_notes || '',
                                  status: 'SENT',
                                });
                                setProposalModalOpen(true);
                              }}
                              className="cb-btn cb-btn-secondary cb-btn-sm"
                              style={{ gap: '4px' }}
                            >
                              <RefreshCw size={11} /> Revise (v{p.version + 1})
                            </button>
                          )}
                          {p.status === 'CLIENT_APPROVED' && (
                            <span style={{ fontSize: '12px', color: '#34D399', fontWeight: 600 }}>
                              Won &bull; Project Active
                            </span>
                          )}
                          {['DRAFT', 'SENT', 'VIEWED'].includes(p.status) && (
                            <button
                              onClick={() => handleCancelProposal(p.id)}
                              className="cb-btn cb-btn-secondary cb-btn-sm"
                              style={{ color: '#F87171' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Commercial Billing & Invoices Management Table */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
              Commercial Billing & Invoices Console
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
              Verify client settlements to officially kick off projects and log factual commission events for Phase 2D.
            </p>
          </div>
          <span className="cb-badge cb-badge-neutral">{filteredInvoices.length} of {invoices.length} Invoices</span>
        </div>

        {/* Invoice Filter & Search Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setInvoiceFilterStatus(st)}
                className={`cb-btn cb-btn-sm ${invoiceFilterStatus === st ? 'cb-btn-primary' : 'cb-btn-outline'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={invoiceSearchQuery}
            onChange={(e) => setInvoiceSearchQuery(e.target.value)}
            placeholder="Search invoices / clients..."
            className="cb-input"
            style={{ width: '220px', padding: '6px 12px', fontSize: '12px' }}
          />
        </div>

        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--cb-text-muted)' }}>
            <FileText size={32} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <p>No commercial invoices issued yet. Approve a proposal to generate an upfront invoice.</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--cb-text-muted)' }}>
            <p>No invoices match your active filter criteria.</p>
          </div>
        ) : (
          <div className="cb-table-container">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client / Company</th>
                  <th>Project / Milestone Scope</th>
                  <th>Amount Due</th>
                  <th>Verified Paid</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Billing Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const amountFmt = ((inv.amount_minor || 0) / 100).toLocaleString();
                  const paidFmt = ((inv.amount_paid_minor || 0) / 100).toLocaleString();
                  const remainingFmt = (((inv.amount_minor || 0) - (inv.amount_paid_minor || 0)) / 100).toLocaleString();
                  return (
                    <tr key={inv.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--cb-accent)' }}>
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{inv.company_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>{inv.country_code}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--cb-text-primary)' }}>{inv.title}</div>
                        {inv.project_code && (
                          <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>
                            Project: {inv.project_code} &bull; Status: {inv.project_status}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                          {amountFmt} {inv.currency}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: inv.amount_paid_minor > 0 ? '#34D399' : 'var(--cb-text-muted)', fontWeight: 600 }}>
                          {paidFmt} {inv.currency}
                        </span>
                        {inv.status === 'PARTIALLY_PAID' && (
                          <div style={{ fontSize: '10px', color: '#FBBF24' }}>
                            Rem: {remainingFmt} {inv.currency}
                          </div>
                        )}
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
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => openPaymentModal(inv)}
                              className="cb-btn cb-btn-primary cb-btn-sm"
                              style={{ gap: '4px', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' }}
                            >
                              <CheckCircle2 size={13} /> Verify Payment
                            </button>
                          )}
                          {inv.status === 'ISSUED' && (
                            <button
                              onClick={async () => {
                                if (confirm(`Cancel invoice ${inv.invoice_number}?`)) {
                                  await fetch(`/api/invoices/${inv.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'CANCEL' }),
                                  });
                                  loadData();
                                }
                              }}
                              className="cb-btn cb-btn-secondary cb-btn-sm"
                              style={{ color: '#F87171' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Pipeline Management Table */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
              Commercial Lead Lifecycle & Qualification
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
              Advance pipeline: NEW &rarr; CONTACTED &rarr; QUALIFIED &rarr; REQUIREMENTS_COLLECTED &rarr; PROPOSAL.
            </p>
          </div>
          <span className="cb-badge cb-badge-neutral">{leads.length} Leads</span>
        </div>

        <div className="cb-table-container">
          <table className="cb-table">
            <thead>
              <tr>
                <th>Business & Contact</th>
                <th>Country</th>
                <th>Service / Scope</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Assigned Rep</th>
                <th>Pipeline Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => {
                const budgetFormatted = ((l.estimated_budget_minor || 0) / 100).toLocaleString();
                return (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{l.business_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>
                        {l.contact_person} &bull; {l.email}
                      </div>
                    </td>
                    <td>
                      <span className="cb-badge cb-badge-neutral">{l.country_name} ({l.country_code})</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: 'var(--cb-text-secondary)' }}>{l.business_type}</div>
                      <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.requirements}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {budgetFormatted} {l.currency}
                      </span>
                    </td>
                    <td>
                      <span className={`cb-badge ${l.status === 'WON' ? 'cb-badge-emerald' : l.status === 'LOST' ? 'cb-badge-rose' : 'cb-badge-blue'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--cb-text-secondary)' }}>
                        {l.rep_first_name ? `${l.rep_first_name} ${l.rep_last_name}` : 'Unassigned (Direct Web)'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {l.status !== 'WON' && l.status !== 'LOST' && (
                          <>
                            {l.status === 'NEW' && (
                              <button
                                onClick={() => handleUpdateStatus(l.id, 'CONTACTED')}
                                className="cb-btn cb-btn-secondary cb-btn-sm"
                              >
                                Contacted
                              </button>
                            )}
                            {l.status === 'CONTACTED' && (
                              <button
                                onClick={() => handleUpdateStatus(l.id, 'QUALIFIED')}
                                className="cb-btn cb-btn-secondary cb-btn-sm"
                              >
                                Qualify
                              </button>
                            )}
                            {l.status === 'QUALIFIED' && (
                              <button
                                onClick={() => handleUpdateStatus(l.id, 'REQUIREMENTS_COLLECTED')}
                                className="cb-btn cb-btn-secondary cb-btn-sm"
                              >
                                Scoped
                              </button>
                            )}
                            {['QUALIFIED', 'REQUIREMENTS_COLLECTED'].includes(l.status) && (
                              <button
                                onClick={() => handleOpenProposalModal(l)}
                                className="cb-btn cb-btn-primary cb-btn-sm"
                                style={{ gap: '4px' }}
                              >
                                <FileText size={12} /> Create Proposal
                              </button>
                            )}
                          </>
                        )}
                        {l.status === 'WON' && (
                          <span style={{ fontSize: '12px', color: '#34D399', fontWeight: 600 }}>
                            Won via Proposal Approval
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setChatEntityId(l.id);
                            setChatEntityType('LEAD');
                            setChatOpen(true);
                          }}
                          className="cb-btn cb-btn-secondary cb-btn-sm"
                          style={{ gap: '4px' }}
                        >
                          <MessageSquare size={12} /> Chat
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Author Proposal Modal */}
      {proposalModalOpen && (
        <div className="cb-modal-overlay">
          <div className="cb-modal" style={{ maxWidth: '650px' }}>
            <div className="cb-modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                Author Commercial Proposal (Phase 2A)
              </h3>
              <button
                onClick={() => setProposalModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--cb-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProposal}>
              <div className="cb-modal-body">
                {selectedLeadForProposal && (
                  <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '16px', fontSize: '13px', color: '#93C5FD' }}>
                    Authoring proposal for lead: <strong>{selectedLeadForProposal.business_name}</strong> ({selectedLeadForProposal.currency})
                  </div>
                )}

                <div className="cb-form-group">
                  <label className="cb-label">Proposal Title *</label>
                  <input
                    type="text"
                    required
                    value={proposalForm.title}
                    onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                    className="cb-input"
                    placeholder="e.g. Enterprise Booking & Payment Infrastructure"
                  />
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Scope of Work *</label>
                  <textarea
                    required
                    rows={3}
                    value={proposalForm.scopeOfWork}
                    onChange={(e) => setProposalForm({ ...proposalForm, scopeOfWork: e.target.value })}
                    className="cb-textarea"
                    placeholder="Describe technical objectives, system architecture, and solution components..."
                  />
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Deliverables (One per line) *</label>
                  <textarea
                    required
                    rows={4}
                    value={proposalForm.deliverables}
                    onChange={(e) => setProposalForm({ ...proposalForm, deliverables: e.target.value })}
                    className="cb-textarea"
                    placeholder="Deliverable item 1&#10;Deliverable item 2"
                  />
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Currency *</label>
                    <select
                      value={proposalForm.currency}
                      onChange={(e) => setProposalForm({ ...proposalForm, currency: e.target.value })}
                      className="cb-select"
                    >
                      <option value="KES">KES (Kenya Shillings)</option>
                      <option value="NGN">NGN (Nigerian Naira)</option>
                    </select>
                  </div>

                  <div className="cb-form-group">
                    <label className="cb-label">Fixed Project Total ({proposalForm.currency}) *</label>
                    <input
                      type="number"
                      required
                      step="1"
                      value={proposalForm.totalAmount}
                      onChange={(e) => setProposalForm({ ...proposalForm, totalAmount: e.target.value })}
                      className="cb-input"
                      placeholder="e.g. 280000"
                    />
                    <span style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>
                      Stored safely in integer minor units ({Math.round(parseFloat(proposalForm.totalAmount || '0') * 100)} minor)
                    </span>
                  </div>
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Payment Commercial Structure *</label>
                  <select
                    value={proposalForm.paymentStructureType}
                    onChange={(e) => setProposalForm({ ...proposalForm, paymentStructureType: e.target.value })}
                    className="cb-select"
                  >
                    <option value="FULL_UPFRONT">Option A: 100% Full Payment Upfront (Default)</option>
                    <option value="DEPOSIT_MILESTONES">Option B: 50% Deposit / 30% Milestone / 20% Handover</option>
                  </select>
                  <span style={{ fontSize: '11px', color: 'var(--cb-text-secondary)', display: 'block', marginTop: '4px' }}>
                    {proposalForm.paymentStructureType === 'FULL_UPFRONT'
                      ? '• Default Model: Proposal approval issues a 100% upfront invoice. Project kicks off strictly after verified payment.'
                      : '• Staged Model: Issues a 50% deposit invoice upon approval to start project. Remaining 30% and 20% milestones are invoiced when work/handover triggers occur.'}
                  </span>
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Validity Period (Days)</label>
                    <input
                      type="number"
                      value={proposalForm.validDays}
                      onChange={(e) => setProposalForm({ ...proposalForm, validDays: parseInt(e.target.value) || 14 })}
                      className="cb-input"
                    />
                  </div>

                  <div className="cb-form-group">
                    <label className="cb-label">Initial Status</label>
                    <select
                      value={proposalForm.status}
                      onChange={(e) => setProposalForm({ ...proposalForm, status: e.target.value })}
                      className="cb-select"
                    >
                      <option value="SENT">SENT (Direct to Client Review)</option>
                      <option value="DRAFT">DRAFT (Internal Review First)</option>
                    </select>
                  </div>
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Terms & Warranty Notes</label>
                  <input
                    type="text"
                    value={proposalForm.termsNotes}
                    onChange={(e) => setProposalForm({ ...proposalForm, termsNotes: e.target.value })}
                    className="cb-input"
                  />
                </div>
              </div>

              <div className="cb-modal-footer">
                <button
                  type="button"
                  onClick={() => setProposalModalOpen(false)}
                  className="cb-btn cb-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="cb-btn cb-btn-primary" style={{ gap: '6px' }}>
                  <Send size={14} /> Transmit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Payment Modal (Phase 2B) */}
      {paymentModalOpen && selectedInvoiceForPayment && (
        <div className="cb-modal-overlay">
          <div className="cb-modal" style={{ maxWidth: '600px' }}>
            <div className="cb-modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#10B981" /> Verify Payment & Authorize Settlement
              </h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--cb-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVerifyPayment}>
              <div className="cb-modal-body">
                {/* Summary banner */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  marginBottom: '18px',
                  fontSize: '13px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--cb-text-muted)' }}>Invoice Number:</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--cb-accent)' }}>{selectedInvoiceForPayment.invoice_number}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--cb-text-muted)' }}>Client / Company:</span>
                    <strong style={{ color: '#FFFFFF' }}>{selectedInvoiceForPayment.company_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--cb-text-muted)' }}>Total Invoiced:</span>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {((selectedInvoiceForPayment.amount_minor || 0) / 100).toLocaleString()} {selectedInvoiceForPayment.currency}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--cb-text-muted)' }}>Remaining Unpaid:</span>
                    <span style={{ fontWeight: 700, color: '#FBBF24' }}>
                      {(((selectedInvoiceForPayment.amount_minor || 0) - (selectedInvoiceForPayment.amount_paid_minor || 0)) / 100).toLocaleString()} {selectedInvoiceForPayment.currency}
                    </span>
                  </div>
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Amount to Verify ({selectedInvoiceForPayment.currency}) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="cb-input"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="cb-form-group">
                    <label className="cb-label">Transaction Reference *</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.reference}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                      className="cb-input"
                      placeholder="e.g. TXN-WIRE-00123"
                    />
                    <span style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>
                      Must be unique across all verified settlements
                    </span>
                  </div>
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Payment Method (Client Channel) *</label>
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="cb-select"
                    >
                      <option value="BANK_TRANSFER">Bank Wire / Electronic Transfer</option>
                      <option value="CASH">Cash Settlement</option>
                      <option value="OTHER_MANUAL">Other Manual Channel</option>
                      <option value="GATEWAY_SIMULATION">Gateway Simulation</option>
                    </select>
                  </div>

                  <div className="cb-form-group">
                    <label className="cb-label">Verification Source (Authenticity) *</label>
                    <select
                      value={paymentForm.verificationSource}
                      onChange={(e) => setPaymentForm({ ...paymentForm, verificationSource: e.target.value })}
                      className="cb-select"
                    >
                      <option value="MANUAL_VERIFICATION">Manual Bank Statement Check</option>
                      <option value="BANK_TRANSFER_CONFIRMATION">Bank Transfer Confirmation Slip</option>
                      <option value="GATEWAY_SIMULATION">Gateway Simulation</option>
                    </select>
                  </div>
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Verification Audit Notes</label>
                  <textarea
                    rows={2}
                    value={paymentForm.verificationNotes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, verificationNotes: e.target.value })}
                    className="cb-textarea"
                    placeholder="Internal reference, bank deposit slip details, or account confirmation notes..."
                  />
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontSize: '12px',
                  color: '#93C5FD',
                  lineHeight: '1.5',
                }}>
                  <strong>Atomic Execution:</strong> Recording verification atomically updates invoice & project balances, evaluates project start criteria, and produces an immutable Commission Event for Phase 2D.
                </div>
              </div>

              <div className="cb-modal-footer">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="cb-btn cb-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cb-btn cb-btn-primary"
                  style={{ gap: '6px', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' }}
                >
                  <CheckCircle2 size={15} /> Confirm & Verify Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => {
          setChatOpen(false);
          loadData();
        }}
        entityId={chatEntityId}
        entityType={chatEntityType}
        currentUser={currentUser}
      />
    </div>
  );
}
