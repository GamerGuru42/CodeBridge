// src/app/how-it-works/page.tsx
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Briefcase, Code, ShieldCheck, Users } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, padding: '60px 0 90px' }}>
        <div className="cb-container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px' }}>
            <div className="cb-badge cb-badge-emerald" style={{ marginBottom: '14px' }}>
              Operational Architecture
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              How CodeBridge Works
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
              CodeBridge bridges the gap between ambitious businesses and world-class technology engineering through centralized development and dedicated regional representatives.
            </p>
          </div>

          {/* Section 1: For Businesses */}
          <div style={{ marginBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--cb-blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Briefcase size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>For Businesses & Clients</h2>
                <p style={{ fontSize: '14px', color: 'var(--cb-text-muted)' }}>From initial consultation to production deployment</p>
              </div>
            </div>

            <div className="cb-grid-4">
              <div className="cb-card">
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cb-blue-400)', marginBottom: '8px' }}>STAGE 1</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>Consultation & Scoping</h3>
                <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                  You meet with a CodeBridge representative or submit your requirements online. We identify your business goals, target timeline, and budget.
                </p>
              </div>

              <div className="cb-card">
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cb-blue-400)', marginBottom: '8px' }}>STAGE 2</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>Proposal & Architecture</h3>
                <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                  Our technical architects prepare a clear technical proposal, milestone schedule, and fixed commercial quote in your currency (KES or NGN).
                </p>
              </div>

              <div className="cb-card">
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cb-blue-400)', marginBottom: '8px' }}>STAGE 3</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>Agile Development</h3>
                <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                  The CodeBridge engineering team builds your product with sprint milestones tracked in real time through your dedicated Client Dashboard.
                </p>
              </div>

              <div className="cb-card">
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cb-blue-400)', marginBottom: '8px' }}>STAGE 4</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>QA & Production Launch</h3>
                <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                  Rigorous quality assurance, user acceptance testing, production cloud deployment, and staff training with ongoing maintenance options.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: For Representatives */}
          <div id="representatives" style={{
            backgroundColor: 'var(--cb-navy-900)',
            borderRadius: '20px',
            border: '1px solid var(--cb-border-subtle)',
            padding: '48px 36px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--cb-amber-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Users size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>For Business Representatives</h2>
                <p style={{ fontSize: '14px', color: 'var(--cb-text-muted)' }}>Represent CodeBridge in your country and earn 20% commission</p>
              </div>
            </div>

            <p style={{ fontSize: '15px', color: 'var(--cb-text-secondary)', lineHeight: 1.6, maxWidth: '820px', marginBottom: '36px' }}>
              CodeBridge operates a partner model where vetted local representatives introduce businesses needing digital transformation. You maintain client relationships; CodeBridge delivers the technical heavy lifting.
            </p>

            <div className="cb-grid-3" style={{ marginBottom: '36px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cb-border-subtle)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                  1. Acquire & Introduce Leads
                </div>
                <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                  Identify businesses needing websites, apps, or business software. Present CodeBridge services and gather their high-level requirements.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cb-border-subtle)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                  2. Log & Track in Representative Portal
                </div>
                <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                  Submit leads via your Representative Dashboard. Monitor pipeline progression as our tech team reviews the requirements and issues proposals.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cb-border-subtle)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                  3. Earn 20% Commission
                </div>
                <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                  Receive a standard 20% commission on qualifying project revenue upon milestone completion and client payment according to platform rules.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link href="/register?type=representative" className="cb-btn cb-btn-primary">
                Apply to Become a Representative <ArrowRight size={16} />
              </Link>
              <span style={{ fontSize: '13px', color: 'var(--cb-text-muted)' }}>
                *All representative applications undergo administrative verification before activation.
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
