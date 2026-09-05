// src/app/about/page.tsx
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Layers, Globe, Code, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, padding: '60px 0 90px' }}>
        <div className="cb-container">
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 60px' }}>
            <div className="cb-badge cb-badge-blue" style={{ marginBottom: '14px' }}>
              Corporate Structure & Mission
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Engineering Digital Products for Business Growth
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
              CodeBridge is a dedicated digital products and technology platform operated by MarketBridge NG LTD. Built for business.
            </p>
          </div>

          {/* Corporate Lineage Card */}
          <div className="cb-card" style={{ padding: '40px', marginBottom: '48px', backgroundColor: 'var(--cb-navy-900)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <ShieldCheck size={28} color="var(--cb-blue-400)" />
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
                Corporate Governance: MarketBridge NG LTD
              </h2>
            </div>
            <p style={{ fontSize: '15px', color: 'var(--cb-text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
              CodeBridge is built and owned by <strong>MarketBridge NG LTD</strong> as its flagship technology and digital-products business platform. By combining corporate governance with dedicated engineering teams, CodeBridge gives businesses institutional reliability with agile technical execution.
            </p>

            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--cb-border-subtle)',
              fontFamily: 'var(--cb-font-mono)',
              fontSize: '13px',
              color: 'var(--cb-text-secondary)',
              lineHeight: 1.8
            }}>
              <div style={{ color: '#FFFFFF', fontWeight: 700 }}>MARKETBRIDGE NG LTD (Parent Company)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;└── <span style={{ color: 'var(--cb-blue-400)', fontWeight: 700 }}>CODEBRIDGE</span> (Digital Products & Technology Platform)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tagline: <span style={{ color: '#34D399' }}>"Built for business."</span></div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Current Operational Markets: <span style={{ color: '#FBBF24' }}>Nigeria (NGN) & Kenya (KES)</span></div>
            </div>
          </div>

          {/* Operational Scope & Engineering Philosophy */}
          <div className="cb-grid-2" style={{ gap: '32px', marginBottom: '60px' }}>
            <div className="cb-card" style={{ padding: '32px' }}>
              <div style={{ color: 'var(--cb-blue-400)', marginBottom: '16px' }}>
                <Globe size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
                Multi-Country Operational Footprint
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                CodeBridge currently operates between Nigeria and Kenya. From day one, the entire platform architecture — currencies, country profiles, representative networks, and billing pipelines — has been designed for scalable multi-country expansion across the African continent and globally.
              </p>
              <div style={{ fontSize: '13px', color: 'var(--cb-text-muted)' }}>
                • Explicit ISO currency management (NGN & KES)<br />
                • Localized representative representation<br />
                • Centralized engineering quality control
              </div>
            </div>

            <div className="cb-card" style={{ padding: '32px' }}>
              <div style={{ color: 'var(--cb-blue-400)', marginBottom: '16px' }}>
                <Code size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
                Engineering Rigor & Product Philosophy
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                While modern AI tools are utilized internally by our engineering team to accelerate prototyping and unit testing, CodeBridge is <strong>not</strong> an AI gimmick startup. We build proven, resilient, production-ready software systems with strict human engineering oversight, comprehensive QA, and security best practices.
              </p>
              <div style={{ fontSize: '13px', color: 'var(--cb-text-muted)' }}>
                • Enterprise-grade relational data modeling<br />
                • Strict role-based authorization (RBAC)<br />
                • SLA-backed technical maintenance and support
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
              Work with CodeBridge
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--cb-text-secondary)', maxWidth: '500px', margin: '0 auto 24px' }}>
              Whether you require a mission-critical business application or wish to join our business representative network.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <Link href="/request-project" className="cb-btn cb-btn-primary">
                Request a Project <ArrowRight size={16} />
              </Link>
              <Link href="/register?type=representative" className="cb-btn cb-btn-secondary">
                Representative Application
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
