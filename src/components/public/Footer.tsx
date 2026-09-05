// src/components/public/Footer.tsx
import Link from 'next/link';
import { Layers, ShieldCheck, Globe2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--cb-navy-950)',
      borderTop: '1px solid var(--cb-border-subtle)',
      paddingTop: '60px',
      paddingBottom: '40px',
      marginTop: 'auto'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--cb-blue-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Layers size={18} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                CODEBRIDGE
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              International digital products & technology services platform. Built for business.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: '6px',
              border: '1px solid var(--cb-border-subtle)',
              fontSize: '12px',
              color: 'var(--cb-text-secondary)'
            }}>
              <Globe2 size={14} color="var(--cb-blue-400)" />
              Serving businesses across Nigeria and Kenya
            </div>
          </div>

          {/* Col 2: Digital Products */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Digital Products
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--cb-text-secondary)' }}>
              <li><Link href="/services#business-websites">Business Websites</Link></li>
              <li><Link href="/services#ecommerce">E-commerce Stores</Link></li>
              <li><Link href="/services#restaurant-ordering">Restaurant Ordering Systems</Link></li>
              <li><Link href="/services#property-airbnb">Property & Airbnb Portals</Link></li>
              <li><Link href="/services#booking-systems">Booking & Appointment Systems</Link></li>
              <li><Link href="/services#custom-software">Custom Business Software</Link></li>
              <li><Link href="/services">View All 14 Services &rarr;</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform & Partnership */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Partnership & Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--cb-text-secondary)' }}>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/how-it-works#representatives">Representative Model (20% Comm.)</Link></li>
              <li><Link href="/about">About MarketBridge NG LTD</Link></li>
              <li><Link href="/contact">Contact Technical Desk</Link></li>
              <li><Link href="/request-project">Request Project Scope</Link></li>
            </ul>
          </div>

          {/* Col 4: Portal Access */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Portal Access
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Secure client tracking, project milestone management, and representative tools.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/login" className="cb-btn cb-btn-secondary cb-btn-sm" style={{ width: '100%' }}>
                Sign In to Portal
              </Link>
              <Link href="/register" className="cb-btn cb-btn-outline cb-btn-sm" style={{ width: '100%' }}>
                Create Client / Rep Account
              </Link>
            </div>
          </div>
        </div>

        {/* Corporate Sub-footer */}
        <div style={{
          borderTop: '1px solid var(--cb-border-subtle)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          fontSize: '13px',
          color: 'var(--cb-text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--cb-emerald-500)" />
            <span>
              A platform owned & operated by <strong>MarketBridge NG LTD</strong>. All rights reserved.
            </span>
          </div>
          <div>
            Architecture prepared for multi-currency operations (NGN & KES).
          </div>
        </div>
      </div>
    </footer>
  );
}
