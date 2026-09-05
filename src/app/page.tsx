// src/app/page.tsx
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import {
  ArrowRight,
  Globe,
  Code2,
  Cpu,
  CheckCircle2,
  Users,
  Briefcase,
  Layers,
  ShieldCheck,
  TrendingUp,
  Building2,
  ShoppingBag,
  Utensils,
  CalendarCheck,
  Sliders,
  Laptop
} from 'lucide-react';

export default function HomePage() {
  const featuredServices = [
    { icon: Building2, title: 'Business Websites', desc: 'Corporate and brand platforms engineered for market authority, lead capture, and performance.' },
    { icon: ShoppingBag, title: 'E-commerce Websites', desc: 'Robust digital storefronts with integrated catalog management, cart flows, and regional currency ready.' },
    { icon: Utensils, title: 'Restaurant & Ordering Systems', desc: 'Complete hospitality hubs with real-time digital menus, table bookings, and order dispatch.' },
    { icon: Laptop, title: 'Property & Airbnb Websites', desc: 'Direct booking and listing showcases for property developers, hotels, and short-let operators.' },
    { icon: CalendarCheck, title: 'Booking Systems', desc: 'Automated scheduling engines with calendar synchronization, confirmation alerts, and client self-service.' },
    { icon: Code2, title: 'Custom Web Applications', desc: 'Purpose-built software platforms designed around your exact business workflows and operational scale.' },
    { icon: Sliders, title: 'Admin Dashboards & Portals', desc: 'Centralized executive control panels with granular metrics, team permissions, and real-time operational views.' },
    { icon: Cpu, title: 'Custom Business Software', desc: 'High-reliability digital management systems engineered to eliminate operational bottlenecks.' },
  ];

  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{
          padding: '90px 0 80px',
          background: 'radial-gradient(ellipse at 50% 10%, rgba(30, 80, 255, 0.15), transparent 70%), var(--cb-bg-page)',
          borderBottom: '1px solid var(--cb-border-subtle)',
          textAlign: 'center'
        }}>
          <div className="cb-container">
            {/* Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(30, 80, 255, 0.12)',
              border: '1px solid rgba(30, 80, 255, 0.3)',
              color: 'var(--cb-blue-400)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '28px'
            }}>
              <Globe size={15} />
              Serving businesses across Nigeria and Kenya
            </div>

            {/* Headline & Tagline */}
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              maxWidth: '960px',
              margin: '0 auto 24px',
              color: '#FFFFFF'
            }}>
              International Digital Products & Technology.{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6085FF, #3867FF, #93C5FD)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                Built for business.
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              color: 'var(--cb-text-secondary)',
              maxWidth: '740px',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}>
              CodeBridge develops high-performance websites, e-commerce engines, custom business software, and digital management systems. Centralized engineering excellence, regional client management.
            </p>

            {/* Dual CTA */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', marginBottom: '48px' }}>
              <Link href="/request-project" className="cb-btn cb-btn-primary cb-btn-lg">
                Request a Project <ArrowRight size={18} />
              </Link>
              <Link href="/services" className="cb-btn cb-btn-secondary cb-btn-lg">
                Explore 14 Services
              </Link>
              <Link href="/how-it-works#representatives" className="cb-btn cb-btn-outline cb-btn-lg">
                Partner as Representative (20% Comm.)
              </Link>
            </div>

            {/* Parent company trust notice */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px solid var(--cb-border-subtle)',
              fontSize: '13px',
              color: 'var(--cb-text-muted)'
            }}>
              <ShieldCheck size={16} color="var(--cb-emerald-500)" />
              Operated by <strong>MarketBridge NG LTD</strong> — Corporate Governance & SLA-backed Engineering
            </div>
          </div>
        </section>

        {/* Value Pillars */}
        <section style={{ padding: '60px 0', borderBottom: '1px solid var(--cb-border-subtle)', backgroundColor: 'var(--cb-navy-900)' }}>
          <div className="cb-container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px'
            }}>
              <div className="cb-card" style={{ padding: '28px' }}>
                <div style={{ color: 'var(--cb-blue-400)', marginBottom: '14px' }}>
                  <Layers size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>
                  Centralized Engineering
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
                  Full-stack architecture, rigorous QA, and modern cloud deployment managed directly by CodeBridge's senior tech team.
                </p>
              </div>

              <div className="cb-card" style={{ padding: '28px' }}>
                <div style={{ color: 'var(--cb-blue-400)', marginBottom: '14px' }}>
                  <Users size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>
                  Regional Representative Model
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
                  Local business representatives in designated markets handle client consultation, requirement scoping, and relationship management.
                </p>
              </div>

              <div className="cb-card" style={{ padding: '28px' }}>
                <div style={{ color: 'var(--cb-blue-400)', marginBottom: '14px' }}>
                  <TrendingUp size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>
                  Multi-Currency Architecture
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
                  Built from the foundation up to natively support Kenyan Shillings (KES) and Nigerian Naira (NGN), ready for pan-African expansion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section style={{ padding: '80px 0', borderBottom: '1px solid var(--cb-border-subtle)' }}>
          <div className="cb-container">
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 50px' }}>
              <div className="cb-badge cb-badge-blue" style={{ marginBottom: '12px' }}>
                Digital Products & Services
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                Built for Every Stage of Business Growth
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
                From high-conversion customer-facing storefronts to proprietary business operations platforms, we engineer solutions that generate measurable value.
              </p>
            </div>

            <div className="cb-grid-4">
              {featuredServices.map((srv, idx) => {
                const Icon = srv.icon;
                return (
                  <div key={idx} className="cb-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 80, 255, 0.1)',
                      border: '1px solid rgba(30, 80, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--cb-blue-400)',
                      marginBottom: '18px'
                    }}>
                      <Icon size={20} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                      {srv.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '16px' }}>
                      {srv.desc}
                    </p>
                    <Link href="/services" style={{ fontSize: '13px', color: 'var(--cb-blue-400)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      View Specs &rarr;
                    </Link>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link href="/services" className="cb-btn cb-btn-secondary">
                View All 14 Technology Services &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* The Business Process */}
        <section style={{ padding: '80px 0', backgroundColor: 'var(--cb-navy-900)', borderBottom: '1px solid var(--cb-border-subtle)' }}>
          <div className="cb-container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
              <div className="cb-badge cb-badge-emerald" style={{ marginBottom: '12px' }}>
                Delivery Lifecycle
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                How CodeBridge Delivers
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--cb-text-secondary)' }}>
                Structured milestones with full transparency from initial requirement collection to launch.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              position: 'relative'
            }}>
              {[
                { step: '01', title: 'Consultation & Scoping', desc: 'A CodeBridge representative collects your business requirements, operational goals, and budget.' },
                { step: '02', title: 'Technical Proposal', desc: 'Our engineering architects define the technical stack, deliverables, milestones, and formal agreement.' },
                { step: '03', title: 'Agile Engineering', desc: 'Centralized development team builds your product with milestone tracking accessible in your Client Portal.' },
                { step: '04', title: 'QA & Handover', desc: 'End-to-end acceptance testing, staff training, and deployment on resilient cloud infrastructure.' },
              ].map((item, idx) => (
                <div key={idx} className="cb-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    color: 'rgba(255, 255, 255, 0.05)',
                    position: 'absolute',
                    top: '12px',
                    right: '16px',
                    lineHeight: 1
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--cb-blue-400)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}>
                    Step {item.step}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '10px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Representative Opportunity Callout */}
        <section style={{ padding: '80px 0', borderBottom: '1px solid var(--cb-border-subtle)' }}>
          <div className="cb-container">
            <div className="cb-card" style={{
              padding: '48px 36px',
              backgroundColor: 'linear-gradient(135deg, var(--cb-bg-card), var(--cb-navy-850))',
              border: '1px solid rgba(30, 80, 255, 0.3)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
              alignItems: 'center'
            }}>
              <div>
                <div className="cb-badge cb-badge-amber" style={{ marginBottom: '16px' }}>
                  Representative Partnership
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', lineHeight: 1.2 }}>
                  Earn 20% Commission as a CodeBridge Business Representative
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--cb-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Are you well-connected with businesses in your country? Introduce businesses that need modern websites, e-commerce stores, or custom software. CodeBridge handles all technical architecture, project delivery, and maintenance while you earn 20% commission on qualifying projects.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--cb-text-primary)' }}>
                    <CheckCircle2 size={16} color="var(--cb-emerald-500)" /> Dedicated Representative Dashboard with real-time lead tracking
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--cb-text-primary)' }}>
                    <CheckCircle2 size={16} color="var(--cb-emerald-500)" /> Commission tracking on every closed project
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--cb-text-primary)' }}>
                    <CheckCircle2 size={16} color="var(--cb-emerald-500)" /> Official CodeBridge collateral and technical scoping support
                  </div>
                </div>
                <Link href="/register?type=representative" className="cb-btn cb-btn-primary">
                  Apply as a Representative <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '28px',
                border: '1px solid var(--cb-border-subtle)'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
                  Example Commission Scenarios (20%)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--cb-text-secondary)' }}>Kenya Restaurant Ordering System</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>280,000 KES Project</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#34D399' }}>56,000 KES Commission</span>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--cb-text-secondary)' }}>Nigeria Custom Business Software</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>2,500,000 NGN Project</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#34D399' }}>500,000 NGN Commission</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--cb-text-muted)', lineHeight: 1.4 }}>
                    *Commissions are calculated on qualifying project revenue and governed by CodeBridge representative agreements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Strip */}
        <section style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="cb-container">
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px' }}>
              Ready to Upgrade Your Business Technology?
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--cb-text-secondary)', maxWidth: '580px', margin: '0 auto 32px' }}>
              Tell our engineering team about your project requirements and receive a structured architectural proposal.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <Link href="/request-project" className="cb-btn cb-btn-primary cb-btn-lg">
                Request a Project Proposal <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="cb-btn cb-btn-outline cb-btn-lg">
                Talk with Technical Desk
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
