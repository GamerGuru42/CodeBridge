// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Briefcase, Users } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<'CLIENT' | 'REPRESENTATIVE'>('CLIENT');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    countryCode: 'KE',
    companyName: '',
    industry: 'Hospitality',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          accountType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Successful registration: navigate to targeted dashboard
        router.push(data.redirectTo || '/dashboard');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Failed to complete registration.');
      }
    } catch {
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--cb-bg-page)',
      background: 'radial-gradient(circle at 50% 15%, rgba(30, 80, 255, 0.12), transparent 60%), var(--cb-bg-page)',
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--cb-blue-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <Layers size={24} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            CODEBRIDGE
          </span>
        </Link>
        <p style={{ fontSize: '14px', color: 'var(--cb-text-muted)' }}>
          "Built for business." &bull; Create your authenticated account
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '540px' }}>
        <div className="cb-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            Create Your Account
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginBottom: '20px' }}>
            Select your participation role in the CodeBridge ecosystem.
          </p>

          {/* Role Type Selector Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <button
              type="button"
              onClick={() => setAccountType('CLIENT')}
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: accountType === 'CLIENT' ? '2px solid var(--cb-blue-600)' : '1px solid var(--cb-border-subtle)',
                backgroundColor: accountType === 'CLIENT' ? 'rgba(30, 80, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: accountType === 'CLIENT' ? '#FFFFFF' : 'var(--cb-text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                <Briefcase size={16} color={accountType === 'CLIENT' ? 'var(--cb-blue-400)' : 'var(--cb-text-muted)'} />
                Client Account
              </div>
              <span style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>
                Request tech services, track project milestones
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('REPRESENTATIVE')}
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: accountType === 'REPRESENTATIVE' ? '2px solid var(--cb-amber-500)' : '1px solid var(--cb-border-subtle)',
                backgroundColor: accountType === 'REPRESENTATIVE' ? 'rgba(217, 119, 6, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: accountType === 'REPRESENTATIVE' ? '#FFFFFF' : 'var(--cb-text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                <Users size={16} color={accountType === 'REPRESENTATIVE' ? 'var(--cb-amber-500)' : 'var(--cb-text-muted)'} />
                Sales Representative
              </div>
              <span style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>
                Introduce clients, earn 20% commission
              </span>
            </button>
          </div>

          {errorMsg && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(225, 29, 72, 0.15)',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              color: '#FB7185',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              fontSize: '13px',
            }}>
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {accountType === 'REPRESENTATIVE' ? (
            /* Sales Representative: Google OAuth Only */
            <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                Sales Representative onboarding is authenticated exclusively via Google for instant verification and automatic workspace activation.
              </p>

              <a
                href="/api/auth/google"
                className="cb-btn"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #E5E7EB',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </a>

              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--cb-text-muted)', fontSize: '12px' }}>
                <CheckCircle2 size={14} color="#10B981" />
                Immediate activation &bull; 20% commission settlement
              </div>
            </div>
          ) : (
            /* Client Account: Standard Registration */
            <form onSubmit={handleRegister}>
              <div className="cb-grid-2">
                <div className="cb-form-group">
                  <label className="cb-label">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="cb-input"
                    placeholder="e.g. Grace"
                  />
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="cb-input"
                    placeholder="e.g. Onyango"
                  />
                </div>
              </div>

              <div className="cb-grid-2">
                <div className="cb-form-group">
                  <label className="cb-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="cb-input"
                    placeholder="name@business.com"
                  />
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Country *</label>
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="cb-select"
                  >
                    <option value="KE">Kenya (KES)</option>
                    <option value="NG">Nigeria (NGN)</option>
                  </select>
                </div>
              </div>

              <div className="cb-grid-2">
                <div className="cb-form-group">
                  <label className="cb-label">Phone Number / WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="cb-input"
                    placeholder="+254... or +234..."
                  />
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="cb-input"
                    placeholder="Minimum 8 characters"
                  />
                </div>
              </div>

              <div className="cb-grid-2">
                <div className="cb-form-group">
                  <label className="cb-label">Company / Enterprise Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="cb-input"
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="cb-select"
                  >
                    <option value="Hospitality">Food, Beverage & Hospitality</option>
                    <option value="Real Estate">Real Estate & Property</option>
                    <option value="E-commerce">Retail & E-commerce</option>
                    <option value="Healthcare">Healthcare & Wellness</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Technology">Technology & SaaS</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cb-btn cb-btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '12px' }}
              >
                {loading ? 'Creating Client Account...' : 'Register as Client'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--cb-text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--cb-blue-400)', fontWeight: 600 }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
