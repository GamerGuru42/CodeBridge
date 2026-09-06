// src/app/request-project/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  Mail,
  Phone,
  FileText,
  DollarSign,
  HelpCircle
} from 'lucide-react';

function RequestProjectContent() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get('service') || 'Business Websites';

  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    countryCode: 'NG',
    businessType: 'Corporate & SME',
    serviceCategory: 'Business Websites',
    requirements: '',
    estimatedBudget: '1500000',
    currency: 'NGN',
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
    'Modern Website Redesigns',
    'Maintenance & Technical Support',
    'Cloud Hosting & Domain Architecture',
  ];

  // Sync service from URL if provided
  useEffect(() => {
    if (initialService && servicesList.includes(initialService)) {
      setFormData(prev => ({ ...prev, serviceCategory: initialService }));
    }
  }, [initialService]);

  const handleCountryChange = (code: string) => {
    setFormData(prev => ({
      ...prev,
      countryCode: code,
      currency: code === 'NG' ? 'NGN' : 'KES',
      estimatedBudget: code === 'NG' ? '1500000' : '250000',
    }));
  };

  const budgetPresets = formData.currency === 'NGN' ? [
    { label: 'Starter MVP', value: '750000', display: '₦750K' },
    { label: 'Commercial Grade', value: '1500000', display: '₦1.5M' },
    { label: 'Custom Platform', value: '3500000', display: '₦3.5M' },
    { label: 'Enterprise Scale', value: '7000000', display: '₦7M+' },
  ] : [
    { label: 'Starter MVP', value: '120000', display: 'KSh 120K' },
    { label: 'Commercial Grade', value: '250000', display: 'KSh 250K' },
    { label: 'Custom Platform', value: '500000', display: 'KSh 500K' },
    { label: 'Enterprise Scale', value: '1000000', display: 'KSh 1M+' },
  ];

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

      <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        {/* ================================================================= */}
        {/* 1. HERO HEADER                                                    */}
        {/* ================================================================= */}
        <section style={{
          background: 'linear-gradient(180deg, #EDF7FF 0%, #F8FAFC 100%)',
          padding: '64px 0 44px',
          borderBottom: '1px solid #E2E8F0',
        }}>
          <div className="cb-container" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#0B1B3D',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                }}
              >
                <ArrowLeft size={14} />
                Return to Home
              </Link>
            </div>

            <div style={{ textAlign: 'center' }}>
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
              Architectural Scoping &amp; Fixed-Price Proposal
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 46px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#0B1B3D',
              marginBottom: '16px',
            }}>
              Request a Project{' '}
              <span style={{
                background: 'linear-gradient(135deg, #0284C7 0%, #00B4D8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Architecture Proposal
              </span>
            </h1>

            <p style={{
              fontSize: '17px',
              lineHeight: 1.65,
              color: '#475569',
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              Provide your functional requirements below. Our engineering leads will review your specifications and formulate a structured milestone scope with institutional escrow guarantees.
            </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. MAIN SCOPING LAYOUT                                            */}
        {/* ================================================================= */}
        <section style={{ padding: '60px 0 90px' }}>
          <div className="cb-container" style={{ maxWidth: '1040px' }}>
            {successLead ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '60px 40px',
                textAlign: 'center',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
                maxWidth: '680px',
                margin: '0 auto',
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  border: '2px solid #86EFAC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  color: '#16A34A',
                }}>
                  <CheckCircle2 size={40} />
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0B1B3D', marginBottom: '12px' }}>
                  Project Scoping Request Submitted!
                </h2>

                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.65, marginBottom: '24px' }}>
                  {successLead.message} Your technical requirements have been recorded into our project evaluation queue with permanent reference:
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0284C7',
                  marginBottom: '32px',
                }}>
                  Reference ID: {successLead.leadId}
                </div>

                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  textAlign: 'left',
                  marginBottom: '32px',
                  fontSize: '13px',
                  color: '#166534',
                  lineHeight: 1.6,
                }}>
                  <strong>What happens next?</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                    <li>Our engineering desk analyzes your technical scope &amp; integration points.</li>
                    <li>We prepare a formal Statement of Work (SOW) with 50/30/20 commercial milestones.</li>
                    <li>A senior technical lead contacts you within 24 business hours to finalize deliverables.</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    href="/"
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#334155',
                      fontSize: '14px',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Return to Home
                  </Link>

                  <Link
                    href="/login"
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Sign In to Client Portal <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '36px',
                alignItems: 'flex-start',
              }}>
                {/* Form Card (Left/Main) */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  padding: '38px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  gridColumn: 'span 2',
                }}>
                  {errorMsg && (
                    <div style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '28px',
                      fontSize: '14px',
                    }}>
                      <AlertCircle size={18} />
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {/* Section 1: Business Identity */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#0284C7',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '16px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #F1F5F9',
                      }}>
                        <Building size={16} />
                        1. Company &amp; Primary Contact
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                            Business / Company Name <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            placeholder="e.g. Acme Logistics Ltd"
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              color: '#0F172A',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                            Contact Person <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            placeholder="Full Name &amp; Title"
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              color: '#0F172A',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                            Business Email <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="contact@company.com"
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              color: '#0F172A',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                            Phone / WhatsApp Number
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
                              color: '#0F172A',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Market & Service Selection */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#0284C7',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '16px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #F1F5F9',
                      }}>
                        <FileText size={16} />
                        2. Market Region &amp; Technology Category
                      </div>

                      {/* Country Flag Cards */}
                      <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                          Operating Market &amp; Billing Jurisdiction <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          <button
                            type="button"
                            onClick={() => handleCountryChange('NG')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 16px',
                              borderRadius: '10px',
                              border: formData.countryCode === 'NG' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                              backgroundColor: formData.countryCode === 'NG' ? '#EFF6FF' : '#FFFFFF',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                                <rect width="12" height="36" fill="#008751" />
                                <rect x="12" width="12" height="36" fill="#FFFFFF" />
                                <rect x="24" width="12" height="36" fill="#008751" />
                              </svg>
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B1B3D' }}>Nigeria Hub</div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>Currency: NGN (₦)</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCountryChange('KE')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 16px',
                              borderRadius: '10px',
                              border: formData.countryCode === 'KE' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                              backgroundColor: formData.countryCode === 'KE' ? '#EFF6FF' : '#FFFFFF',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                                <rect width="36" height="11" fill="#000000" />
                                <rect y="11" width="36" height="2" fill="#FFFFFF" />
                                <rect y="13" width="36" height="10" fill="#922529" />
                                <rect y="23" width="36" height="2" fill="#FFFFFF" />
                                <rect y="25" width="36" height="11" fill="#008A00" />
                              </svg>
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B1B3D' }}>Kenya Hub</div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>Currency: KES (KSh)</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Service Category Selection */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                            Primary Technology Discipline <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <select
                            value={formData.serviceCategory}
                            onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              color: '#0F172A',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          >
                            {servicesList.map((srv, idx) => (
                              <option key={idx} value={srv}>{srv}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                            Business Industry Sector
                          </label>
                          <select
                            value={formData.businessType}
                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              color: '#0F172A',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          >
                            <option value="Corporate & SME">Corporate &amp; Professional Services</option>
                            <option value="Retail & Commerce">Retail &amp; E-commerce</option>
                            <option value="Hospitality & Restaurant">Hospitality &amp; Restaurant</option>
                            <option value="Real Estate & Property">Real Estate &amp; Property</option>
                            <option value="Logistics & Transport">Logistics &amp; Transport</option>
                            <option value="Financial & Fintech">Financial &amp; Professional Services</option>
                            <option value="Healthcare & Wellness">Healthcare &amp; Wellness</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Requirements & Budget */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#0284C7',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '16px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #F1F5F9',
                      }}>
                        <DollarSign size={16} />
                        3. Scope Specifications &amp; Commercial Target
                      </div>

                      {/* Detailed Requirements */}
                      <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                          Functional Scope &amp; Deliverables Description <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={formData.requirements}
                          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                          placeholder="Describe the application goals, key features, required user roles, existing systems to integrate with, or benchmark websites..."
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            color: '#0F172A',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            outline: 'none',
                            boxSizing: 'border-box',
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      {/* Budget Presets & Custom Input */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                          Commercial Budget Target ({formData.currency})
                        </label>

                        {/* Quick Presets */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: '10px',
                          marginBottom: '14px',
                        }}>
                          {budgetPresets.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData({ ...formData, estimatedBudget: preset.value })}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: formData.estimatedBudget === preset.value ? '2px solid #0284C7' : '1px solid #CBD5E1',
                                backgroundColor: formData.estimatedBudget === preset.value ? '#EFF6FF' : '#FFFFFF',
                                cursor: 'pointer',
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0B1B3D' }}>{preset.display}</div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>{preset.label}</div>
                            </button>
                          ))}
                        </div>

                        {/* Numeric Custom Input */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                          <input
                            type="number"
                            step="1000"
                            value={formData.estimatedBudget}
                            onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                            placeholder="Custom estimated budget"
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              color: '#0F172A',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                          <div style={{
                            padding: '11px 18px',
                            borderRadius: '8px',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            fontWeight: 700,
                            color: '#475569',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                          }}>
                            {formData.currency}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '16px',
                          borderRadius: '10px',
                          backgroundColor: '#0284C7',
                          color: '#FFFFFF',
                          fontSize: '16px',
                          fontWeight: 800,
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                          transition: 'background-color 0.2s ease',
                          opacity: loading ? 0.75 : 1,
                        }}
                      >
                        {loading ? 'Processing Project Scope...' : 'Submit Scoping Request for Architectural Review'}
                        {!loading && <ArrowRight size={18} />}
                      </button>

                      <div style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                        Your specifications are encrypted and protected under our non-disclosure corporate framework.
                      </div>
                    </div>
                  </form>
                </div>

                {/* Right Side Info Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Escrow Guarantee Card */}
                  <div style={{
                    backgroundColor: '#0B1B3D',
                    borderRadius: '16px',
                    padding: '28px',
                    color: '#FFFFFF',
                  }}>
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
                      <ShieldCheck size={14} />
                      Commercial Milestone Escrow
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px' }}>
                      Client Capital Protection
                    </h3>

                    <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '20px' }}>
                      CodeBridge operates strictly under institutional milestone-based disbursement:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                          <span style={{ color: '#38BDF8' }}>50% Initial Deposit</span>
                          <span style={{ color: '#E2E8F0' }}>Held in Escrow</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          Secures engineering allocation &amp; begins sprint 1 architecture.
                        </div>
                      </div>

                      <div style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                          <span style={{ color: '#38BDF8' }}>30% Milestone Demo</span>
                          <span style={{ color: '#E2E8F0' }}>Staging Approval</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          Released only after interactive review of live functional build.
                        </div>
                      </div>

                      <div style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                          <span style={{ color: '#38BDF8' }}>20% Final Handover</span>
                          <span style={{ color: '#E2E8F0' }}>100% IP Transfer</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          Disbursed upon production deployment and git repo transfer.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Need Help Scoping Card */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '28px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0B1B3D', marginBottom: '8px' }}>
                      <HelpCircle size={18} color="#0284C7" />
                      Need Help Structuring Scope?
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '16px' }}>
                      If your technical requirements are still evolving, our technical desk can host a 20-minute scoping consultation to clarify features and deliverables.
                    </p>
                    <Link
                      href="/contact"
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0284C7',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      Speak with Technical Desk <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function RequestProjectPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', gap: '16px' }}>
        <div style={{ color: '#0284C7', fontWeight: 700 }}>Loading Scoping Engine...</div>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#0B1B3D',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} />
          Return to Home
        </Link>
      </div>
    }>
      <RequestProjectContent />
    </Suspense>
  );
}

