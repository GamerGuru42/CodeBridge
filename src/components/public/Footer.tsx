// src/components/public/Footer.tsx
import Link from 'next/link';
import { ShieldCheck, Globe2 } from 'lucide-react';
import CodeBridgeLogo from '@/components/common/CodeBridgeLogo';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#070F26',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingTop: '60px',
      paddingBottom: '40px',
      marginTop: 'auto',
      color: '#FFFFFF',
    }}>
      <div className="cb-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Col 1: Brand & Scope */}
          <div>
            <div style={{ marginBottom: '18px' }}>
              <CodeBridgeLogo size="md" variant="light-text" href="/" />
            </div>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '20px' }}>
              International digital products &amp; technology services platform. Connecting African talent with global opportunities.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '12px',
              color: '#CBD5E1',
            }}>
              <Globe2 size={14} color="#00B4D8" />
              Serving businesses across Nigeria and Kenya
            </div>
          </div>

          {/* Col 2: Digital Products */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>
              Solutions
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#94A3B8' }}>
              <li><Link href="/services#web-development" style={{ transition: 'color 0.15s' }}>Web Development</Link></li>
              <li><Link href="/services#mobile-development" style={{ transition: 'color 0.15s' }}>Mobile App Development</Link></li>
              <li><Link href="/services#ui-ux-design" style={{ transition: 'color 0.15s' }}>UI/UX Design</Link></li>
              <li><Link href="/services#staff-augmentation" style={{ transition: 'color 0.15s' }}>Staff Augmentation</Link></li>
              <li><Link href="/services" style={{ color: '#38BDF8' }}>Explore All Solutions &rarr;</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform & Partnership */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#94A3B8' }}>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/how-it-works#representatives">Sales Representatives (20% Comm.)</Link></li>
              <li><Link href="/about">About CodeBridge</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/request-project">Request Project Scope</Link></li>
            </ul>
          </div>

          {/* Col 4: Portal Access */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>
              Portals
            </h4>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px' }}>
              Client management, milestone invoices, and representative workspaces.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/login"
                className="cb-btn cb-btn-outline-pill cb-btn-sm"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: 'transparent', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                Sign In to Portal
              </Link>
              <Link
                href="/register"
                className="cb-btn cb-btn-navy cb-btn-sm"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#00B4D8', color: '#FFFFFF', borderColor: '#00B4D8' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Corporate Sub-footer */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          fontSize: '13px',
          color: '#64748B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#10B981" />
            <span>
              A platform operated by <strong>MarketBridge NG LTD</strong>. All rights reserved.
            </span>
          </div>
          <div>
            Serving businesses in Nigeria &amp; Kenya (NGN &amp; KES).
          </div>
        </div>
      </div>
    </footer>
  );
}
