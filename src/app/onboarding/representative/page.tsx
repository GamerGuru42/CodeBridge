// src/app/onboarding/representative/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import CodeBridgeLogo from '@/components/common/CodeBridgeLogo';

export default function RepresentativeOnboardingPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/representative/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: selectedCountry }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(data.redirectTo || '/dashboard/representative');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Failed to finalize representative onboarding.');
      }
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
    }}>
      {/* Top Header with Logout */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
      }}>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <CodeBridgeLogo size="md" variant="dark-text" href="/" />

        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          backgroundColor: '#E0F2FE',
          color: '#0284C7',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          Sales Representative Activation
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.08), 0 0 0 1px #E2E8F0',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0B1B3D', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.02em' }}>
            Which country will you operate in?
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '28px', textAlign: 'center', lineHeight: 1.5 }}>
            Select your primary operating market. This assigns your localized currency, client lead pricing tiers, and direct commission settlement channel.
          </p>

          {errorMsg && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(225, 29, 72, 0.08)',
              border: '1px solid rgba(225, 29, 72, 0.25)',
              color: '#BE123C',
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

          <form onSubmit={handleComplete}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div className="cb-form-group">
                <label className="cb-label" style={{ textAlign: 'left', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#0B1B3D' }}>Country Name *</label>
                <input
                  type="text"
                  required
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="cb-input"
                  placeholder="e.g. United States"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '15px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cb-btn cb-btn-navy"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? 'Activating Profile...' : 'Complete Onboarding & Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
