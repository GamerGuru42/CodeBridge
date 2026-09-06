// src/components/dashboard/ProfileSettingsModal.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  User,
  Mail,
  Phone,
  Globe,
  Share2,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Loader2,
  Save,
  ShieldAlert,
} from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdated?: (updatedUser: any) => void;
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: ProfileSettingsModalProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'representative' | 'danger'>('profile');

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Referral link copy state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Deletion flow states
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!isOpen) return null;

  const role = user?.role;
  const isRep = role === 'REPRESENTATIVE';
  const referralCode = user?.representative?.referralCode || '';
  const referralUrl = typeof window !== 'undefined' && referralCode
    ? `${window.location.origin}/start/${referralCode}`
    : `https://codebridge.app/start/${referralCode || 'rep'}`;

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        if (onProfileUpdated) {
          onProfileUpdated({
            ...user,
            firstName,
            lastName,
            phone,
          });
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'Failed to update profile.');
      }
    } catch {
      setSaveError('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isRep && deleteConfirmationInput.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch('/api/representative/delete-account', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        onClose();
        router.push('/login?message=account_deleted');
        router.refresh();
      } else {
        setDeleteError(data.error || 'Failed to delete account.');
        setDeleting(false);
      }
    } catch {
      setDeleteError('An unexpected network error occurred.');
      setDeleting(false);
    }
  };

  const getInitials = () => {
    const f = (user?.firstName || '').charAt(0).toUpperCase();
    const l = (user?.lastName || '').charAt(0).toUpperCase();
    return f + l || 'CB';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: 'var(--cb-bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--cb-border-subtle)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--cb-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--cb-bg-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Avatar Circle */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284C7 0%, #00B4D8 100%)',
                color: '#FFFFFF',
                fontSize: '17px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 180, 216, 0.3)',
              }}
            >
              {getInitials()}
            </div>

            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cb-text-primary)', letterSpacing: '-0.02em' }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '2px' }}>
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cb-text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--cb-border-subtle)',
            backgroundColor: 'var(--cb-bg-subtle)',
            padding: '0 20px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'profile' ? '#00B4D8' : 'var(--cb-text-secondary)',
              borderBottom: activeTab === 'profile' ? '2px solid #00B4D8' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <User size={15} />
            Profile Details
          </button>

          {isRep && (
            <button
              type="button"
              onClick={() => setActiveTab('representative')}
              style={{
                padding: '12px 14px',
                fontSize: '13px',
                fontWeight: 600,
                color: activeTab === 'representative' ? '#00B4D8' : 'var(--cb-text-secondary)',
                borderBottom: activeTab === 'representative' ? '2px solid #00B4D8' : '2px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Share2 size={15} />
              Sales Rep Info
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('danger')}
            style={{
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'danger' ? '#EF4444' : 'var(--cb-text-secondary)',
              borderBottom: activeTab === 'danger' ? '2px solid #EF4444' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldAlert size={15} />
            Account Management
          </button>
        </div>

        {/* Tab Contents */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* =============================================================== */}
          {/* TAB 1: Profile Details Form                                     */}
          {/* =============================================================== */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {saveSuccess && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#10B981',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Check size={16} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {saveError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#EF4444',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{saveError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--cb-text-primary)', marginBottom: '6px' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--cb-border-subtle)',
                      backgroundColor: 'var(--cb-bg-input)',
                      color: 'var(--cb-text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--cb-text-primary)', marginBottom: '6px' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--cb-border-subtle)',
                      backgroundColor: 'var(--cb-bg-input)',
                      color: 'var(--cb-text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--cb-text-primary)', marginBottom: '6px' }}>
                  Email Address (Primary Identity)
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cb-text-muted)' }}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--cb-border-subtle)',
                      backgroundColor: 'var(--cb-bg-subtle)',
                      color: 'var(--cb-text-muted)',
                      fontSize: '14px',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--cb-text-muted)', marginTop: '4px', display: 'block' }}>
                  Managed by your authenticated account identity.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--cb-text-primary)', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cb-text-muted)' }}>
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: '8px',
                        border: '1px solid var(--cb-border-subtle)',
                        backgroundColor: 'var(--cb-bg-input)',
                        color: 'var(--cb-text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--cb-text-primary)', marginBottom: '6px' }}>
                    Operating Region
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cb-text-muted)' }}>
                      <Globe size={16} />
                    </div>
                    <input
                      type="text"
                      disabled
                      value={user?.country?.name ? `${user.country.name} (${user.country.currency || ''})` : 'Global Market'}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: '8px',
                        border: '1px solid var(--cb-border-subtle)',
                        backgroundColor: 'var(--cb-bg-subtle)',
                        color: 'var(--cb-text-muted)',
                        fontSize: '14px',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="cb-btn cb-btn-cyan"
                  style={{
                    padding: '10px 20px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* =============================================================== */}
          {/* TAB 2: Representative Workspace Details                         */}
          {/* =============================================================== */}
          {activeTab === 'representative' && isRep && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--cb-bg-subtle)',
                  border: '1px solid var(--cb-border-subtle)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cb-text-primary)', marginBottom: '4px' }}>
                  Regional Representative Identity
                </div>
                <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                  Share your personalized referral credentials with prospective clients. Any project requested via your link is attributed directly to your commission ledger.
                </p>
              </div>

              {/* Referral Code Box */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--cb-text-primary)', marginBottom: '6px' }}>
                  Your Unique Referral Code
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={referralCode || 'Pending Assignment'}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--cb-border-subtle)',
                      backgroundColor: 'var(--cb-bg-input)',
                      color: 'var(--cb-text-primary)',
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    disabled={!referralCode}
                    className="cb-btn cb-btn-secondary"
                    style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {copiedCode ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>

              {/* Direct Landing Link */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--cb-text-primary)', marginBottom: '6px' }}>
                  Direct Client Intro URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={referralUrl}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--cb-border-subtle)',
                      backgroundColor: 'var(--cb-bg-input)',
                      color: 'var(--cb-text-primary)',
                      fontSize: '13px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={!referralCode}
                    className="cb-btn cb-btn-cyan"
                    style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Commission Stats Card */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginTop: '6px',
                }}
              >
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--cb-bg-subtle)',
                    border: '1px solid var(--cb-border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Commission Rate
                  </span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#00B4D8', marginTop: '4px' }}>
                    {((user?.representative?.commissionRateBps || 2000) / 100).toFixed(1)}%
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--cb-text-secondary)', marginTop: '2px', display: 'block' }}>
                    On confirmed milestone payments
                  </span>
                </div>

                <div
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--cb-bg-subtle)',
                    border: '1px solid var(--cb-border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Approval Status
                  </span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: user?.representative?.status === 'ACTIVE' ? '#10B981' : '#F59E0B', marginTop: '6px' }}>
                    {user?.representative?.status || 'PENDING'}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--cb-text-secondary)', marginTop: '2px', display: 'block' }}>
                    {user?.representative?.status === 'ACTIVE' ? 'Fully authorized representative' : 'Awaiting administrative verification'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: Danger Zone / Account Deletion                           */}
          {/* =============================================================== */}
          {activeTab === 'danger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', marginBottom: '8px' }}>
                  <AlertTriangle size={18} />
                  <strong style={{ fontSize: '14px' }}>Danger Zone</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--cb-text-secondary)', lineHeight: 1.55 }}>
                  {isRep
                    ? 'Deleting your Sales Representative account will permanently remove your representative profile, deactivate your referral code, and cancel your access to client pipelines. Any assigned leads will be unlinked.'
                    : 'Deleting your account is permanent and cannot be undone. All active sessions, notifications, and profile data will be permanently wiped.'}
                </p>
              </div>

              {deleteError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#EF4444',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{deleteError}</span>
                </div>
              )}

              {!confirmingDelete ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EF4444';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
                      e.currentTarget.style.color = '#EF4444';
                    }}
                  >
                    <Trash2 size={16} />
                    {isRep ? 'Delete Sales Representative Account' : 'Delete Account'}
                  </button>
                  <span style={{ fontSize: '11px', color: 'var(--cb-text-muted)', textAlign: 'center' }}>
                    Requires final confirmation step before irreversible execution.
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--cb-bg-subtle)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>
                    Confirm Permanent Deletion
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', lineHeight: 1.5 }}>
                    Please confirm that you want to delete your <strong>{user?.email}</strong> account.
                    To proceed, type <strong>DELETE</strong> in the field below:
                  </p>

                  <input
                    type="text"
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirmationInput}
                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--cb-border-subtle)',
                      backgroundColor: 'var(--cb-bg-input)',
                      color: 'var(--cb-text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingDelete(false);
                        setDeleteConfirmationInput('');
                        setDeleteError('');
                      }}
                      disabled={deleting}
                      className="cb-btn cb-btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteConfirmationInput.trim().toUpperCase() !== 'DELETE'}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: deleting || deleteConfirmationInput.trim().toUpperCase() !== 'DELETE' ? 'not-allowed' : 'pointer',
                        opacity: deleting || deleteConfirmationInput.trim().toUpperCase() !== 'DELETE' ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                      {deleting ? 'Deleting Account...' : 'Permanently Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
