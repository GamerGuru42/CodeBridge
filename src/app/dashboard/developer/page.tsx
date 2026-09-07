// src/app/dashboard/developer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Code, Layers, CheckCircle2, Clock, CheckSquare, Terminal, FileCode2, ExternalLink } from 'lucide-react';

export default function DeveloperDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.projects) {
          setProjects(data.projects);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--cb-text-muted)', padding: '20px' }}>Loading Engineering Queue...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div className="cb-badge cb-badge-blue" style={{ marginBottom: '8px' }}>
          <Code size={13} /> Engineering & Development Hub
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--cb-text-primary)', letterSpacing: '-0.02em' }}>
          Assigned Projects & Sprint Milestones
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
          Centralized engineering queue, architectural specifications, and implementation status.
        </p>
      </div>

      {/* Dev Stats */}
      <div className="cb-grid-3" style={{ marginBottom: '32px' }}>
        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Assigned Projects
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--cb-text-primary)' }}>{projects.length} Active</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            Across Kenya & Nigeria clients
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Architecture Quality Standard
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#34D399' }}>100% SLA</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            Enterprise code review enforced
          </div>
        </div>

        <div className="cb-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Internal Tooling
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--cb-blue-400)' }}>AI-Assisted</div>
          <div style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
            Internal productivity acceleration
          </div>
        </div>
      </div>

      {/* Project Cards with Milestones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {projects.map((proj) => (
          <div key={proj.id} className="cb-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--cb-font-mono)', fontSize: '12px', color: 'var(--cb-blue-400)', fontWeight: 700 }}>
                    {proj.code}
                  </span>
                  <span className="cb-badge cb-badge-neutral">{proj.country_name}</span>
                  <span className="cb-badge cb-badge-blue">{proj.status}</span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--cb-text-primary)', marginTop: '6px' }}>
                  {proj.title}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--cb-text-muted)', marginTop: '2px' }}>
                  Client: {proj.company_name} ({proj.industry}) &bull; Service: {proj.service_name || 'Custom Solution'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>Project Budget</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cb-text-primary)' }}>
                  {((proj.budget_minor || 0) / 100).toLocaleString()} {proj.currency}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', lineHeight: 1.6, marginBottom: '24px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '14px 18px', borderRadius: '8px' }}>
              <strong>Scope:</strong> {proj.description}
            </p>

            {/* Milestones Checklist */}
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cb-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              Sprint Milestones & Technical Tasks
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(proj.milestones || []).map((ms: any) => {
                const isDone = ms.status === 'COMPLETED';
                const isProg = ms.status === 'IN_PROGRESS';

                return (
                  <div key={ms.id} style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: isDone ? 'rgba(5, 150, 105, 0.08)' : (isProg ? 'rgba(30, 80, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)'),
                    border: `1px solid ${isDone ? 'rgba(5, 150, 105, 0.25)' : (isProg ? 'rgba(30, 80, 255, 0.25)' : 'var(--cb-border-subtle)')}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {isDone && <CheckCircle2 size={18} color="#34D399" />}
                      {isProg && <Clock size={18} color="var(--cb-blue-400)" />}
                      {!isDone && !isProg && <CheckSquare size={18} color="var(--cb-text-muted)" />}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: isDone ? '#34D399' : '#FFFFFF' }}>
                          {ms.order_index}. {ms.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>{ms.description}</div>
                      </div>
                    </div>

                    <span className={`cb-badge ${isDone ? 'cb-badge-emerald' : isProg ? 'cb-badge-blue' : 'cb-badge-neutral'}`} style={{ fontSize: '11px' }}>
                      {ms.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
