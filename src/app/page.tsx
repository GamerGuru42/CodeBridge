// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import {
  Code,
  Smartphone,
  Layout,
  Users,
  ShieldCheck,
  Zap,
  Lock,
  FileText,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* ================================================================= */}
        {/* 1. HERO SECTION                                                   */}
        {/* ================================================================= */}
        <section style={{
          padding: '70px 0 60px',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle background gradient radial */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '1400px',
            height: '100%',
            background: 'radial-gradient(circle at 15% 20%, rgba(0, 180, 216, 0.06), transparent 50%), radial-gradient(circle at 85% 40%, rgba(14, 165, 233, 0.05), transparent 45%)',
            pointerEvents: 'none',
          }} />

          <div className="cb-container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}>
              {/* Left Column: Headline, Copy, Dual Pill Buttons, Trust Props */}
              <div>
                {/* Eyebrow Pill */}
                <div style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#0284C7',
                  textTransform: 'uppercase',
                  marginBottom: '18px',
                }}>
                  GLOBAL TECH TALENT &bull; AFRICA&apos;S GROWTH
                </div>

                {/* Main Headline */}
                <h1 style={{
                  fontSize: 'clamp(38px, 5.2vw, 58px)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  letterSpacing: '-0.03em',
                  color: '#0B1B3D',
                  marginBottom: '20px',
                }}>
                  Build Your Project.<br />
                  Bridge to <span style={{ color: '#00B4D8' }}>Africa.</span>
                </h1>

                {/* Subtitle */}
                <p style={{
                  fontSize: 'clamp(15px, 1.8vw, 17px)',
                  lineHeight: 1.6,
                  color: '#475569',
                  maxWidth: '520px',
                  marginBottom: '32px',
                }}>
                  CodeBridge connects you with vetted developers and tech talent across Nigeria and Kenya, delivering high-quality solutions, on time, and within budget.
                </p>

                {/* Dual Pill CTA Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', marginBottom: '40px' }}>
                  <Link
                    href="/request-project"
                    className="cb-btn cb-btn-navy"
                    style={{ padding: '13px 28px', fontSize: '15px' }}
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="cb-btn cb-btn-outline-pill"
                    style={{ padding: '13px 28px', fontSize: '15px' }}
                  >
                    Learn More
                  </Link>
                </div>

                {/* Trust / Value Props Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #F1F5F9',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ color: '#0B1B3D', marginTop: '2px' }}>
                      <ShieldCheck size={20} color="#0B1B3D" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B1B3D' }}>Vetted Talent</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Pre-screened professionals</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ color: '#0B1B3D', marginTop: '2px' }}>
                      <Zap size={20} color="#0B1B3D" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B1B3D' }}>Fast Delivery</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Get results, on time</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ color: '#0B1B3D', marginTop: '2px' }}>
                      <Lock size={20} color="#0B1B3D" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B1B3D' }}>Secure &amp; Reliable</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Your project, our priority</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual with Doodles and Floating Badge */}
              <div style={{ position: 'relative' }}>
                {/* Playful Doodles: Top right star and curved note */}
                <div style={{
                  position: 'absolute',
                  top: '-24px',
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}>
                  <span style={{
                    fontFamily: 'cursive, var(--cb-font-sans)',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0284C7',
                    transform: 'rotate(4deg)',
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                  }}>
                    Great talent builds great products
                  </span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.5 8.5L21 9.5L16 14.5L17.5 21L12 17.5L6.5 21L8 14.5L3 9.5L9.5 8.5L12 2Z" stroke="#00B4D8" strokeWidth="2" fill="rgba(0,180,216,0.15)"/>
                  </svg>
                </div>

                {/* Hand-drawn curved arrow doodle */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '-10px',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M8 28 C 14 12, 28 8, 36 14" stroke="#00B4D8" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M30 8 L 36 14 L 32 20" stroke="#00B4D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Hero Collaboration Image Container */}
                <div style={{
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                  aspectRatio: '3/2',
                  backgroundColor: '#F1F5F9',
                }}>
                  <Image
                    src="/images/hero-talent.jpg"
                    alt="African tech developers collaborating enthusiastically over laptop"
                    fill
                    sizes="(max-width: 768px) 100vw, 560px"
                    priority
                    style={{ objectFit: 'cover' }}
                  />

                  {/* Floating Flag Badge (Nigeria & Kenya) */}
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 2,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '18px' }}>
                      <span title="Nigeria">🇳🇬</span>
                      <span title="Kenya">🇰🇪</span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0B1B3D', whiteSpace: 'nowrap' }}>
                      Serving businesses<br /><span style={{ fontWeight: 500, color: '#475569' }}>in Nigeria &amp; Kenya</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. METRICS / SOCIAL PROOF STRIP                                   */}
        {/* ================================================================= */}
        <section style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #F1F5F9',
          borderBottom: '1px solid #F1F5F9',
          padding: '36px 0',
        }}>
          <div className="cb-container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '24px',
              textAlign: 'center',
            }}>
              {/* Stat 1 */}
              <div style={{ padding: '8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0B1B3D', marginBottom: '8px' }}>
                  <Users size={22} />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0B1B3D', letterSpacing: '-0.03em' }}>500+</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>Verified Developers</div>
              </div>

              {/* Stat 2 */}
              <div style={{ padding: '8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0B1B3D', marginBottom: '8px' }}>
                  <FileText size={22} />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0B1B3D', letterSpacing: '-0.03em' }}>300+</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>Projects Delivered</div>
              </div>

              {/* Stat 3 */}
              <div style={{ padding: '8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0B1B3D', marginBottom: '8px' }}>
                  <Star size={22} />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0B1B3D', letterSpacing: '-0.03em' }}>98%</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>Client Satisfaction</div>
              </div>

              {/* Stat 4 */}
              <div style={{ padding: '8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0B1B3D', marginBottom: '8px' }}>
                  <Clock size={22} />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0B1B3D', letterSpacing: '-0.03em' }}>24/7</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. SERVICES SHOWCASE SECTION                                      */}
        {/* ================================================================= */}
        <section style={{
          padding: '80px 0',
          backgroundColor: '#FFFFFF',
        }}>
          <div className="cb-container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}>
              {/* Left Column: Heading, Description, CTA */}
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#0284C7',
                  textTransform: 'uppercase',
                  marginBottom: '14px',
                }}>
                  OUR SERVICES
                </div>

                <h2 style={{
                  fontSize: 'clamp(28px, 3.6vw, 40px)',
                  fontWeight: 900,
                  lineHeight: 1.2,
                  letterSpacing: '-0.03em',
                  color: '#00B4D8',
                  marginBottom: '18px',
                }}>
                  Comprehensive Tech Talent &amp; Development Solutions
                </h2>

                <p style={{
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: '#475569',
                  marginBottom: '32px',
                  maxWidth: '440px',
                }}>
                  From simple websites to complex enterprise systems, we provide the right talent for your business needs.
                </p>

                <Link
                  href="/services"
                  className="cb-btn cb-btn-navy"
                  style={{ padding: '13px 28px', fontSize: '14px' }}
                >
                  Explore All Services
                </Link>
              </div>

              {/* Right Column: 2x2 Service Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
              }}>
                {/* Card 1: Web Development */}
                <div style={{
                  padding: '24px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#0B1B3D',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <Code size={20} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B1B3D', marginBottom: '8px' }}>
                    Web Development
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#64748B' }}>
                    Modern, scalable web applications for your business.
                  </p>
                </div>

                {/* Card 2: Mobile App Development */}
                <div style={{
                  padding: '24px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#0B1B3D',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <Smartphone size={20} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B1B3D', marginBottom: '8px' }}>
                    Mobile App Development
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#64748B' }}>
                    iOS and Android apps that users love.
                  </p>
                </div>

                {/* Card 3: UI/UX Design */}
                <div style={{
                  padding: '24px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#0B1B3D',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <Layout size={20} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B1B3D', marginBottom: '8px' }}>
                    UI/UX Design
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#64748B' }}>
                    Beautiful, intuitive designs that convert.
                  </p>
                </div>

                {/* Card 4: Staff Augmentation */}
                <div style={{
                  padding: '24px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#0B1B3D',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <Users size={20} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B1B3D', marginBottom: '8px' }}>
                    Staff Augmentation
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#64748B' }}>
                    Scale your team with skilled professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. TRUSTED BY FORWARD-THINKING BUSINESSES BANNER                  */}
        {/* ================================================================= */}
        <section style={{
          backgroundColor: '#0B1B3D',
          padding: '60px 0',
          textAlign: 'center',
          color: '#FFFFFF',
        }}>
          <div className="cb-container">
            <h2 style={{
              fontSize: 'clamp(24px, 3.2vw, 34px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '12px',
              color: '#FFFFFF',
            }}>
              Trusted by Forward-Thinking Businesses
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#94A3B8',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}>
              From startups to established companies, we help organizations build, scale, and succeed.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
