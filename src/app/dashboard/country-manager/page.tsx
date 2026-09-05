// src/app/dashboard/country-manager/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Globe2, Users, Briefcase, Layers, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function CountryManagerDashboard() {
  const [reps, setReps] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/representatives'),
      fetch('/api/leads'),
      fetch('/api/projects'),
      fetch('/api/proposals'),
    ])
      .then(async ([r1, r2, r3, r4]) => {
        if (r1.ok) {
          const d = await r1.json();
          // Filter to Kenya for Demo Country Manager
          setReps(d.representatives?.filter((r: any) => r.country_code === 'KE') || []);
        }
        if (r2.ok) {
          const d = await r2.json();
          setLeads(d.leads?.filter((l: any) => l.country_code === 'KE') || []);
        }
        if (r3.ok) {
          const d = await r3.json();
          setProjects(d.projects?.filter((p: any) => p.country_code === 'KE') || []);
        }
        if (r4.ok) {
          const d = await r4.json();
          setProposals(d.proposals || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--cb-text-muted)', padding: '20px' }}>Loading Country Manager metrics...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div className="cb-badge cb-badge-emerald" style={{ marginBottom: '8px' }}>
          <Globe2 size={13} /> Country Management: Kenya (KES)
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Regional Operations & Field Oversight
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
          Oversee local business representatives, market leads, and project milestones within Kenya.
        </p>
      </div>

      {/* Regional Stats */}
      <div className="cb-grid-3" style={{ marginBottom: '32px' }}>
        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Regional Representatives
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>{reps.length} Reps</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            {reps.filter(r => r.approval_status === 'ACTIVE').length} active in Kenya
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Kenya Regional Leads
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>{leads.length} Leads</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            Commercial pipeline in KES
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Active Kenya Projects
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>{projects.length} Projects</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            Client implementations
          </div>
        </div>
      </div>

      {/* Country Reps */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
          Field Representatives Roster (Kenya)
        </h3>
        <div className="cb-table-container">
          <table className="cb-table">
            <thead>
              <tr>
                <th>Representative</th>
                <th>Status</th>
                <th>Commission Rate</th>
                <th>Leads Generated</th>
                <th>Closed Projects</th>
              </tr>
            </thead>
            <tbody>
              {reps.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{r.first_name} {r.last_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>{r.email} &bull; {r.phone}</div>
                  </td>
                  <td>
                    <span className={`cb-badge ${r.approval_status === 'ACTIVE' ? 'cb-badge-emerald' : 'cb-badge-amber'}`}>
                      {r.approval_status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--cb-blue-400)' }}>
                      {(r.commission_rate_bps / 100).toFixed(1)}%
                    </span>
                  </td>
                  <td>{r.total_leads} leads</td>
                  <td>{r.total_projects} projects</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Country Commercial Proposals */}
      <div className="cb-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
              Commercial Proposals & Contracts (Kenya Hub)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
              Regional visibility into client transmittals and signed engineering proposals.
            </p>
          </div>
          <span className="cb-badge cb-badge-neutral">{proposals.length} Proposals</span>
        </div>

        {proposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: 'var(--cb-text-muted)', fontSize: '13px' }}>
            No proposals currently registered in Kenya hub.
          </div>
        ) : (
          <div className="cb-table-container">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Proposal & Version</th>
                  <th>Client / Business</th>
                  <th>Scope</th>
                  <th>Fixed Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => {
                  const valFormatted = ((p.total_amount_minor || 0) / 100).toLocaleString();
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
                        <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)' }}>v{p.version}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{p.company_name || p.lead_business_name}</div>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Regional Leads Stream */}
      <div className="cb-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
          Regional Pipeline (Kenya)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {leads.map((l) => (
            <div key={l.id} style={{
              padding: '14px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--cb-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{l.business_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>
                  Contact: {l.contact_person} &bull; Scope: {l.business_type} &bull; Budget: {((l.estimated_budget_minor || 0) / 100).toLocaleString()} {l.currency}
                </div>
              </div>
              <span className={`cb-badge ${l.status === 'WON' ? 'cb-badge-emerald' : 'cb-badge-blue'}`}>
                {l.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
