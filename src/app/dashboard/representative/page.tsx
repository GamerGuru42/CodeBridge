// src/app/dashboard/representative/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  DollarSign,
  Layers,
  Clock
} from 'lucide-react';

export default function RepresentativeDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Add lead form state
  const [newLead, setNewLead] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: 'Restaurant & Hospitality',
    requirements: '',
    estimatedBudget: '280000',
    currency: 'KES',
    notes: '',
  });

  const loadData = async () => {
    try {
      const [resMe, resLeads, resProposals, resInvoices] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/leads'),
        fetch('/api/proposals'),
        fetch('/api/invoices'),
      ]);

      if (resMe.ok) {
        const d = await resMe.json();
        setCurrentUser(d.user);
        if (d.user?.country?.currency) {
          setNewLead((prev) => ({
            ...prev,
            currency: d.user.country.currency,
            estimatedBudget: d.user.country.currency === 'NGN' ? '1800000' : '280000',
          }));
        }
      }

      if (resLeads.ok) {
        const d = await resLeads.json();
        setLeads(d.leads || []);
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
      console.error('Failed to load representative dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          countryCode: currentUser?.country?.code || 'KE',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setFeedback('New business lead registered into your pipeline!');
        setTimeout(() => setFeedback(''), 4000);
        setNewLead({
          businessName: '',
          contactPerson: '',
          email: '',
          phone: '',
          businessType: 'Business Websites',
          requirements: '',
          estimatedBudget: '250000',
          currency: currentUser?.country?.currency || 'KES',
          notes: '',
        });
        loadData();
      } else {
        alert(data.error || 'Failed to create lead.');
      }
    } catch {
      alert('Network error submitting lead.');
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
        const data = await res.json();
        setFeedback(data.message || `Lead status advanced to ${status}.`);
        setTimeout(() => setFeedback(''), 4000);
        loadData();
      }
    } catch {
      alert('Failed to update lead status.');
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--cb-text-muted)', padding: '20px' }}>Loading Representative Workspace...</div>;
  }

  const repStatus = currentUser?.representative?.status || currentUser?.status || 'PENDING';
  const isApproved = repStatus === 'ACTIVE';
  const commRatePct = ((currentUser?.representative?.commissionRateBps || 2000) / 100).toFixed(1);

  // Calculate modeled commissions from WON leads
  const wonLeads = leads.filter(l => l.status === 'WON');
  const totalPipelineBudgetMinor = leads.reduce((acc, l) => acc + (l.estimated_budget_minor || 0), 0);
  const repRateBps = currentUser?.representative?.commissionRateBps || 2000;
  const totalModeledCommMinor = wonLeads.reduce((acc, l) => {
    return acc + Math.round((l.estimated_budget_minor * repRateBps) / 10000);
  }, 0);

  const totalVerifiedPaidMinor = invoices.reduce((acc, inv) => acc + (inv.amount_paid_minor || 0), 0);
  const verifiedCommEventsMinor = Math.floor((totalVerifiedPaidMinor * repRateBps) / 10000);

  const currency = currentUser?.country?.currency || 'KES';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="cb-badge cb-badge-amber" style={{ marginBottom: '8px' }}>
            <Users size={13} /> Field Representative &bull; {commRatePct}% Commission
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Representative Commercial Workspace
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            Track your prospective client leads, advance project scopes, and monitor verified commission events.
          </p>
        </div>

        {isApproved && (
          <button
            onClick={() => setModalOpen(true)}
            className="cb-btn cb-btn-primary"
            style={{ gap: '8px' }}
          >
            <Plus size={16} /> Register New Lead
          </button>
        )}
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

      {/* KPI Cards Grid */}
      <div className="cb-grid-4" style={{ marginBottom: '32px' }}>
        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            My Active Leads
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>{leads.length} Leads</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            {wonLeads.length} closed won projects
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Pipeline Commercial Value
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>
            {((totalPipelineBudgetMinor) / 100).toLocaleString()} {currency}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            Across all active discussions
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Projected Commission ({commRatePct}%)
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#60A5FA' }}>
            {((totalModeledCommMinor) / 100).toLocaleString()} {currency}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)', marginTop: '4px' }}>
            Modeled from won leads & proposals
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Verified Commission Events
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981' }}>
            {((verifiedCommEventsMinor) / 100).toLocaleString()} {currency}
          </div>
          <div style={{ fontSize: '11px', color: '#6EE7B7', marginTop: '4px' }}>
            From verified client settlements (Phase 2D handoff)
          </div>
        </div>
      </div>

      {/* Commercial Proposals & Commission Projections */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
              Proposals Pipeline & Projected Commissions
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
              Track transmittals sent to your clients. Commissions shown are informational projections based on configured {commRatePct}% rate.
            </p>
          </div>
          <span className="cb-badge cb-badge-neutral">{proposals.length} Proposals</span>
        </div>

        {proposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--cb-text-muted)', fontSize: '13px' }}>
            No proposals generated for your leads yet. Scope out requirements with prospective clients to request a formal technical proposal.
          </div>
        ) : (
          <div className="cb-table-container">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Proposal & Version</th>
                  <th>Client / Business</th>
                  <th>Scope</th>
                  <th>Contract Value</th>
                  <th>Status</th>
                  <th>Informational 20% Comm.</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => {
                  const valFormatted = ((p.total_amount_minor || 0) / 100).toLocaleString();
                  const rateBps = currentUser?.representative?.commissionRateBps || 2000;
                  const projCommFormatted = (Math.round(((p.total_amount_minor || 0) * rateBps) / 10000) / 100).toLocaleString();

                  const statusBadges: any = {
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
                        <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '13px' }}>{p.proposal_number}</div>
                        <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>Version {p.version}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{p.company_name || p.lead_business_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>{p.country_name || 'Regional'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--cb-text-secondary)' }}>{p.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>{p.deliverables?.length || 0} Deliverables</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                          {valFormatted} {p.currency}
                        </span>
                      </td>
                      <td>
                        <span className={`cb-badge ${statusBadges[p.status] || 'cb-badge-blue'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#34D399' }}>
                          {projCommFormatted} {p.currency}
                        </span>
                        <div style={{ fontSize: '10px', color: 'var(--cb-text-muted)' }}>
                          Informational only
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

      {/* Referred Client Invoices & Verified Settlements (Phase 2B) */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
              Referred Client Invoices & Verified Settlements
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
              Track payment verification for your accounts. Verified payments record immutable commission events at your {commRatePct}% rate.
            </p>
          </div>
          <span className="cb-badge cb-badge-neutral">{invoices.length} Invoices</span>
        </div>

        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--cb-text-muted)', fontSize: '13px' }}>
            No client invoices issued yet. When your referred clients approve proposals, billing statements will appear here.
          </div>
        ) : (
          <div className="cb-table-container">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client Company</th>
                  <th>Milestone Scope</th>
                  <th>Invoiced</th>
                  <th>Verified Paid</th>
                  <th>Status</th>
                  <th>Commission Snapshot ({commRatePct}%)</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const commSnapshotMinor = Math.floor(((inv.amount_paid_minor || 0) * repRateBps) / 10000);
                  return (
                    <tr key={inv.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--cb-accent)' }}>
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{inv.company_name}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--cb-text-primary)' }}>{inv.title}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                          {((inv.amount_minor || 0) / 100).toLocaleString()} {inv.currency}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: inv.amount_paid_minor > 0 ? '#34D399' : 'var(--cb-text-muted)', fontWeight: 600 }}>
                          {((inv.amount_paid_minor || 0) / 100).toLocaleString()} {inv.currency}
                        </span>
                      </td>
                      <td>
                        <span className={`cb-badge ${
                          inv.status === 'PAID'
                            ? 'cb-badge-emerald'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'cb-badge-amber'
                            : 'cb-badge-blue'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: inv.amount_paid_minor > 0 ? '#10B981' : 'var(--cb-text-muted)' }}>
                          {((commSnapshotMinor) / 100).toLocaleString()} {inv.currency}
                        </span>
                        <div style={{ fontSize: '10px', color: 'var(--cb-text-muted)' }}>
                          {inv.amount_paid_minor > 0 ? 'Event Recorded (Phase 2D handoff)' : 'Pending client payment'}
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

      {/* My Leads Table */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
              My Leads & Commercial Pipeline
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
              Advance prospective businesses through the CodeBridge lead lifecycle.
            </p>
          </div>
          <span className="cb-badge cb-badge-neutral">{leads.length} Records</span>
        </div>

        {leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cb-text-muted)' }}>
            No leads recorded yet. Click "Register New Lead" to begin building your commercial pipeline.
          </div>
        ) : (
          <div className="cb-table-container">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Business & Contact</th>
                  <th>Service Category</th>
                  <th>Estimated Budget</th>
                  <th>Status</th>
                  <th>Potential 20% Comm.</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const budgetFormatted = ((l.estimated_budget_minor || 0) / 100).toLocaleString();
                  const rateBps = currentUser?.representative?.commissionRateBps || 2000;
                  const commFormatted = (Math.round((l.estimated_budget_minor * rateBps) / 10000) / 100).toLocaleString();

                  return (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{l.business_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>
                          {l.contact_person} &bull; {l.phone || l.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--cb-text-secondary)' }}>{l.business_type}</div>
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
                        <span style={{ fontWeight: 700, color: '#34D399' }}>
                          {commFormatted} {l.currency}
                        </span>
                      </td>
                      <td>
                        {isApproved ? (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                            {l.status === 'REQUIREMENTS_COLLECTED' && (
                              <button
                                onClick={() => handleUpdateStatus(l.id, 'PROPOSAL')}
                                className="cb-btn cb-btn-secondary cb-btn-sm"
                              >
                                Proposal Sent
                              </button>
                            )}
                            {l.status === 'PROPOSAL' && (
                              <span style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 600 }}>
                                Proposal Under Review
                              </span>
                            )}
                            {l.status === 'WON' && (
                              <span style={{ fontSize: '12px', color: '#34D399', fontWeight: 600 }}>
                                Active Client &bull; Project Kickoff
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>
                            Approval Required
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {modalOpen && (
        <div className="cb-modal-overlay">
          <div className="cb-modal">
            <div className="cb-modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                Register New Business Lead
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--cb-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div className="cb-modal-body">
                <div className="cb-form-group">
                  <label className="cb-label">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.businessName}
                    onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
                    className="cb-input"
                    placeholder="e.g. Mombasa Safari Resort"
                  />
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={newLead.contactPerson}
                      onChange={(e) => setNewLead({ ...newLead, contactPerson: e.target.value })}
                      className="cb-input"
                      placeholder="Client contact"
                    />
                  </div>
                  <div className="cb-form-group">
                    <label className="cb-label">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      className="cb-input"
                      placeholder="+254... or +234..."
                    />
                  </div>
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Client Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="cb-input"
                    placeholder="contact@business.ke"
                  />
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Business Category *</label>
                    <select
                      value={newLead.businessType}
                      onChange={(e) => setNewLead({ ...newLead, businessType: e.target.value })}
                      className="cb-select"
                    >
                      <option value="Restaurant Websites & Ordering Systems">Restaurant & Ordering Systems</option>
                      <option value="Business Websites">Business Websites</option>
                      <option value="E-commerce Websites">E-commerce Store</option>
                      <option value="Property & Airbnb Websites">Property & Airbnb</option>
                      <option value="Booking Systems">Booking Systems</option>
                      <option value="Custom Business Software">Custom Business Software</option>
                    </select>
                  </div>

                  <div className="cb-form-group">
                    <label className="cb-label">Proposed Budget ({newLead.currency})</label>
                    <input
                      type="number"
                      step="1000"
                      value={newLead.estimatedBudget}
                      onChange={(e) => setNewLead({ ...newLead, estimatedBudget: e.target.value })}
                      className="cb-input"
                    />
                  </div>
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Project Requirements / Notes *</label>
                  <textarea
                    required
                    rows={3}
                    value={newLead.requirements}
                    onChange={(e) => setNewLead({ ...newLead, requirements: e.target.value })}
                    className="cb-textarea"
                    placeholder="Summarize what the client wants to achieve..."
                  />
                </div>
              </div>

              <div className="cb-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cb-btn cb-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="cb-btn cb-btn-primary">
                  Register Lead to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
