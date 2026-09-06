// src/app/onboarding/representative/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layers, Globe, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function RepresentativeOnboardingPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<'NG' | 'KE'>('NG');
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
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--cb-bg-page)',
      background: 'radial-gradient(circle at 50% 15%, rgba(217, 119, 6, 0.12), transparent 60%), var(--cb-bg-page)',
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--cb-amber-500)',
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
        <div className="cb-badge cb-badge-amber" style={{ margin: '0 auto', fontSize: '11px', textTransform: 'uppercase' }}>
          Sales Representative Activation
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div className="cb-card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px', textAlign: 'center' }}>
            Which country will you operate in?
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginBottom: '28px', textAlign: 'center', lineHeight: 1.5 }}>
            Select your primary operating market. This assigns your localized currency, client lead pricing tiers, and direct 20% commission settlement channel.
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

          <form onSubmit={handleComplete}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              {/* Nigeria Option */}
              <div
                onClick={() => setSelectedCountry('NG')}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: selectedCountry === 'NG' ? '2px solid var(--cb-emerald-500, #10B981)' : '1px solid var(--cb-border-subtle)',
                  backgroundColor: selectedCountry === 'NG' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '32px' }} role="img" aria-label="Nigeria">🇳🇬</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                      Nigeria
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', marginTop: '2px' }}>
                      Base Currency: <strong>NGN (₦)</strong> &bull; Regional Hub: Lagos
                    </div>
                  </div>
                </div>
                {selectedCountry === 'NG' && (
                  <CheckCircle2 size={22} color="#10B981" />
                )}
              </div>

              {/* Kenya Option */}
              <div
                onClick={() => setSelectedCountry('KE')}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: selectedCountry === 'KE' ? '2px solid var(--cb-amber-500)' : '1px solid var(--cb-border-subtle)',
                  backgroundColor: selectedCountry === 'KE' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '32px' }} role="img" aria-label="Kenya">🇰🇪</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
                      Kenya
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', marginTop: '2px' }}>
                      Base Currency: <strong>KES (KSh)</strong> &bull; Regional Hub: Nairobi
                    </div>
                  </div>
                </div>
                {selectedCountry === 'KE' && (
                  <CheckCircle2 size={22} color="var(--cb-amber-500)" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cb-btn cb-btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--cb-amber-500)',
                color: '#000000',
              }}
            >
              {loading ? 'Activating Representative Workspace...' : 'Complete Onboarding & Enter Workspace'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
