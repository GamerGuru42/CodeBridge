// src/app/request-project/page.tsx
'use client';

import { useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Link from 'next/link';
import { Layers, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export default function RequestProjectPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    countryCode: 'KE',
    businessType: 'Restaurant & Hospitality',
    serviceCategory: 'Restaurant Websites & Ordering Systems',
    requirements: '',
    estimatedBudget: '250000',
    currency: 'KES',
  });

  const [loading, setLoading] = useState(false);
  const [successLead, setSuccessLead] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const servicesList = [
    'Business Websites',
    'E-commerce Websites',
    'Restaurant Websites & Ordering Systems',
    'Property & Airbnb Websites',
    'Booking Systems',
    'Landing Pages',
    'Custom Web Applications',
    'Customer Portals',
    'Admin Dashboards',
    'Custom Business Software',
    'Business Management Systems',
    'Website Redesigns',
    'Maintenance & Technical Support',
    'Hosting & Domain Assistance',
  ];

  const handleCountryChange = (code: string) => {
    setFormData({
      ...formData,
      countryCode: code,
      currency: code === 'NG' ? 'NGN' : 'KES',
      estimatedBudget: code === 'NG' ? '1500000' : '250000',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/request-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessLead(data);
      } else {
        setErrorMsg(data.error || 'Failed to submit project request.');
      }
    } catch {
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ flex: 1, padding: '60px 0 90px' }}>
        <div className="cb-container" style={{ maxWidth: '840px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="cb-badge cb-badge-blue" style={{ marginBottom: '14px' }}>
              Project Scoping & Architecture
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Request a Project Proposal
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
              Provide your business specifications below. Our technology team will analyze your requirements and issue an architectural scope.
            </p>
          </div>

          {successLead ? (
            <div className="cb-card" style={{ padding: '48px 36px', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(5, 150, 105, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#34D399'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
                Project Scoping Request Submitted!
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--cb-text-secondary)', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 24px' }}>
                {successLead.message} Your request has been recorded into our lead tracking engine with Reference ID:
                <span style={{ fontFamily: 'var(--cb-font-mono)', color: 'var(--cb-blue-400)', fontWeight: 700, marginLeft: '6px' }}>
                  {successLead.leadId}
                </span>.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link href="/" className="cb-btn cb-btn-secondary">
                  Return to Home
                </Link>
                <Link href="/login" className="cb-btn cb-btn-primary">
                  Sign In to Track Status <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="cb-card" style={{ padding: '40px' }}>
              {errorMsg && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(225, 29, 72, 0.15)',
                  border: '1px solid rgba(225, 29, 72, 0.3)',
                  color: '#FB7185',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '24px',
                  fontSize: '14px'
                }}>
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--cb-blue-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '16px'
                }}>
                  1. Business & Contact Information
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Business / Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="cb-input"
                      placeholder="e.g. ABC Hospitality Ltd"
                    />
                  </div>

                  <div className="cb-form-group">
                    <label className="cb-label">Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="cb-input"
                      placeholder="Full Name"
                    />
                  </div>
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Business Email *</label>
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
                    <label className="cb-label">Phone Number / WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="cb-input"
                      placeholder="+254... or +234..."
                    />
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--cb-border-subtle)', margin: '24px 0' }} />

                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--cb-blue-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '16px'
                }}>
                  2. Project Scope & Technical Category
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Country of Operation *</label>
                    <select
                      value={formData.countryCode}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="cb-select"
                    >
                      <option value="KE">Kenya (KES)</option>
                      <option value="NG">Nigeria (NGN)</option>
                    </select>
                  </div>

                  <div className="cb-form-group">
                    <label className="cb-label">Primary Technology Service *</label>
                    <select
                      value={formData.serviceCategory}
                      onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                      className="cb-select"
                    >
                      {servicesList.map((srv, idx) => (
                        <option key={idx} value={srv}>{srv}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Detailed Project Requirements & Scope *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="cb-textarea"
                    placeholder="Describe what you want to build, key user journeys, expected timeline, or reference websites..."
                  />
                </div>

                <div className="cb-grid-2">
                  <div className="cb-form-group">
                    <label className="cb-label">Estimated Budget ({formData.currency})</label>
                    <input
                      type="number"
                      step="1000"
                      value={formData.estimatedBudget}
                      onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                      className="cb-input"
                    />
                  </div>

                  <div className="cb-form-group">
                    <label className="cb-label">Currency</label>
                    <input
                      type="text"
                      disabled
                      value={formData.currency}
                      className="cb-input"
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="cb-btn cb-btn-primary cb-btn-lg"
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Processing Project Scope...' : 'Submit Project Request'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
