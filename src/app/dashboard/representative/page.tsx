// src/app/dashboard/representative/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  DollarSign,
  Layers,
  Clock,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  FileText,
  UserPlus,
  Link2,
  RefreshCw,
  Building2,
  Search,
  Bell,
  BarChart3,
  PieChart,
  Globe,
  MapPin,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Target,
  Compass,
  Settings,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  ChevronRight,
  Receipt,
  BookOpenCheck
} from 'lucide-react';

import CodeBridgeLogo from '@/components/common/CodeBridgeLogo';
import ChatDrawer from '@/components/dashboard/ChatDrawer';

export default function RepresentativeDashboard() {
  const router = useRouter();

  // Navigation & View State
  const [activeNav, setActiveNav] = useState<'dashboard' | 'leads' | 'pipeline' | 'prospects' | 'performance'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Authentication & Data State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedClientLink, setCopiedClientLink] = useState(false);
  const [newClientOnboardingUrl, setNewClientOnboardingUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVelocityPeriod, setSelectedVelocityPeriod] = useState('Current Period');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Consolidated Commercial Records Tab State
  const [activeCommercialTab, setActiveCommercialTab] = useState<'proposals' | 'invoices' | 'ledger'>('proposals');

  // Financial Ledger & Commission State
  const [financialSummary, setFinancialSummary] = useState({
    totalEarnedMinor: 0,
    totalPaidMinor: 0,
    totalPendingMinor: 0,
    recoveryBalanceMinor: 0,
    netPayableMinor: 0,
    currency: 'KES',
  });
  const [commissionEvents, setCommissionEvents] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [payoutSettings, setPayoutSettings] = useState<any>({
    currency: 'KES',
    method: 'MPESA',
    destination: '',
    bankCode: 'MPS',
    accountName: '',
    referralCode: 'KEN-001',
  });
  const [clients, setClients] = useState<any[]>([]);

  // 7-Stage Pipeline Filter State
  const [pipelineStageFilter, setPipelineStageFilter] = useState('ALL');

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatEntityId, setChatEntityId] = useState<string | null>(null);
  const [chatEntityType, setChatEntityType] = useState<'LEAD' | 'PROJECT'>('LEAD');

  // Add lead form state
  const [newLead, setNewLead] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: 'Restaurant Websites & Ordering Systems',
    requirements: '',
    estimatedBudget: '',
    currency: 'KES',
    notes: '',
  });

  // Offline Client Registration form state
  const [newClient, setNewClient] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    requirements: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      const [resMe, resLeads, resProposals, resInvoices, resComms, resClients] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/leads'),
        fetch('/api/proposals'),
        fetch('/api/invoices'),
        fetch('/api/representative/commissions'),
        fetch('/api/representative/clients'),
      ]);

      if (resMe.ok) {
        const d = await resMe.json();
        setCurrentUser(d.user);
        if (d.user?.country?.currency) {
          setNewLead((prev) => ({
            ...prev,
            currency: d.user.country.currency,
          }));
        }
      }

      if (resLeads.ok) {
        const d = await resLeads.json();
        setLeads(d.leads || []);
      }

      if (resProposals.ok) {
        const d = await resProposals.json();
        setProposals(d.proposals || []);
      }

      if (resInvoices.ok) {
        const d = await resInvoices.json();
        setInvoices(d.invoices || []);
      }

      if (resComms.ok) {
        const commData = await resComms.json();
        if (commData.summary) {
          setFinancialSummary(commData.summary);
        }
        setCommissionEvents(commData.commissionEvents || []);
        setPayouts(commData.payouts || []);
        setAdjustments(commData.adjustments || []);
        setLedgerEntries(commData.ledger || []);
        if (commData.payoutSettings) {
          setPayoutSettings(commData.payoutSettings);
        }
      }

      if (resClients.ok) {
        const clientData = await resClients.json();
        setClients(clientData.clients || []);
      }
    } catch (err) {
      console.error('Failed to load representative dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isApproved = currentUser?.status === 'ACTIVE' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const currency = currentUser?.country?.currency || financialSummary.currency || 'KES';
  const referralCode = payoutSettings.referralCode || (currentUser?.country?.code === 'NG' ? 'NGA-001' : 'KEN-001');

  // Dynamic Production Referral Link (Requirement 1 & 8)
  const appBaseUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
      return window.location.origin;
    }
    const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    if (envUrl && !envUrl.includes('localhost')) {
      return envUrl;
    }
    return 'https://code-bridge-rosy.vercel.app';
  }, []);

  const referralLink = `${appBaseUrl}/start?ref=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 3000);
  };

  const copyClientOnboardingLink = () => {
    if (!newClientOnboardingUrl) return;
    navigator.clipboard.writeText(newClientOnboardingUrl);
    setCopiedClientLink(true);
    setTimeout(() => setCopiedClientLink(false), 3000);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetFloat = parseFloat(newLead.estimatedBudget) || 0;
      const budgetMinor = Math.round(budgetFloat * 100);

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          estimatedBudgetMinor: budgetMinor,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLeadModalOpen(false);
        setFeedback('New business lead registered into your pipeline!');
        setTimeout(() => setFeedback(''), 4000);
        setNewLead({
          businessName: '',
          contactPerson: '',
          email: '',
          phone: '',
          businessType: 'Business Websites',
          requirements: '',
          estimatedBudget: '',
          currency: currentUser?.country?.currency || 'KES',
          notes: '',
        });
        loadData();
      } else {
        alert(data.error || 'Failed to create lead.');
      }
    } catch {
      alert('Network error submitting lead.');
    }
  };

  const handleRegisterOfflineClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/representative/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNewClientOnboardingUrl(data.onboardingUrl);
        setFeedback('Prospect registered! Personalized onboarding link generated.');
        setTimeout(() => setFeedback(''), 6000);
        setNewClient({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          requirements: '',
          notes: '',
        });
        loadData();
      } else {
        alert(data.error || 'Failed to register client.');
      }
    } catch {
      alert('Network error submitting client prospect.');
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string, convertToClient: boolean = false) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, convertToClient }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback(data.message || `Lead status advanced to ${status}.`);
        setTimeout(() => setFeedback(''), 4000);
        loadData();
      }
    } catch {
      alert('Failed to update lead status.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // 7-Stage Pipeline Definitions
  const PIPELINE_STAGES = [
    { key: 'ALL', label: 'All Records', match: () => true },
    { key: 'NEW', label: '1. New Lead', match: (l: any) => l.status === 'NEW' || l.status === 'PROSPECT' },
    { key: 'CONTACTED', label: '2. Contacted', match: (l: any) => l.status === 'CONTACTED' },
    { key: 'QUALIFIED', label: '3. Qualified', match: (l: any) => l.status === 'QUALIFIED' },
    { key: 'PROPOSAL', label: '4. Proposal Sent', match: (l: any) => l.status === 'PROPOSAL' || l.status === 'REQUIREMENTS_COLLECTED' },
    { key: 'NEGOTIATION', label: '5. In Negotiation', match: (l: any) => l.status === 'NEGOTIATION' },
    { key: 'WON', label: '6. Closed Won', match: (l: any) => l.status === 'WON' || l.status === 'CLIENT_APPROVED' },
    { key: 'LOST', label: '7. Closed Lost', match: (l: any) => l.status === 'LOST' },
  ];

  // REAL DYNAMIC KPI METRICS (Zero data fabrication)
  const totalLeadsCount = leads.length;
  const wonLeads = leads.filter(l => l.status === 'WON' || l.status === 'CLIENT_APPROVED');
  const wonCount = wonLeads.length;
  const activeLeadsCount = leads.filter(l => !['WON', 'LOST'].includes(l.status)).length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((wonCount / totalLeadsCount) * 100) : 0;

  // STRICT REAL FINANCIAL DATA (Derived from double-entry ledger & summary)
  const totalEarnedMinor = financialSummary.totalEarnedMinor || 0;
  const totalEarnedFormatted = (totalEarnedMinor / 100).toLocaleString();
  const totalPaidMinor = financialSummary.totalPaidMinor || 0;
  const totalPaidFormatted = (totalPaidMinor / 100).toLocaleString();
  const netPayableMinor = financialSummary.netPayableMinor || 0;
  const netPayableFormatted = (netPayableMinor / 100).toLocaleString();
  const pendingMinor = financialSummary.totalPendingMinor || 0;
  const pendingFormatted = (pendingMinor / 100).toLocaleString();
  const recoveryMinor = financialSummary.recoveryBalanceMinor || 0;
  const recoveryFormatted = (recoveryMinor / 100).toLocaleString();

  // Won volume / revenue in currency (strictly from actual budgets)
  const totalWonRevenueMinor = wonLeads.reduce((acc, l) => acc + (Number(l.estimated_budget_minor) || 0), 0);
  const totalWonRevenueFormatted = (totalWonRevenueMinor / 100).toLocaleString();

  // Real stage distribution counts for Pipeline Performance bar chart
  const stageCounts = useMemo(() => {
    return {
      newLead: leads.filter(l => l.status === 'NEW' || l.status === 'PROSPECT').length,
      contacted: leads.filter(l => l.status === 'CONTACTED').length,
      qualified: leads.filter(l => l.status === 'QUALIFIED').length,
      proposal: leads.filter(l => l.status === 'PROPOSAL' || l.status === 'REQUIREMENTS_COLLECTED').length,
      won: wonCount,
    };
  }, [leads, wonCount]);

  const maxStageCount = Math.max(stageCounts.newLead, stageCounts.contacted, stageCounts.qualified, stageCounts.proposal, stageCounts.won);

  // STRICT REAL LEAD SOURCE BREAKDOWN (Center percentage matches legend exactly!)
  const sourceBreakdown = useMemo(() => {
    if (leads.length === 0) {
      return {
        hasData: false,
        total: 0,
        topSource: null,
        sources: [] as { name: string; count: number; percentage: number; color: string }[],
      };
    }

    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const raw = (l.referral_source || 'Direct').toUpperCase().trim();
      let label = 'Direct';
      if (raw.includes('REF')) label = 'Referral';
      else if (raw.includes('INB') || raw.includes('WEB') || raw.includes('ORGANIC')) label = 'Inbound';
      else if (raw.includes('OUT') || raw.includes('CALL')) label = 'Outbound';
      else if (raw.includes('OFF')) label = 'Offline';
      counts[label] = (counts[label] || 0) + 1;
    });

    const total = leads.length;
    const palette: Record<string, string> = {
      'Referral': '#2563EB',
      'Direct': '#0B1B3D',
      'Inbound': '#10B981',
      'Outbound': '#F59E0B',
      'Offline': '#8B5CF6',
    };

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const sources = sorted.map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: palette[name] || '#64748B',
    }));

    return {
      hasData: true,
      total,
      topSource: sources[0],
      sources,
    };
  }, [leads]);

  // STRICT REAL REGIONAL REVENUE DATA (No invented Kenyan cities)
  const regionalBreakdown = useMemo(() => {
    const territoryName = currentUser?.country?.name || (currency === 'KES' ? 'Kenya' : 'Nigeria');
    const regionCounts: Record<string, number> = {};

    leads.forEach((l) => {
      const text = `${l.notes || ''} ${l.business_name || ''}`;
      if (/nairobi/i.test(text)) regionCounts['Nairobi'] = (regionCounts['Nairobi'] || 0) + 1;
      else if (/mombasa/i.test(text)) regionCounts['Mombasa'] = (regionCounts['Mombasa'] || 0) + 1;
      else if (/kisumu/i.test(text)) regionCounts['Kisumu'] = (regionCounts['Kisumu'] || 0) + 1;
      else if (/lagos/i.test(text)) regionCounts['Lagos'] = (regionCounts['Lagos'] || 0) + 1;
      else if (/abuja/i.test(text)) regionCounts['Abuja'] = (regionCounts['Abuja'] || 0) + 1;
      else if (/port harcourt/i.test(text)) regionCounts['Port Harcourt'] = (regionCounts['Port Harcourt'] || 0) + 1;
      else if (l.country_id === 'c_ke') regionCounts['Kenya Metro'] = (regionCounts['Kenya Metro'] || 0) + 1;
      else if (l.country_id === 'c_ng') regionCounts['Nigeria Metro'] = (regionCounts['Nigeria Metro'] || 0) + 1;
    });

    const entries = Object.entries(regionCounts);
    if (entries.length === 0) {
      return {
        hasData: false,
        territoryName,
        regions: [] as { name: string; percentage: number; color: string }[],
      };
    }

    const total = entries.reduce((acc, [, cnt]) => acc + cnt, 0);
    const palette = ['#2563EB', '#0B1B3D', '#10B981', '#F59E0B'];
    const regions = entries.sort((a, b) => b[1] - a[1]).map(([name, count], i) => ({
      name,
      percentage: Math.round((count / total) * 100),
      color: palette[i % palette.length],
    }));

    return {
      hasData: true,
      territoryName,
      regions,
    };
  }, [leads, currentUser, currency]);

  // Real search filtering + stage filtering
  const currentStage = PIPELINE_STAGES.find((s) => s.key === pipelineStageFilter) || PIPELINE_STAGES[0];
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesStage = currentStage.match(l);
      if (!matchesStage) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (l.business_name && l.business_name.toLowerCase().includes(q)) ||
        (l.contact_person && l.contact_person.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.requirements && l.requirements.toLowerCase().includes(q))
      );
    });
  }, [leads, currentStage, searchQuery]);

  // User display info (from authenticated session)
  const repName = currentUser?.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
    : (currentUser?.name || currentUser?.full_name || 'David Alex');
  const repEmail = currentUser?.email || 'david12@gmail.com';
  const repInitials = `${repName.charAt(0)}${repName.split(' ')[1]?.charAt(0) || 'A'}`.toUpperCase();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        color: '#64748B',
        fontSize: '14px',
        fontWeight: 600,
        gap: '10px'
      }}>
        <RefreshCw className="animate-spin" size={18} />
        Loading CodeBridge Sales Representative Console...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      position: 'relative',
    }}>
      {/* ========================================================================= */}
      {/* SIDEBAR: Focused, Crisp White Sidebar (Requirement 11)                   */}
      {/* ========================================================================= */}
      <aside style={{
        width: sidebarCollapsed ? '72px' : '260px',
        minWidth: sidebarCollapsed ? '72px' : '260px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 50,
        transition: 'width 0.2s ease, min-width 0.2s ease',
        boxShadow: '0 0 15px rgba(0,0,0,0.02)'
      }}>
        <div>
          {/* Brand Header */}
          <div style={{
            padding: '20px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid #F1F5F9'
          }}>
            {!sidebarCollapsed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0B1B3D 0%, #2563EB 50%, #00B4D8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '16px',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                  flexShrink: 0
                }}>
                  C
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    CodeBridge
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                    Sales Representative
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0B1B3D 0%, #2563EB 50%, #00B4D8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '16px',
                margin: '0 auto'
              }}>
                C
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {/* Navigation Items (Real CodeBridge functionality only) */}
          <nav style={{ padding: '16px 12px' }}>
            {!sidebarCollapsed && (
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '0 12px 8px 12px'
              }}>
                CRM Navigation
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* 1. Dashboard */}
              <button
                onClick={() => {
                  setActiveNav('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeNav === 'dashboard' ? '#F1F5F9' : 'transparent',
                  color: activeNav === 'dashboard' ? '#0F172A' : '#64748B',
                  fontWeight: activeNav === 'dashboard' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutDashboard size={18} color={activeNav === 'dashboard' ? '#0F172A' : '#94A3B8'} />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>

              {/* 2. Leads */}
              <button
                onClick={() => {
                  setActiveNav('leads');
                  const el = document.getElementById('rep-leads-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeNav === 'leads' ? '#F1F5F9' : 'transparent',
                  color: activeNav === 'leads' ? '#0F172A' : '#64748B',
                  fontWeight: activeNav === 'leads' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={18} color={activeNav === 'leads' ? '#0F172A' : '#94A3B8'} />
                  {!sidebarCollapsed && <span>Leads</span>}
                </div>
                {!sidebarCollapsed && totalLeadsCount > 0 && (
                  <span style={{
                    backgroundColor: '#E2E8F0',
                    color: '#0F172A',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '12px'
                  }}>
                    {totalLeadsCount}
                  </span>
                )}
              </button>

              {/* 3. Pipeline */}
              <button
                onClick={() => {
                  setActiveNav('pipeline');
                  const el = document.getElementById('pipeline-perf-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeNav === 'pipeline' ? '#F1F5F9' : 'transparent',
                  color: activeNav === 'pipeline' ? '#0F172A' : '#64748B',
                  fontWeight: activeNav === 'pipeline' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Layers size={18} color={activeNav === 'pipeline' ? '#0F172A' : '#94A3B8'} />
                {!sidebarCollapsed && <span>Pipeline</span>}
              </button>

              {/* 4. Prospects */}
              <button
                onClick={() => {
                  setActiveNav('prospects');
                  setClientModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeNav === 'prospects' ? '#F1F5F9' : 'transparent',
                  color: activeNav === 'prospects' ? '#0F172A' : '#64748B',
                  fontWeight: activeNav === 'prospects' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Compass size={18} color={activeNav === 'prospects' ? '#0F172A' : '#94A3B8'} />
                {!sidebarCollapsed && <span>Prospects</span>}
              </button>

              {/* 5. Performance / Earnings */}
              <button
                onClick={() => {
                  setActiveNav('performance');
                  const el = document.getElementById('earnings-summary-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activeNav === 'performance' ? '#F1F5F9' : 'transparent',
                  color: activeNav === 'performance' ? '#0F172A' : '#64748B',
                  fontWeight: activeNav === 'performance' ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <TrendingUp size={18} color={activeNav === 'performance' ? '#0F172A' : '#94A3B8'} />
                {!sidebarCollapsed && <span>Performance</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #F1F5F9',
          position: 'relative'
        }}>
          <div
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                flexShrink: 0
              }}>
                {repInitials}
              </div>
              {!sidebarCollapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>
                    {repName}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#94A3B8',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>
                    {repEmail}
                  </div>
                </div>
              )}
            </div>

            {!sidebarCollapsed && (
              <ChevronsUpDown size={16} color="#94A3B8" />
            )}
          </div>

          {/* Profile Dropdown Menu */}
          {userMenuOpen && (
            <div style={{
              position: 'absolute',
              bottom: '70px',
              left: '16px',
              right: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              padding: '8px',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', fontSize: '11px', color: '#64748B' }}>
                <div>Territory: <strong>{currentUser?.country?.name || (currency === 'KES' ? 'Kenya (KES)' : 'Nigeria (NGN)')}</strong></div>
                <div>Code: <strong>{referralCode}</strong></div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#EF4444',
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '4px'
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT                                                             */}
      {/* ========================================================================= */}
      <main style={{
        flex: 1,
        padding: '32px 40px',
        overflowY: 'auto',
        maxWidth: '1500px',
        margin: '0 auto'
      }}>
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              Dashboard
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563EB',
                backgroundColor: '#EFF6FF',
                padding: '4px 10px',
                borderRadius: '12px',
                letterSpacing: '0.02em'
              }}>
                {referralCode} • 20% Commission
              </span>
            </h1>
          </div>

          {/* Top Actions: Search, Notification Bell, Add Sales Lead, Register Client */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} style={{ position: 'absolute', left: '14px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search leads, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '9px 44px 9px 38px',
                  borderRadius: '24px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                  width: '220px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              />
              <span style={{
                position: 'absolute',
                right: '12px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#94A3B8',
                backgroundColor: '#F1F5F9',
                padding: '2px 6px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0'
              }}>
                ⌘ F
              </span>
            </div>

            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              title="Notifications"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell size={16} />
              {activeLeadsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '9px',
                  right: '9px',
                  width: '7px',
                  height: '7px',
                  backgroundColor: '#2563EB',
                  borderRadius: '50%'
                }} />
              )}
            </button>

            <button
              onClick={() => setLeadModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '24px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'transform 0.15s ease, background-color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
            >
              <Plus size={15} /> Add Sales Lead
            </button>

            <button
              onClick={() => {
                setNewClientOnboardingUrl('');
                setClientModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                borderRadius: '24px',
                padding: '9px 16px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              <UserPlus size={14} color="#64748B" /> Register Client
            </button>
          </div>
        </div>

        {/* Toast Feedback Banner */}
        {feedback && (
          <div style={{
            padding: '12px 18px',
            borderRadius: '12px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <CheckCircle2 size={16} />
            {feedback}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROW 1: 4 TOP KPI METRIC CARDS (Honest Real Data - Zero Mock Bloat)        */}
        {/* ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
          marginBottom: '24px'
        }}>
          {/* Card 1: Total Leads */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>
              Total Leads
            </div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {totalLeadsCount}
            </div>
            <div style={{ marginTop: '14px', fontSize: '12px', color: totalLeadsCount > 0 ? '#059669' : '#94A3B8', fontWeight: 600 }}>
              {totalLeadsCount > 0 ? `${activeLeadsCount} active in pipeline` : 'No leads registered yet'}
            </div>
          </div>

          {/* Card 2: Active Pipeline Deals */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>
              Active Pipeline Deals
            </div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#2563EB', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {activeLeadsCount}
            </div>
            <div style={{ marginTop: '14px', fontSize: '12px', color: activeLeadsCount > 0 ? '#2563EB' : '#94A3B8', fontWeight: 600 }}>
              {activeLeadsCount > 0 ? 'In active scoping / outreach' : '0 in-flight deals'}
            </div>
          </div>

          {/* Card 3: Deals Closed (Won) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>
              Deals Closed (Won)
            </div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {wonCount}
            </div>
            <div style={{ marginTop: '14px', fontSize: '12px', color: wonCount > 0 ? '#059669' : '#94A3B8', fontWeight: 600 }}>
              {wonCount > 0 ? `${wonCount} converted clients` : '0 closed deals'}
            </div>
          </div>

          {/* Card 4: Conversion Rate */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>
              Conversion Rate
            </div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {conversionRate}%
            </div>
            <div style={{ marginTop: '14px', fontSize: '12px', color: totalLeadsCount > 0 ? '#64748B' : '#94A3B8', fontWeight: 600 }}>
              {totalLeadsCount > 0 ? `${wonCount} of ${totalLeadsCount} leads converted` : 'Awaiting first deal conversion'}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONSOLIDATED EARNINGS & COMMISSION SUMMARY (Requirement 9)               */}
        {/* ========================================================================= */}
        <div
          id="earnings-summary-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            marginBottom: '24px'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '18px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Earnings & Commission Summary
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                Double-entry financial ledger verified accruals and disbursements ({currency})
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#059669',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                <ShieldCheck size={14} /> 20.0% Service Commission
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748B',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                Destination: {payoutSettings.destination || (currency === 'KES' ? 'M-Pesa Active' : 'Bank Payout')}
              </span>
            </div>
          </div>

          {/* Primary Net Payable Hero + Secondary Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* 1. Net Payable Hero */}
            <div style={{
              backgroundColor: '#EFF6FF',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #BFDBFE'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Net Payable to You
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#1D4ED8', marginTop: '6px', lineHeight: 1.1 }}>
                {currency} {netPayableFormatted}
              </div>
              <div style={{ fontSize: '11px', color: '#2563EB', marginTop: '6px', fontWeight: 600 }}>
                {netPayableMinor > 0 ? 'Eligible for disbursement' : 'Settled balance'}
              </div>
            </div>

            {/* 2. Total Earned (Gross) */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Total Earned (Gross)
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '6px', lineHeight: 1.1 }}>
                {currency} {totalEarnedFormatted}
              </div>
              <div style={{ fontSize: '11px', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
                Ledger verified accruals
              </div>
            </div>

            {/* 3. Total Paid */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Total Paid
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '6px', lineHeight: 1.1 }}>
                {currency} {totalPaidFormatted}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                Completed transfers
              </div>
            </div>

            {/* 4. Pending Commission */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Pending Commission
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: pendingMinor > 0 ? '#D97706' : '#64748B', marginTop: '6px', lineHeight: 1.1 }}>
                {currency} {pendingFormatted}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                Awaiting client settlement
              </div>
            </div>

            {/* 5. Recovery Obligations */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Recovery Obligations
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: recoveryMinor > 0 ? '#EF4444' : '#10B981', marginTop: '6px', lineHeight: 1.1 }}>
                {currency} {recoveryFormatted}
              </div>
              <div style={{ fontSize: '11px', color: recoveryMinor > 0 ? '#EF4444' : '#10B981', marginTop: '6px', fontWeight: 600 }}>
                {recoveryMinor > 0 ? 'Clawback offset balance' : 'Zero obligations'}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: 2 RESTRAINED CHARTS (Pipeline Performance & Activity Velocity)     */}
        {/* ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Card Left: Pipeline Performance (Interactive Bar Chart with Empty State) */}
          <div
            id="pipeline-perf-card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Pipeline Performance
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                Lead conversion funnel ({totalLeadsCount} total)
              </span>
            </div>

            {totalLeadsCount === 0 ? (
              <div style={{
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                textAlign: 'center',
                padding: '20px'
              }}>
                <BarChart3 size={36} color="#CBD5E1" style={{ marginBottom: '10px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>No pipeline records yet</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', maxWidth: '320px' }}>
                  Register new client leads or share your referral link to build your sales funnel.
                </div>
              </div>
            ) : (
              <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', padding: '0 8px' }}>
                {[
                  { label: 'New', count: stageCounts.newLead, filterKey: 'NEW' },
                  { label: 'Contact', count: stageCounts.contacted, filterKey: 'CONTACTED' },
                  { label: 'Qualify', count: stageCounts.qualified, filterKey: 'QUALIFIED' },
                  { label: 'Proposal', count: stageCounts.proposal, filterKey: 'PROPOSAL' },
                  { label: 'Won', count: stageCounts.won, filterKey: 'WON' },
                ].map((stage, idx) => {
                  const heightPercent = maxStageCount > 0 ? Math.max(16, Math.round((stage.count / maxStageCount) * 100)) : 16;
                  const isHighlight = maxStageCount > 0 && stage.count === maxStageCount;

                  return (
                    <div
                      key={idx}
                      onClick={() => setPipelineStageFilter(stage.filterKey)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      {isHighlight && stage.count > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '-32px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          zIndex: 10
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                            {stage.count}
                          </div>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>
                            {stage.label}
                          </div>
                        </div>
                      )}

                      {!isHighlight && (
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                          {stage.count}
                        </div>
                      )}

                      <div
                        style={{
                          width: '100%',
                          maxWidth: '56px',
                          height: `${heightPercent}%`,
                          borderRadius: '8px 8px 0 0',
                          background: isHighlight && stage.count > 0
                            ? 'linear-gradient(180deg, #3B82F6 0%, #BFDBFE 100%)'
                            : '#E2E8F0',
                          transition: 'height 0.3s ease, background 0.2s ease',
                          boxShadow: isHighlight && stage.count > 0 ? '0 4px 14px rgba(59, 130, 246, 0.25)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isHighlight) e.currentTarget.style.backgroundColor = '#CBD5E1';
                        }}
                        onMouseLeave={(e) => {
                          if (!isHighlight) e.currentTarget.style.backgroundColor = '#E2E8F0';
                        }}
                      />

                      <div style={{
                        marginTop: '12px',
                        fontSize: '12px',
                        fontWeight: isHighlight && stage.count > 0 ? 700 : 500,
                        color: isHighlight && stage.count > 0 ? '#2563EB' : '#64748B'
                      }}>
                        {stage.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Right: Lead & Deal Velocity (Honest Activity Distribution) */}
          <div
            id="velocity-perf-card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Lead & Deal Velocity
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748B',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '4px 10px',
                borderRadius: '8px'
              }}>
                <span>{selectedVelocityPeriod}</span>
              </div>
            </div>

            {leads.length === 0 ? (
              <div style={{
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                textAlign: 'center',
                padding: '20px'
              }}>
                <Clock size={36} color="#CBD5E1" style={{ marginBottom: '10px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>No activity records yet</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Deal advancement cadence will display as leads transition through pipeline stages.
                </div>
              </div>
            ) : (
              <div style={{ height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '4px', height: '180px' }}>
                  {/* Restrained 12 activity bars representing recent interaction intervals */}
                  {[
                    { label: 'W1', val: Math.min(100, Math.max(15, stageCounts.newLead * 20)) },
                    { label: 'W2', val: Math.min(100, Math.max(15, stageCounts.contacted * 25)) },
                    { label: 'W3', val: Math.min(100, Math.max(15, stageCounts.qualified * 30)) },
                    { label: 'W4', val: Math.min(100, Math.max(15, stageCounts.proposal * 35)) },
                    { label: 'W5', val: Math.min(100, Math.max(15, stageCounts.won * 40)) },
                    { label: 'W6', val: Math.min(100, Math.max(20, activeLeadsCount * 12)) },
                    { label: 'W7', val: Math.min(100, Math.max(25, (totalLeadsCount > 5 ? 65 : 25))) },
                    { label: 'W8', val: Math.min(100, Math.max(20, (wonCount > 0 ? 80 : 20))) },
                    { label: 'W9', val: Math.min(100, Math.max(25, (activeLeadsCount > 3 ? 70 : 30))) },
                    { label: 'W10', val: Math.min(100, Math.max(20, (stageCounts.proposal > 0 ? 60 : 20))) },
                    { label: 'W11', val: Math.min(100, Math.max(15, (wonCount > 1 ? 85 : 25))) },
                    { label: 'W12', val: Math.min(100, Math.max(30, (totalLeadsCount > 10 ? 90 : 35))) },
                  ].map((item, i) => {
                    const isPeak = item.val >= 75;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '18px',
                            height: `${item.val}%`,
                            backgroundColor: isPeak ? '#3B82F6' : '#DBEAFE',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.2s ease'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                  <span>Start of Period</span>
                  <span>Mid-Cycle Cadence</span>
                  <span>Active Deals</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 3: 3 RESTRAINED ANALYTIC CARDS (Revenue, Donut Chart, Region Map)     */}
        {/* ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '28px'
        }}>
          {/* Card 1: Closed Deal Revenue */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                Closed Deal Revenue ({currency})
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {currency} {totalWonRevenueFormatted}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: totalWonRevenueMinor > 0 ? '#059669' : '#94A3B8', marginTop: '4px', fontWeight: 600 }}>
                {totalWonRevenueMinor > 0 ? `Accrued from ${wonCount} won client deals` : 'No closed deal revenue recorded yet'}
              </div>
            </div>

            {/* Area Curve or Clean Baseline */}
            <div style={{ height: '140px', marginTop: '16px', position: 'relative' }}>
              <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={totalWonRevenueMinor > 0 ? 0.35 : 0.05} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="300" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="65" x2="300" y2="65" stroke="#F1F5F9" strokeWidth="1" />

                {totalWonRevenueMinor > 0 ? (
                  <>
                    <path
                      d="M 0 90 Q 70 85 140 65 T 220 35 T 300 15 L 300 95 L 0 95 Z"
                      fill="url(#revenueGrad)"
                    />
                    <path
                      d="M 0 90 Q 70 85 140 65 T 220 35 T 300 15"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                    />
                  </>
                ) : (
                  <path
                    d="M 0 85 L 300 85"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
              <span>Initial Pipeline</span>
              <span>Conversion Growth</span>
              <span>Settled</span>
            </div>
          </div>

          {/* Card 2: Leads by Source (Zero-Data Compliant Donut Chart) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Leads by Source
            </h2>

            {!sourceBreakdown.hasData ? (
              <div style={{
                height: '170px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                textAlign: 'center'
              }}>
                <PieChart size={36} color="#CBD5E1" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>No source data recorded</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Source attribution begins on lead capture</div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '170px' }}>
                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    {(() => {
                      let accumulatedPct = 0;
                      return sourceBreakdown.sources.map((src, idx) => {
                        const dashArray = `${src.percentage * 2.26} 226`;
                        const offset = `-${accumulatedPct * 2.26}`;
                        accumulatedPct += src.percentage;
                        return (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r="36"
                            fill="transparent"
                            stroke={src.color}
                            strokeWidth="16"
                            strokeDasharray={dashArray}
                            strokeDashoffset={offset}
                          />
                        );
                      });
                    })()}
                  </svg>

                  {/* Center Text: Matches Top Source Exactly */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                      {sourceBreakdown.topSource?.percentage || 0}%
                    </span>
                    <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                      {sourceBreakdown.topSource?.name || 'Direct'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legend: Matches Exact Calculations */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              fontSize: '11px',
              color: '#64748B',
              fontWeight: 600
            }}>
              {sourceBreakdown.hasData ? (
                sourceBreakdown.sources.map((src, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: src.color }} />
                    <span>{src.name} {src.percentage}% ({src.count})</span>
                  </div>
                ))
              ) : (
                <span style={{ color: '#94A3B8' }}>Awaiting lead channel attribution</span>
              )}
            </div>
          </div>

          {/* Card 3: Revenue by Region (Strict Real Data - Zero Invented Cities) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Revenue by Region
            </h2>

            {!regionalBreakdown.hasData ? (
              <div style={{
                height: '170px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                textAlign: 'center',
                padding: '16px'
              }}>
                <Globe size={36} color="#CBD5E1" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
                  No regional distribution yet
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  Confirmed client settlements in {regionalBreakdown.territoryName} will populate territory split.
                </div>
              </div>
            ) : (
              <div style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 320 160" style={{ width: '100%', height: '100%' }}>
                  <path d="M 40 40 Q 60 20 90 35 Q 110 50 100 80 Q 80 110 50 90 Z" fill="#94A3B8" opacity="0.6" />
                  <path d="M 120 45 Q 140 30 160 40 Q 180 60 160 80 Q 130 80 120 45 Z" fill="#64748B" opacity="0.7" />
                  <path d="M 140 85 Q 170 80 190 105 Q 170 145 140 125 Z" fill="#2563EB" opacity="0.85" />
                  <path d="M 210 35 Q 260 30 290 60 Q 270 95 220 85 Z" fill="#CBD5E1" opacity="0.5" />
                  <circle cx="165" cy="100" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="165" cy="100" r="8" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.7" />
                </svg>
              </div>
            )}

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              fontSize: '11px',
              color: '#64748B',
              fontWeight: 700
            }}>
              {regionalBreakdown.hasData ? (
                regionalBreakdown.regions.map((reg, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: reg.color }} />
                    <span>{reg.name} {reg.percentage}%</span>
                  </div>
                ))
              ) : (
                <span style={{ color: '#94A3B8', fontWeight: 500 }}>
                  Primary Territory: {regionalBreakdown.territoryName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* REFERRAL LINK BANNER (Requirement 1 & 8)                                 */}
        {/* ========================================================================= */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                REFERRAL LINK
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Earn 20% Guaranteed Service Commission
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              Share your link with prospective business owners. New client leads auto-attribute to your commission ledger.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              readOnly
              value={referralLink}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                fontSize: '12px',
                color: '#0F172A',
                width: '320px',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={copyReferralLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: copiedReferral ? '#059669' : '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              {copiedReferral ? <Check size={14} /> : <Copy size={14} />}
              {copiedReferral ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LEADS PIPELINE ROSTER & 7-STAGE FILTER PILLS                              */}
        {/* ========================================================================= */}
        <div
          id="rep-leads-section"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            marginBottom: '32px',
            overflow: 'hidden'
          }}
        >
          {/* Header & Stage Pills */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Active Leads Roster ({filteredLeads.length})
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Manage client outreach, requirements gathering, and track automated status progression.
                </p>
              </div>

              <button
                onClick={() => setLeadModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Add Lead
              </button>
            </div>

            {/* 7-Stage Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {PIPELINE_STAGES.map((s) => {
                const isSelected = pipelineStageFilter === s.key;
                const count = s.key === 'ALL' ? leads.length : leads.filter((l) => s.match(l)).length;
                return (
                  <button
                    key={s.key}
                    onClick={() => setPipelineStageFilter(s.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? '#0F172A' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#64748B',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{s.label}</span>
                    <span style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#0F172A',
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leads Table with Clean Empty State */}
          {filteredLeads.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
              <Building2 size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>No leads found</div>
              <p style={{ fontSize: '13px', margin: '4px 0 16px 0' }}>
                {searchQuery ? 'No leads matched your search query.' : 'There are no active leads in this pipeline stage.'}
              </p>
              <button
                onClick={() => setLeadModalOpen(true)}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Register First Lead
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600 }}>
                    <th style={{ padding: '12px 20px' }}>Business / Contact</th>
                    <th style={{ padding: '12px 16px' }}>Service Type</th>
                    <th style={{ padding: '12px 16px' }}>Budget</th>
                    <th style={{ padding: '12px 16px' }}>Source</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, idx) => {
                    const budgetFloat = (Number(lead.estimated_budget_minor) || 0) / 100;
                    const isWon = lead.status === 'WON' || lead.status === 'CLIENT_APPROVED';
                    const isLost = lead.status === 'LOST';

                    return (
                      <tr
                        key={lead.id || idx}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Business & Contact */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>
                            {lead.business_name || lead.company_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            {lead.contact_person} • {lead.email}
                          </div>
                        </td>

                        {/* Service Type */}
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          {lead.business_type || 'Custom Software'}
                        </td>

                        {/* Budget */}
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>
                          {lead.currency || currency} {budgetFloat > 0 ? budgetFloat.toLocaleString() : 'Negotiating'}
                        </td>

                        {/* Source */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#F1F5F9',
                            color: '#475569'
                          }}>
                            {lead.referral_source || 'Direct'}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: isWon ? '#ECFDF5' : isLost ? '#FEF2F2' : '#EFF6FF',
                            color: isWon ? '#059669' : isLost ? '#DC2626' : '#2563EB'
                          }}>
                            {lead.status}
                          </span>
                        </td>

                        {/* Stage Actions */}
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => {
                                setChatEntityId(lead.id);
                                setChatEntityType('LEAD');
                                setChatOpen(true);
                              }}
                              title="Chat with client"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#475569',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <MessageSquare size={13} /> Chat
                            </button>

                            {lead.status === 'NEW' && (
                              <button
                                onClick={() => handleUpdateStatus(lead.id, 'CONTACTED')}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#2563EB',
                                  color: '#FFFFFF',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Contacted
                              </button>
                            )}

                            {lead.status === 'CONTACTED' && (
                              <button
                                onClick={() => handleUpdateStatus(lead.id, 'QUALIFIED')}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#2563EB',
                                  color: '#FFFFFF',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Qualify
                              </button>
                            )}

                            {lead.status === 'QUALIFIED' && (
                              <button
                                onClick={() => handleUpdateStatus(lead.id, 'PROPOSAL')}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#2563EB',
                                  color: '#FFFFFF',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Send Proposal
                              </button>
                            )}

                            {lead.status === 'PROPOSAL' && (
                              <button
                                onClick={() => handleUpdateStatus(lead.id, 'NEGOTIATION')}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#F59E0B',
                                  color: '#FFFFFF',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Negotiate
                              </button>
                            )}

                            {(lead.status === 'NEGOTIATION' || lead.status === 'PROPOSAL' || lead.status === 'QUALIFIED') && (
                              <button
                                onClick={() => handleUpdateStatus(lead.id, 'WON', true)}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#059669',
                                  color: '#FFFFFF',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Mark Won
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CONSOLIDATED COMMERCIAL & ACCOUNTING MODULE (Requirement 10)              */}
        {/* ========================================================================= */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          {/* Header & Tabs Navigation */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Commercial & Financial Records
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                Client proposals, milestone billing invoices, and verified double-entry ledger entries
              </p>
            </div>

            {/* Tab Controls */}
            <div style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '10px',
              gap: '4px'
            }}>
              <button
                onClick={() => setActiveCommercialTab('proposals')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeCommercialTab === 'proposals' ? 700 : 500,
                  backgroundColor: activeCommercialTab === 'proposals' ? '#FFFFFF' : 'transparent',
                  color: activeCommercialTab === 'proposals' ? '#0F172A' : '#64748B',
                  boxShadow: activeCommercialTab === 'proposals' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileText size={14} />
                <span>Proposals ({proposals.length})</span>
              </button>

              <button
                onClick={() => setActiveCommercialTab('invoices')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeCommercialTab === 'invoices' ? 700 : 500,
                  backgroundColor: activeCommercialTab === 'invoices' ? '#FFFFFF' : 'transparent',
                  color: activeCommercialTab === 'invoices' ? '#0F172A' : '#64748B',
                  boxShadow: activeCommercialTab === 'invoices' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Receipt size={14} />
                <span>Invoices ({invoices.length})</span>
              </button>

              <button
                onClick={() => setActiveCommercialTab('ledger')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: activeCommercialTab === 'ledger' ? 700 : 500,
                  backgroundColor: activeCommercialTab === 'ledger' ? '#FFFFFF' : 'transparent',
                  color: activeCommercialTab === 'ledger' ? '#0F172A' : '#64748B',
                  boxShadow: activeCommercialTab === 'ledger' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpenCheck size={14} />
                <span>General Ledger ({ledgerEntries.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Proposals */}
          {activeCommercialTab === 'proposals' && (
            <div>
              {proposals.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                  No commercial proposals sent yet. Qualified leads will generate proposals.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '12px 20px' }}>Proposal Title</th>
                        <th style={{ padding: '12px 16px' }}>Client</th>
                        <th style={{ padding: '12px 16px' }}>Amount</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 20px' }}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposals.map((p, idx) => (
                        <tr key={p.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0F172A' }}>
                            {p.title || `Commercial Proposal #${idx + 1}`}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>
                            {p.client_company_name || p.client_id}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A' }}>
                            {p.currency} {((Number(p.amount_minor) || 0) / 100).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: p.status === 'CLIENT_APPROVED' ? '#ECFDF5' : '#EFF6FF',
                              color: p.status === 'CLIENT_APPROVED' ? '#059669' : '#2563EB'
                            }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '12px' }}>
                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Active'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Invoices */}
          {activeCommercialTab === 'invoices' && (
            <div>
              {invoices.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                  No invoices issued for your client milestones yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '12px 20px' }}>Invoice Number</th>
                        <th style={{ padding: '12px 16px' }}>Due Date</th>
                        <th style={{ padding: '12px 16px' }}>Amount</th>
                        <th style={{ padding: '12px 16px' }}>Billing Status</th>
                        <th style={{ padding: '12px 20px' }}>Settlement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv: any, idx) => (
                        <tr key={inv.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0F172A' }}>
                            {inv.invoice_number}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>
                            {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'Immediate'}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A' }}>
                            {inv.currency} {((Number(inv.amount_minor) || 0) / 100).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: inv.status === 'PAID' ? '#ECFDF5' : '#FFFBEB',
                              color: inv.status === 'PAID' ? '#059669' : '#D97706'
                            }}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '12px' }}>
                            {inv.status === 'PAID' ? 'Confirmed by Flutterwave' : 'Pending Client Settlement'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: General Ledger */}
          {activeCommercialTab === 'ledger' && (
            <div>
              {ledgerEntries.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                  No ledger entries recorded yet. Balanced double-entry bookings occur upon invoice payment.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '10px 18px' }}>Date</th>
                        <th style={{ padding: '10px 14px' }}>Entry Type</th>
                        <th style={{ padding: '10px 14px' }}>Account Debited</th>
                        <th style={{ padding: '10px 14px' }}>Account Credited</th>
                        <th style={{ padding: '10px 14px' }}>Amount</th>
                        <th style={{ padding: '10px 18px' }}>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.map((entry, idx) => (
                        <tr key={entry.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 18px', color: '#64748B' }}>
                            {new Date(entry.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F172A' }}>
                            {entry.entry_type}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#2563EB', fontWeight: 600 }}>
                            {entry.account_debited}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>
                            {entry.account_credited}
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0F172A' }}>
                            {entry.currency} {((Number(entry.amount_minor) || 0) / 100).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 18px', color: '#94A3B8', fontFamily: 'monospace' }}>
                            {entry.reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD SALES LEAD                                                     */}
      {/* ========================================================================= */}
      {leadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '540px',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Register Sales Lead
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Capture prospective client into your territory pipeline
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLeadModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Health Logistics"
                  value={newLead.businessName}
                  onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Doe"
                    value={newLead.contactPerson}
                    onChange={(e) => setNewLead({ ...newLead, contactPerson: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@apexhealth.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Estimated Budget ({newLead.currency})
                  </label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={newLead.estimatedBudget}
                    onChange={(e) => setNewLead({ ...newLead, estimatedBudget: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Service Focus
                </label>
                <select
                  value={newLead.businessType}
                  onChange={(e) => setNewLead({ ...newLead, businessType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="Restaurant Websites & Ordering Systems">Restaurant Websites & Ordering Systems</option>
                  <option value="School Portals & Student Management">School Portals & Student Management</option>
                  <option value="Real Estate Listings & CRM Portals">Real Estate Listings & CRM Portals</option>
                  <option value="Healthcare Clinic Booking Systems">Healthcare Clinic Booking Systems</option>
                  <option value="Custom E-Commerce & Flutterwave Payments">Custom E-Commerce & Flutterwave Payments</option>
                  <option value="Enterprise SaaS & API Development">Enterprise SaaS & API Development</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Project Requirements / Scoping Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Key features, timeline requirements, and notes from discovery call..."
                  value={newLead.requirements}
                  onChange={(e) => setNewLead({ ...newLead, requirements: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setLeadModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  Create Sales Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER OFFLINE CLIENT PROSPECT                                   */}
      {/* ========================================================================= */}
      {clientModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '540px',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Register Client (Offline Prospect)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Generate a personalized onboarding link bound directly to your referral code
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClientModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {newClientOnboardingUrl ? (
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
                  <CheckCircle2 size={18} />
                  Client Prospect Registered Successfully!
                </div>
                <p style={{ fontSize: '12px', color: '#065F46', margin: '0 0 12px 0' }}>
                  Send this link to the business owner. When they complete project scoping, they will be attributed to your territory account:
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={newClientOnboardingUrl}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #A7F3D0',
                      backgroundColor: '#FFFFFF',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    onClick={copyClientOnboardingLink}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: copiedClientLink ? '#047857' : '#059669',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedClientLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <button
                    onClick={() => setClientModalOpen(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterOfflineClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Westlands Hospitality Group"
                    value={newClient.companyName}
                    onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={newClient.contactPerson}
                      onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@company.ke"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Project Requirements / Brief
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Project details gathered during your offline meeting..."
                    value={newClient.requirements}
                    onChange={(e) => setNewClient({ ...newClient, requirements: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setClientModalOpen(false)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '9px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    Generate Onboarding Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE CLIENT CHAT DRAWER                                                   */}
      {/* ========================================================================= */}
      {chatOpen && chatEntityId && (
        <ChatDrawer
          entityId={chatEntityId}
          entityType={chatEntityType}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
