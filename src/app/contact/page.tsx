// src/app/contact/page.tsx
'use client';

import { useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Mail, Globe2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: 'KE',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/request-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.name + ' Inquiry',
          contactPerson: formData.name,
          email: formData.email,
          phone: '',
          countryCode: formData.country,
          businessType: 'General Inquiry',
          serviceCategory: formData.subject || 'Technical Consultation',
          requirements: formData.message,
          estimatedBudget: 0,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFeedback('Thank you! Your message has been received by our technical desk.');
        setFormData({ name: '', email: '', country: 'KE', subject: '', message: '' });
      } else {
        setStatus('error');
        setFeedback('Failed to submit message. Please try again or email us directly.');
      }
    } catch {
      setStatus('error');
      setFeedback('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ flex: 1, padding: '60px 0 90px' }}>
        <div className="cb-container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 60px' }}>
            <div className="cb-badge cb-badge-blue" style={{ marginBottom: '14px' }}>
              Technical Desk & Inquiries
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Connect with CodeBridge
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--cb-text-secondary)', lineHeight: 1.6 }}>
              Have questions regarding digital product development, technical architecture, or representative partnership? We are here to assist.
            </p>
          </div>

          <div className="cb-grid-2" style={{ gap: '40px', alignItems: 'flex-start' }}>
            {/* Left: Contact Info & Scope */}
            <div>
              <div className="cb-card" style={{ padding: '36px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px' }}>
                  Regional Scope & Inquiries
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--cb-blue-400)', marginTop: '2px' }}>
                      <Globe2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Operational Markets</div>
                      <div style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
                        Serving businesses across Nigeria and Kenya with localized representative consultation.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--cb-blue-400)', marginTop: '2px' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Direct Technical Inquiries</div>
                      <div style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
                        inquiries@marketbridge.com
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--cb-blue-400)', marginTop: '2px' }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Technical Desk Hours</div>
                      <div style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
                        Monday – Friday: 08:00 – 18:00 (WAT / EAT)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '24px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--cb-border-subtle)',
                fontSize: '13px',
                color: 'var(--cb-text-muted)',
                lineHeight: 1.6
              }}>
                <strong>Notice:</strong> CodeBridge is operated by <strong>MarketBridge NG LTD</strong>. Technical proposals and architectural scoping are conducted through secure client portals and authenticated channels.
              </div>
            </div>

            {/* Right: Message Form */}
            <div className="cb-card" style={{ padding: '36px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px' }}>
                Send a Message to Technical Desk
              </h3>

              {status === 'success' && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(5, 150, 105, 0.15)',
                  border: '1px solid rgba(5, 150, 105, 0.3)',
                  color: '#34D399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  <CheckCircle2 size={18} />
                  {feedback}
                </div>
              )}

              {status === 'error' && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(225, 29, 72, 0.15)',
                  border: '1px solid rgba(225, 29, 72, 0.3)',
                  color: '#FB7185',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  <AlertCircle size={18} />
                  {feedback}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="cb-form-group">
                  <label className="cb-label">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="cb-input"
                    placeholder="e.g. Sarah Mwangi or John Okafor"
                  />
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Business Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="cb-input"
                    placeholder="name@yourcompany.com"
                  />
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Country of Operation *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="cb-select"
                  >
                    <option value="KE">Kenya (KES)</option>
                    <option value="NG">Nigeria (NGN)</option>
                  </select>
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Subject / Inquiry Type *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="cb-input"
                    placeholder="e.g. Restaurant Ordering System, Custom Software, Rep Partnership"
                  />
                </div>

                <div className="cb-form-group">
                  <label className="cb-label">Message Details *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="cb-textarea"
                    placeholder="Describe your inquiry, project scope, or questions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="cb-btn cb-btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  {status === 'loading' ? 'Transmitting Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
