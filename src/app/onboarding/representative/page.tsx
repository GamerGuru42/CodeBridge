// src/app/onboarding/representative/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import CodeBridgeLogo from '@/components/common/CodeBridgeLogo';

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
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ marginBottom: '14px' }}>
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
            Select your primary operating market. This assigns your localized currency, client lead pricing tiers, and direct 20% commission settlement channel.
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
              {/* Option 1: Nigeria */}
              <div
                onClick={() => setSelectedCountry('NG')}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: selectedCountry === 'NG' ? '2px solid #00B4D8' : '1px solid #CBD5E1',
                  backgroundColor: selectedCountry === 'NG' ? 'rgba(0, 180, 216, 0.06)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  boxShadow: selectedCountry === 'NG' ? '0 4px 12px rgba(0, 180, 216, 0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '28px' }}>🇳🇬</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0B1B3D' }}>
                      Nigeria
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Base Currency: NGN (₦) &bull; West Africa Operations
                    </div>
                  </div>
                </div>
                {selectedCountry === 'NG' ? (
                  <CheckCircle2 size={22} color="#00B4D8" />
                ) : (
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #CBD5E1' }} />
                )}
              </div>

              {/* Option 2: Kenya */}
              <div
                onClick={() => setSelectedCountry('KE')}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: selectedCountry === 'KE' ? '2px solid #00B4D8' : '1px solid #CBD5E1',
                  backgroundColor: selectedCountry === 'KE' ? 'rgba(0, 180, 216, 0.06)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  boxShadow: selectedCountry === 'KE' ? '0 4px 12px rgba(0, 180, 216, 0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '28px' }}>🇰🇪</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0B1B3D' }}>
                      Kenya
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Base Currency: KES (KSh) &bull; East Africa Operations
                    </div>
                  </div>
                </div>
                {selectedCountry === 'KE' ? (
                  <CheckCircle2 size={22} color="#00B4D8" />
                ) : (
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #CBD5E1' }} />
                )}
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
