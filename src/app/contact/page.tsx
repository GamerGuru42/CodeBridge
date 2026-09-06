// src/app/contact/page.tsx
'use client';

import { useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Link from 'next/link';
import {
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'NG',
    category: 'Technical Consultation / Scoping',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');
  const [leadRef, setLeadRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFeedback('');

    try {
      const res = await fetch('/api/request-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.name ? `${formData.name} Inquiry` : 'General Client Inquiry',
          contactPerson: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          countryCode: formData.country,
          businessType: 'Direct Contact Inquiry',
          serviceCategory: formData.category,
          requirements: `[Subject: ${formData.subject || 'Direct Message'}]\n\n${formData.message}`,
          estimatedBudget: 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setLeadRef(data.leadId || 'INQ-' + Date.now().toString().slice(-6));
        setFeedback('Your message has been securely received by our technical desk. An engineering scoping specialist will review your brief and reply within 24 business hours.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          country: 'NG',
          category: 'Technical Consultation / Scoping',
          subject: '',
          message: '',
        });
      } else {
        setStatus('error');
        setFeedback(data.error || 'Failed to transmit message. Please verify your details or email us directly at inquiries@marketbridge.com.');
      }
    } catch {
      setStatus('error');
      setFeedback('An unexpected network error occurred. Please try again or reach out directly.');
    }
  };

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        {/* ================================================================= */}
        {/* 1. HERO HEADER                                                    */}
        {/* ================================================================= */}
        <section style={{
          background: 'linear-gradient(180deg, #EDF7FF 0%, #F8FAFC 100%)',
          padding: '64px 0 44px',
          borderBottom: '1px solid #E2E8F0',
        }}>
          <div className="cb-container" style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: '#E0F2FE',
              border: '1px solid #BAE6FD',
              color: '#0284C7',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}>
              <Sparkles size={14} />
              Technical Desk &amp; Commercial Inquiries
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 46px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#0B1B3D',
              marginBottom: '16px',
            }}>
              Connect with{' '}
              <span style={{
                background: 'linear-gradient(135deg, #0284C7 0%, #00B4D8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                CodeBridge
              </span>
            </h1>

            <p style={{
              fontSize: '17px',
              lineHeight: 1.65,
              color: '#475569',
              maxWidth: '680px',
              margin: '0 auto',
            }}>
              Whether you are planning custom software architecture, seeking technical scoping, or inquiring about our authorized sales representative partnership, our engineering desk is ready to assist.
            </p>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. CONTACT LAYOUT                                                 */}
        {/* ================================================================= */}
        <section style={{ padding: '60px 0 90px' }}>
          <div className="cb-container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'flex-start',
            }}>
              {/* Left Column: Regional Hubs & Operational Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Regional Hubs Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '36px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284C7',
                    }}>
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0B1B3D', margin: 0 }}>
                        Regional Operating Hubs
                      </h2>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        Pan-African engineering &amp; client coordination
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Nigeria Hub */}
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}>
                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                          <rect width="12" height="36" fill="#008751" />
                          <rect x="12" width="12" height="36" fill="#FFFFFF" />
                          <rect x="24" width="12" height="36" fill="#008751" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B1B3D' }}>
                          Nigeria Corporate Hub
                        </div>
                        <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px', lineHeight: 1.5 }}>
                          MarketBridge NG LTD • Victoria Island &amp; Lekki Phase 1, Lagos, Nigeria
                        </div>
                        <div style={{ fontSize: '12px', color: '#0284C7', fontWeight: 600, marginTop: '4px' }}>
                          Currency: NGN (₦) • WAT Timezone
                        </div>
                      </div>
                    </div>

                    {/* Kenya Hub */}
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}>
                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                          <rect width="36" height="11" fill="#000000" />
                          <rect y="11" width="36" height="2" fill="#FFFFFF" />
                          <rect y="13" width="36" height="10" fill="#922529" />
                          <rect y="23" width="36" height="2" fill="#FFFFFF" />
                          <rect y="25" width="36" height="11" fill="#008A00" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B1B3D' }}>
                          Kenya Operations Hub
                        </div>
                        <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px', lineHeight: 1.5 }}>
                          Nairobi Tech Corridor • Westlands &amp; Kilimani, Nairobi, Kenya
                        </div>
                        <div style={{ fontSize: '12px', color: '#0284C7', fontWeight: 600, marginTop: '4px' }}>
                          Currency: KES (KSh) • EAT Timezone
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Channel Details */}
                  <div style={{
                    marginTop: '28px',
                    paddingTop: '24px',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ color: '#0284C7', backgroundColor: '#EFF6FF', padding: '8px', borderRadius: '8px' }}>
                        <Mail size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                          Direct Email Desk
                        </div>
                        <a
                          href="mailto:inquiries@marketbridge.com"
                          style={{ fontSize: '14px', fontWeight: 700, color: '#0B1B3D', textDecoration: 'none' }}
                        >
                          inquiries@marketbridge.com
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ color: '#0284C7', backgroundColor: '#EFF6FF', padding: '8px', borderRadius: '8px' }}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                          Operating Hours &amp; Response SLA
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0B1B3D' }}>
                          Mon – Fri: 08:00 – 18:00 (WAT / EAT) • &lt;24h Response
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scoping CTA Card */}
                <div style={{
                  backgroundColor: '#0B1B3D',
                  borderRadius: '16px',
                  padding: '30px',
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 180, 216, 0.25) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#38BDF8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '14px',
                  }}>
                    <HelpCircle size={12} />
                    Ready for Formal Scoping?
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                    Request an Architectural Proposal
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '20px' }}>
                    If you have defined specifications or require an exact milestone quote, jump directly into our interactive project scoping builder.
                  </p>

                  <Link
                    href="/request-project"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    Launch Scoping Builder <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Institutional Note */}
                <div style={{
                  padding: '20px 24px',
                  borderRadius: '12px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  fontSize: '13px',
                  color: '#64748B',
                  lineHeight: 1.6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0B1B3D', marginBottom: '6px' }}>
                    <ShieldCheck size={16} color="#0284C7" />
                    Corporate Entity Verification
                  </div>
                  CodeBridge is an enterprise technology delivery platform owned and operated by <strong>MarketBridge NG LTD</strong>. Technical proposals, milestone agreements, and payment escrows are governed by institutional service level agreements.
                </div>
              </div>

              {/* Right Column: Interactive Contact Form */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '36px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0B1B3D', marginBottom: '6px' }}>
                    Send a Message to Technical Desk
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748B' }}>
                    Fill out the form below. Our engineering desk routes your inquiry to the relevant technical lead.
                  </p>
                </div>

                {status === 'success' && (
                  <div style={{
                    padding: '24px',
                    borderRadius: '12px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    marginBottom: '24px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16A34A', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                      <CheckCircle2 size={22} />
                      Inquiry Transmitted Successfully
                    </div>
                    <p style={{ fontSize: '13px', color: '#166534', lineHeight: 1.6, margin: 0, marginBottom: '14px' }}>
                      {feedback}
                    </p>
                    {leadRef && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#DCFCE7',
                        border: '1px solid #86EFAC',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#15803D',
                      }}>
                        Reference Lead ID: {leadRef}
                      </div>
                    )}
                  </div>
                )}

                {status === 'error' && (
                  <div style={{
                    padding: '16px 18px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '24px',
                    fontSize: '14px',
                  }}>
                    <AlertCircle size={18} />
                    {feedback}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                      Your Full Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sarah Mwangi or John Okafor"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Business Email & Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                        Business Email Address <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@company.com"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+234... or +254..."
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Country Selection with Flag Pills */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                      Operational Market / Country <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, country: 'NG' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formData.country === 'NG' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                          backgroundColor: formData.country === 'NG' ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                            <rect width="12" height="36" fill="#008751" />
                            <rect x="12" width="12" height="36" fill="#FFFFFF" />
                            <rect x="24" width="12" height="36" fill="#008751" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B1B3D' }}>Nigeria</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>WAT • NGN (₦)</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, country: 'KE' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formData.country === 'KE' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                          backgroundColor: formData.country === 'KE' ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                            <rect width="36" height="11" fill="#000000" />
                            <rect y="11" width="36" height="2" fill="#FFFFFF" />
                            <rect y="13" width="36" height="10" fill="#922529" />
                            <rect y="23" width="36" height="2" fill="#FFFFFF" />
                            <rect y="25" width="36" height="11" fill="#008A00" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B1B3D' }}>Kenya</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>EAT • KES (KSh)</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Inquiry Category */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                      Inquiry Category <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Technical Consultation / Scoping">Technical Consultation / Scoping</option>
                      <option value="Custom Software & Web Application">Custom Software &amp; Web Application</option>
                      <option value="Corporate Website or Redesign">Corporate Website or Redesign</option>
                      <option value="E-commerce or Ordering System">E-commerce or Ordering System</option>
                      <option value="Representative Partnership Program">Representative Partnership Program</option>
                      <option value="General Corporate / Legal Inquiry">General Corporate / Legal Inquiry</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                      Subject Line <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Technical scoping inquiry for B2B logistics application"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Message Details */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                      Message Details <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your inquiry, project scope, requirements, or questions in detail..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s ease',
                      marginTop: '8px',
                      opacity: status === 'loading' ? 0.75 : 1,
                    }}
                  >
                    {status === 'loading' ? (
                      <>Transmitting to Technical Desk...</>
                    ) : (
                      <>
                        <Send size={16} />
                        Transmit Message to Technical Desk
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    By transmitting, your inquiry is securely processed under MarketBridge NG LTD governance.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

