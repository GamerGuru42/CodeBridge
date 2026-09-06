// src/components/public/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, User, ArrowRight } from 'lucide-react';
import CodeBridgeLogo from '@/components/common/CodeBridgeLogo';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const pathname = usePathname();

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

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header style={{
      borderBottom: '1px solid #F1F5F9',
      backgroundColor: '#FFFFFF',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
    }}>
      <div className="cb-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '74px' }}>
        {/* Brand Lockup with Official Logo */}
        <CodeBridgeLogo size="md" variant="dark-text" href="/" />

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#0B1B3D' : '#475569',
                  transition: 'color 0.15s ease',
                  textDecoration: 'none',
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
          {currentUser ? (
            <Link
              href="/dashboard"
              className="cb-btn cb-btn-navy cb-btn-sm"
              style={{ padding: '8px 18px', gap: '8px' }}
            >
              <User size={15} />
              Dashboard ({currentUser.role.replace('_', ' ')})
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="cb-btn cb-btn-outline-pill cb-btn-sm"
                style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 600 }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="cb-btn cb-btn-navy cb-btn-sm"
                style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 600 }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0F172A',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: pathname === link.href ? '#0B1B3D' : '#475569',
              }}
            >
              {link.name}
            </Link>
          ))}
          <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
          {currentUser ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="cb-btn cb-btn-navy"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="cb-btn cb-btn-outline-pill"
                style={{ flex: 1 }}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="cb-btn cb-btn-navy"
                style={{ flex: 1 }}
              >
                Get Started
              </Link>
            </div>
          )}
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
