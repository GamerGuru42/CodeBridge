// src/app/dashboard/representative/clients/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
} from 'lucide-react';

export default function RepClientsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resMe, resProjects] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/projects'),
        ]);

        if (resMe.ok) {
          const d = await resMe.json();
          setCurrentUser(d.user);
        }

        if (resProjects.ok) {
          const d = await resProjects.json();
          setProjects(d.projects || []);
        }
      } catch (err) {
        console.error('Failed to load clients & projects:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--cb-text-muted)', padding: '20px' }}>Loading Clients & Projects...</div>;
  }

  const currency = currentUser?.country?.currency || 'NGN';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div className="cb-badge cb-badge-blue" style={{ marginBottom: '8px' }}>
          <Briefcase size={13} /> My Clients & Projects
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--cb-text-primary)', letterSpacing: '-0.02em' }}>
          Referred Clients & Active Projects
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
          Projects from clients you referred to CodeBridge. Commission events are tracked against verified payments.
        </p>
      </div>

      {/* Projects Table */}
      <div className="cb-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--cb-text-primary)' }}>
              Active Projects
            </h3>
          </div>
          <span className="cb-badge cb-badge-neutral">{projects.length} Projects</span>
        </div>

        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cb-text-muted)', fontSize: '13px' }}>
            No projects yet. When your referred clients approve proposals, their projects will appear here.
          </div>
        ) : (
          <div className="cb-table-container">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th>Budget</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const statusBadges: Record<string, string> = {
                    AWAITING_PAYMENT: 'cb-badge-amber',
                    IN_PROGRESS: 'cb-badge-blue',
                    COMPLETED: 'cb-badge-emerald',
                    ON_HOLD: 'cb-badge-neutral',
                    CANCELLED: 'cb-badge-rose',
                  };
                  const payBadges: Record<string, string> = {
                    UNPAID: 'cb-badge-rose',
                    PARTIALLY_PAID: 'cb-badge-amber',
                    PAID: 'cb-badge-emerald',
                  };

                  return (
                    <tr key={p.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--cb-accent)', fontSize: '13px' }}>
                          {p.code}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--cb-text-primary)' }}>{p.title}</div>
                      </td>
                      <td>
                        <span className={`cb-badge ${statusBadges[p.status] || 'cb-badge-neutral'}`}>
                          {p.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`cb-badge ${payBadges[p.payment_status] || 'cb-badge-neutral'}`}>
                          {p.payment_status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--cb-text-primary)' }}>
                          {((p.budget_minor || 0) / 100).toLocaleString()} {p.currency || currency}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: p.total_paid_minor > 0 ? '#34D399' : 'var(--cb-text-muted)' }}>
                          {((p.total_paid_minor || 0) / 100).toLocaleString()} {p.currency || currency}
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
    </div>
  );
}
