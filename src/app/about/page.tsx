// src/app/about/page.tsx
'use client';

import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Globe,
  Code,
  CheckCircle2,
  Building2,
  Award,
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';

export default function AboutPage() {
  const corePillars = [
    {
      icon: Globe,
      title: 'Multi-Country Operational Footprint',
      desc: 'CodeBridge operates primary operational hubs in Lagos, Nigeria and Nairobi, Kenya. The entire platform architecture — ISO currencies (NGN & KES), country scopes, representative networks, and billing pipelines — is built for seamless regional execution.',
      highlights: [
        'Dedicated country management in Nigeria & Kenya',
        'Strict currency boundary isolation (zero FX ambiguity)',
        'Local commercial presence with global engineering standards'
      ]
    },
    {
      icon: Code,
      title: 'Engineering Rigor, Not AI Hype',
      desc: 'While modern generative tools accelerate internal code analysis and boilerplate scaffolding, CodeBridge is not a low-code or AI gimmick startup. We build resilient, high-performance, production-ready software systems with strict human engineering oversight.',
      highlights: [
        'Enterprise relational data modeling (PostgreSQL / Supabase)',
        'Comprehensive unit, integration, and security test coverage',
        'Human code review by senior software architects'
      ]
    },
    {
      icon: Lock,
      title: '100% Milestone Escrow Protection',
      desc: 'Clients never pay 100% upfront into a black hole. Every commercial engagement is divided across verifiable milestones. Funds are allocated against measurable sprint deliverables, eliminating financial and operational risk.',
      highlights: [
        '50% deposit to commence sprint architecture',
        '30% upon mid-project demo and staging milestone',
        '20% upon final user acceptance and production launch'
      ]
    },
    {
      icon: Building2,
      title: 'Institutional Corporate Governance',
      desc: 'CodeBridge is operated and backed by MarketBridge NG LTD. Commercial covenants, non-disclosure agreements, IP assignments, and service level warranties are backed by verified corporate governance and regulatory compliance.',
      highlights: [
        'Legally binding service level agreements (SLAs)',
        'Full intellectual property transfer upon final settlement',
        'Dedicated legal and compliance oversight'
      ]
    }
  ];

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        {/* ================================================================= */}
        {/* 1. HERO SECTION                                                   */}
        {/* ================================================================= */}
        <section style={{
          background: 'linear-gradient(180deg, #EDF7FF 0%, #F8FAFC 100%)',
          padding: '64px 0 48px',
          borderBottom: '1px solid #E2E8F0',
        }}>
          <div className="cb-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#0B1B3D',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                }}
              >
                <ArrowLeft size={14} />
                Return to Home
              </Link>
            </div>

            <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: '#E0F2FE',
              border: '1px solid #BAE6FD',
              color: '#0284C7',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}>
              <Sparkles size={14} />
              Corporate Structure &amp; Engineering Mission
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 46px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#0B1B3D',
              marginBottom: '16px',
            }}>
              Connecting Global Demand with Africa&apos;s{' '}
              <span style={{
                background: 'linear-gradient(135deg, #0284C7 0%, #00B4D8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Premier Tech Talent
              </span>
            </h1>

            <p style={{
              fontSize: '17px',
              lineHeight: 1.65,
              color: '#475569',
              maxWidth: '720px',
              margin: '0 auto 24px',
            }}>
              CodeBridge is a dedicated digital products and engineering platform operated by <strong>MarketBridge NG LTD</strong>. Built for business, designed for scale.
            </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. CORPORATE GOVERNANCE CARD                                      */}
        {/* ================================================================= */}
        <section style={{ padding: '60px 0 30px' }}>
          <div className="cb-container">
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '44px 36px',
              boxShadow: '0 12px 36px -6px rgba(15, 23, 42, 0.05)',
              marginBottom: '64px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7',
                }}>
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Institutional Backing
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0B1B3D', letterSpacing: '-0.02em' }}>
                    Corporate Governance: MarketBridge NG LTD
                  </h2>
                </div>
              </div>

              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '28px', maxWidth: '840px' }}>
                CodeBridge is built and owned by <strong>MarketBridge NG LTD</strong> as its flagship technology and digital-products business platform. By combining institutional governance with agile, vetted engineering squads, CodeBridge delivers the reliability of a tier-1 consultancy with the speed and capital efficiency of an elite product studio.
              </p>

              {/* Visual Governance Hierarchy Card */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px 28px',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
                }}>
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Parent Organization
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0B1B3D', marginBottom: '4px' }}>
                      MarketBridge NG LTD
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      Corporate Governance, Legal Frameworks &amp; Milestone Escrow Security
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #0284C7',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Technology Platform
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0B1B3D', marginBottom: '4px' }}>
                      CodeBridge
                    </div>
                    <div style={{ fontSize: '13px', color: '#0284C7', fontWeight: 600 }}>
                      &ldquo;Ideas to Impact • Built for Business&rdquo;
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Regional Hubs
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0B1B3D', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Nigeria 🇳🇬</span>
                      <span style={{ color: '#94A3B8' }}>•</span>
                      <span>Kenya 🇰🇪</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      Localized Commercial Scoping, Currency Locks (NGN / KES) &amp; Partner Networks
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* 3. FOUR CORE PHILOSOPHY PILLARS                               */}
            {/* ============================================================= */}
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: '#F0F9FF',
                color: '#0284C7',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                <Award size={14} />
                Our Core Principles
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0B1B3D', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                The CodeBridge Standard
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B' }}>
                Why modern companies trust CodeBridge for mission-critical software engineering.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '28px',
              marginBottom: '64px',
            }}>
              {corePillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1px solid #E2E8F0',
                      padding: '32px 28px',
                      boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284C7',
                      marginBottom: '18px',
                    }}>
                      <Icon size={24} />
                    </div>

                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0B1B3D', marginBottom: '10px', lineHeight: 1.3 }}>
                      {pillar.title}
                    </h3>

                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                      {pillar.desc}
                    </p>

                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid #E2E8F0',
                    }}>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0 }}>
                        {pillar.highlights.map((h, hIdx) => (
                          <li key={hIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#334155' }}>
                            <CheckCircle2 size={15} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ============================================================= */}
            {/* 4. CALL TO ACTION                                             */}
            {/* ============================================================= */}
            <div style={{
              backgroundColor: '#070F26',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '48px 36px',
              textAlign: 'center',
              boxShadow: '0 20px 45px -10px rgba(7, 15, 38, 0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
                <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
                  Partner with CodeBridge Today
                </h3>
                <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '28px' }}>
                  Whether you are looking to build a high-performance business platform or apply to become a regional sales representative in Nigeria or Kenya.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
                  <Link
                    href="/request-project"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 28px',
                      borderRadius: '12px',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                    }}
                  >
                    <span>Request Project Proposal</span>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/register"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Become a Representative</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
