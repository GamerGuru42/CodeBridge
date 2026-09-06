// src/app/how-it-works/page.tsx
'use client';

import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Code,
  ShieldCheck,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  TrendingUp,
  CreditCard,
  FileCheck
} from 'lucide-react';

export default function HowItWorksPage() {
  const clientStages = [
    {
      stage: '01',
      title: 'Consultation & Scoping',
      duration: '1–2 Business Days',
      desc: 'You submit your requirements online or meet directly with a CodeBridge regional representative in Nigeria or Kenya. We analyze your commercial objectives, functional requirements, and target timeline.',
      deliverables: [
        'Detailed functional requirement document',
        'Preliminary architectural recommendations',
        'Initial budget and milestone estimates'
      ]
    },
    {
      stage: '02',
      title: 'Proposal & Currency Lock',
      duration: '2–3 Business Days',
      desc: 'Our senior technical architects generate a formal commercial proposal with an explicit milestone payment schedule and fixed quote in your local currency (NGN or KES). Zero currency fluctuations or surprise costs.',
      deliverables: [
        'Complete technical specification & sprint plan',
        'Fixed commercial pricing in NGN or KES',
        'Transparent 3-stage milestone breakdown (50/30/20)'
      ]
    },
    {
      stage: '03',
      title: 'Agile Engineering Sprints',
      duration: '2–8 Weeks (Per Scope)',
      desc: 'Our in-house vetted engineering teams build your platform with modern agile sprints. You monitor live progress, test working builds, and approve sprint deliverables through your authenticated Client Portal.',
      deliverables: [
        'Real-time sprint tracker in Client Dashboard',
        'Staging environment preview access',
        'Regular architecture demo reviews'
      ]
    },
    {
      stage: '04',
      title: 'QA, Launch & Handover',
      duration: 'Final Sprint Milestone',
      desc: 'Comprehensive end-to-end quality assurance, security penetration testing, cloud server deployment, and staff handover. You receive 100% full intellectual property ownership and production credentials.',
      deliverables: [
        'Production cloud deployment (Vercel, AWS, Supabase)',
        'Complete source code repository transfer',
        '30-day post-launch warranty & maintenance options'
      ]
    }
  ];

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        {/* ================================================================= */}
        {/* 1. HERO BANNER                                                    */}
        {/* ================================================================= */}
        <section style={{
          background: 'linear-gradient(180deg, #EDF7FF 0%, #F8FAFC 100%)',
          padding: '64px 0 48px',
          borderBottom: '1px solid #E2E8F0',
        }}>
          <div className="cb-container" style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
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
              Operational Architecture &amp; Delivery Model
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 46px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#0B1B3D',
              marginBottom: '16px',
            }}>
              How CodeBridge Works:{' '}
              <span style={{
                background: 'linear-gradient(135deg, #0284C7 0%, #00B4D8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Milestone-Driven Execution
              </span>
            </h1>

            <p style={{
              fontSize: '17px',
              lineHeight: 1.65,
              color: '#475569',
              maxWidth: '700px',
              margin: '0 auto 28px',
            }}>
              We connect ambitious enterprises with vetted African engineering talent through a disciplined, transparent delivery framework with zero commercial ambiguity.
            </p>

            {/* Pillar badges */}
            <div style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
            }}>
              <span style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0B1B3D',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              }}>
                🛡️ 100% Milestone Escrow
              </span>
              <span style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0B1B3D',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              }}>
                📍 Local Hubs in Lagos &amp; Nairobi
              </span>
              <span style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0B1B3D',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              }}>
                💵 Fixed Pricing in NGN / KES
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. FOR CLIENTS & BUSINESSES: 4-STAGE PIPELINE                     */}
        {/* ================================================================= */}
        <section style={{ padding: '64px 0' }}>
          <div className="cb-container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: '#F0FDF4',
                color: '#166534',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                <Briefcase size={14} />
                Client Journey
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0B1B3D', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                Four Steps to Digital Product Delivery
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6 }}>
                Every project follows a structured lifecycle designed to eliminate technical risk and ensure on-time delivery.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}>
              {clientStages.map((stage) => (
                <div
                  key={stage.stage}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0',
                    padding: '32px 24px',
                    boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {/* Top stage badge & duration */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#0284C7',
                      backgroundColor: '#E0F2FE',
                      padding: '4px 10px',
                      borderRadius: '8px',
                    }}>
                      STAGE {stage.stage}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                      {stage.duration}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0B1B3D', marginBottom: '12px' }}>
                    {stage.title}
                  </h3>

                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                    {stage.desc}
                  </p>

                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid #E2E8F0',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '8px' }}>
                      Stage Deliverables
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', padding: 0, margin: 0 }}>
                      {stage.deliverables.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#334155' }}>
                          <CheckCircle2 size={14} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link
                href="/request-project"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  backgroundColor: '#0B1B3D',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(11, 27, 61, 0.2)',
                }}
              >
                <span>Ready to Start? Scope Your Project</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. FOR BUSINESS REPRESENTATIVES: PARTNER MODEL                    */}
        {/* ================================================================= */}
        <section id="representatives" style={{ padding: '0 0 64px' }}>
          <div className="cb-container">
            <div style={{
              backgroundColor: '#070F26',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '48px 40px',
              boxShadow: '0 20px 45px -10px rgba(7, 15, 38, 0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Background ambient light */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(2, 132, 199, 0.2) 0%, rgba(7, 15, 38, 0) 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px', marginBottom: '36px' }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(251, 191, 36, 0.15)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      color: '#FBBF24',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                    }}>
                      Representative Partnership Network
                    </span>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                      Earn 20% Commission as a Regional Business Representative
                    </h2>
                    <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '680px', lineHeight: 1.6 }}>
                      Represent CodeBridge in Nigeria or Kenya. Introduce businesses requiring software or digital products. You manage the relationship; our engineering teams execute the technical delivery.
                    </p>
                  </div>

                  <Link
                    href="/register"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 26px',
                      borderRadius: '12px',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>Continue with Google</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* 3 Step Pathway for Reps */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                }}>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '24px',
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', marginBottom: '14px' }}>
                      <Users size={20} />
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                      1. Introduce Qualified Leads
                    </h4>
                    <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                      Identify companies, restaurants, or startups that need web applications, websites, or operational systems. Submit their details through your Representative Portal.
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '24px',
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', marginBottom: '14px' }}>
                      <Code size={20} />
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                      2. CodeBridge Scopes &amp; Builds
                    </h4>
                    <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                      Our centralized technology team scopes the technical architecture, issues commercial proposals, and builds the software with rigorous milestone standards.
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '24px',
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBBF24', marginBottom: '14px' }}>
                      <CreditCard size={20} />
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                      3. Instant Commission Settlement
                    </h4>
                    <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                      When the client settles each project milestone invoice, a verified commission event is recorded in the platform ledger and credited directly to you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. INSTITUTIONAL GUARANTEES                                       */}
        {/* ================================================================= */}
        <section style={{ padding: '20px 0 80px' }}>
          <div className="cb-container">
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 36px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0B1B3D', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                Built on Commercial Trust &amp; Accountability
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B' }}>
                Enterprise safeguards engineered into every interaction.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
              }}>
                <div style={{ color: '#0284C7', marginBottom: '12px' }}>
                  <Lock size={24} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0B1B3D', marginBottom: '8px' }}>
                  Milestone Escrow Guarantee
                </h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                  Payments are divided across discrete milestone phases (50% deposit to commence planning, 30% on mid-sprint delivery, 20% on final UAT). Funds are allocated strictly against verified technical outputs.
                </p>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
              }}>
                <div style={{ color: '#0284C7', marginBottom: '12px' }}>
                  <FileCheck size={24} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0B1B3D', marginBottom: '8px' }}>
                  Complete IP Ownership
                </h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                  Upon project handover and final invoice settlement, your business receives 100% full intellectual property transfer, unencumbered source code access, and database ownership. Zero vendor lock-in.
                </p>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
              }}>
                <div style={{ color: '#0284C7', marginBottom: '12px' }}>
                  <ShieldCheck size={24} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0B1B3D', marginBottom: '8px' }}>
                  Corporate Governance
                </h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                  Operated by MarketBridge NG LTD. All commercial agreements, non-disclosure covenants, and service level warranties are backed by verified corporate governance and regional operational hubs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
