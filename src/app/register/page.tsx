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
                Representative
              </div>
              <span style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>
                Introduce clients, earn 20% commission
              </span>
            </button>
          </div>

          {/* Representative Approval Notice */}
          {accountType === 'REPRESENTATIVE' && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(217, 119, 6, 0.12)',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              color: '#FBBF24',
              fontSize: '12px',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}>
              <strong>Notice:</strong> Representative accounts are registered in <strong>PENDING</strong> status. You will have dashboard access to review training materials, but active client submission requires administrative approval.
            </div>
          )}

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

            {accountType === 'CLIENT' && (
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="cb-btn cb-btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            >
              {loading ? 'Creating Account...' : `Register as ${accountType === 'CLIENT' ? 'Client' : 'Representative'}`}
            </button>
          </form>

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
