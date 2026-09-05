// src/app/login/page.tsx
'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layers, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const demoAccounts = [
    { label: 'Super Admin', email: 'superadmin@marketbridge.com', role: 'SUPER_ADMIN', desc: 'MarketBridge owner' },
    { label: 'Admin / Ops', email: 'ops@marketbridge.com', role: 'ADMIN', desc: 'Operational manager' },
    { label: 'Country Mgr (KE)', email: 'countrymanager.ke@codebridge.com', role: 'COUNTRY_MANAGER', desc: 'Kenya manager' },
    { label: 'Representative (Active)', email: 'rep.kenya@codebridge.com', role: 'REPRESENTATIVE', desc: 'Approved Kenya rep' },
    { label: 'Representative (Pending)', email: 'rep.pending@codebridge.com', role: 'REPRESENTATIVE', desc: 'Pending approval rep' },
    { label: 'Developer', email: 'dev@codebridge.com', role: 'DEVELOPER', desc: 'Engineering team' },
    { label: 'Client', email: 'client@abcrestaurants.com', role: 'CLIENT', desc: 'ABC Restaurant Ltd' },
  ];

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('CodeBridge@2025!');
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        // Successful login: redirect to user's targeted dashboard
        const target = redirectPath || data.redirectTo || '/dashboard';
        router.push(target);
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Failed to authenticate.');
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
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
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
          "Built for business." &bull; Sign in to access your platform dashboard
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div className="cb-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            Account Sign In
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginBottom: '24px' }}>
            Enter your authorized email credentials to proceed.
          </p>

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

          <form onSubmit={handleLogin}>
            <div className="cb-form-group">
              <label className="cb-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cb-input"
                placeholder="name@business.com"
              />
            </div>

            <div className="cb-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="cb-label">Password</label>
                <span style={{ fontSize: '12px', color: 'var(--cb-blue-400)', cursor: 'pointer' }} onClick={() => alert('Password reset links will be transmitted in Phase 2 email provider setup.')}>
                  Forgot Password?
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cb-input"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cb-btn cb-btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            >
              {loading ? 'Verifying Authorization...' : 'Sign In to Portal'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--cb-text-secondary)' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: 'var(--cb-blue-400)', fontWeight: 600 }}>
              Register here
            </Link>
          </div>
        </div>

        {/* Development Quick Fill / Demo Credentials Box (Non-production only) */}
        {(process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === 'true') && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: 'rgba(217, 119, 6, 0.06)',
            border: '1px dashed rgba(217, 119, 6, 0.35)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <KeyRound size={16} color="var(--cb-amber-500)" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cb-amber-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Development Environment: Quick-Fill Roles
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--cb-text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
              Authorized testing profiles (Password: <code>CodeBridge@2025!</code>). <em>Hidden automatically in production.</em>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickFill(acc.email)}
                  className="cb-btn cb-btn-outline cb-btn-sm"
                  style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'flex-start', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={`${acc.email} (${acc.desc})`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--cb-bg-page)', color: 'var(--cb-text-muted)' }}>
        Loading CodeBridge Authentication...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

