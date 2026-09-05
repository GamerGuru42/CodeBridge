// src/components/public/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Layers, ArrowRight, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header style={{
      borderBottom: '1px solid var(--cb-border-subtle)',
      backgroundColor: 'rgba(13, 22, 44, 0.92)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="cb-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Lockup */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--cb-blue-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
              CODEBRIDGE
              <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: 'var(--cb-text-secondary)', fontWeight: 600 }}>
                BY MARKETBRIDGE
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)', fontWeight: 500 }}>
              Built for business.
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          <Link href="/" style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', transition: 'color 0.15s' }}>
            Home
          </Link>
          <Link href="/services" style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', transition: 'color 0.15s' }}>
            Services
          </Link>
          <Link href="/how-it-works" style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', transition: 'color 0.15s' }}>
            How It Works
          </Link>
          <Link href="/about" style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', transition: 'color 0.15s' }}>
            About
          </Link>
          <Link href="/contact" style={{ fontSize: '14px', color: 'var(--cb-text-secondary)', transition: 'color 0.15s' }}>
            Contact
          </Link>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
          {currentUser ? (
            <Link href="/dashboard" className="cb-btn cb-btn-secondary cb-btn-sm" style={{ gap: '6px' }}>
              <User size={15} />
              Dashboard ({currentUser.role.replace('_', ' ')})
            </Link>
          ) : (
            <>
              <Link href="/login" className="cb-btn cb-btn-outline cb-btn-sm">
                Login
              </Link>
              <Link href="/register" className="cb-btn cb-btn-secondary cb-btn-sm">
                Register
              </Link>
            </>
          )}
          <Link href="/request-project" className="cb-btn cb-btn-primary cb-btn-sm">
            Request a Project <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--cb-text-primary)',
            cursor: 'pointer',
            padding: '8px'
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--cb-navy-900)',
          borderBottom: '1px solid var(--cb-border-subtle)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', color: 'var(--cb-text-primary)' }}>
            Home
          </Link>
          <Link href="/services" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', color: 'var(--cb-text-primary)' }}>
            Services
          </Link>
          <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', color: 'var(--cb-text-primary)' }}>
            How It Works
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', color: 'var(--cb-text-primary)' }}>
            About
          </Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '15px', color: 'var(--cb-text-primary)' }}>
            Contact
          </Link>
          <div style={{ height: '1px', backgroundColor: 'var(--cb-border-subtle)', margin: '4px 0' }} />
          {currentUser ? (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="cb-btn cb-btn-secondary">
              Go to Dashboard
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="cb-btn cb-btn-outline" style={{ flex: 1 }}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="cb-btn cb-btn-secondary" style={{ flex: 1 }}>
                Register
              </Link>
            </div>
          )}
          <Link href="/request-project" onClick={() => setMobileMenuOpen(false)} className="cb-btn cb-btn-primary">
            Request a Project
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-actions {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
