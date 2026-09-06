// src/app/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layers,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  ShieldCheck,
  Globe2,
  AlertTriangle,
  Code,
  FolderGit2,
  CheckSquare,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.authenticated) {
          setUser(data.user);
          // Fetch unread count after auth
          fetch('/api/messages/unread-count')
            .then(res => res.json())
            .then(d => {
              if (d.unreadCount) setUnreadCount(d.unreadCount);
            })
            .catch(console.error);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--cb-bg-page)',
        color: 'var(--cb-text-secondary)',
        fontSize: '14px'
      }}>
        Verifying CodeBridge Authorization...
      </div>
    );
  }

  const role = user?.role;

  // Generate role-specific navigation menu
  const getNavLinks = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { href: '/dashboard/super-admin', label: 'Platform Executive', icon: ShieldCheck },
          { href: '/dashboard/admin', label: 'Operations & Approvals', icon: LayoutDashboard },
          { href: '/dashboard/representative', label: 'Rep View Simulator', icon: Users },
          { href: '/dashboard/country-manager', label: 'Regional View', icon: Globe2 },
          { href: '/dashboard/client', label: 'Client View Simulator', icon: Briefcase },
          { href: '/dashboard/developer', label: 'Developer View', icon: Code },
        ];
      case 'ADMIN':
        return [
          { href: '/dashboard/admin', label: 'Operations Console', icon: LayoutDashboard },
          { href: '/dashboard/country-manager', label: 'Regional Metrics', icon: Globe2 },
          { href: '/dashboard/developer', label: 'Engineering Queue', icon: Code },
        ];
      case 'COUNTRY_MANAGER':
        return [
          { href: '/dashboard/country-manager', label: 'Country Oversight', icon: Globe2 },
          { href: '/dashboard/representative', label: 'Reps Pipeline', icon: Users },
        ];
      case 'REPRESENTATIVE':
        return [
          { href: '/dashboard/representative', label: 'My Leads & Pipeline', icon: LayoutDashboard },
          { href: '/dashboard/representative/clients', label: 'My Clients & Projects', icon: Briefcase, badge: unreadCount },
        ];
      case 'DEVELOPER':
        return [
          { href: '/dashboard/developer', label: 'Assigned Engineering', icon: Code },
          { href: '/dashboard/client', label: 'Project Specs', icon: FolderGit2 },
        ];
      case 'CLIENT':
        return [
          { href: '/dashboard/client', label: 'My Projects & Milestones', icon: Briefcase, badge: unreadCount },
          { href: '/request-project', label: 'Request New Project', icon: CheckSquare },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getRoleBadgeClass = () => {
    if (role === 'SUPER_ADMIN') return 'cb-badge-rose';
    if (role === 'ADMIN') return 'cb-badge-blue';
    if (role === 'COUNTRY_MANAGER') return 'cb-badge-emerald';
    if (role === 'REPRESENTATIVE') return 'cb-badge-amber';
    if (role === 'DEVELOPER') return 'cb-badge-blue';
    return 'cb-badge-neutral';
  };

  return (
    <div className="cb-dashboard-layout">
      {/* Sidebar */}
      <aside className="cb-sidebar">
        <div className="cb-sidebar-header">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'var(--cb-blue-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                CODEBRIDGE
              </div>
              <div style={{ fontSize: '10px', color: 'var(--cb-text-muted)', fontWeight: 600 }}>
                BY MARKETBRIDGE NG
              </div>
            </div>
          </Link>
        </div>

        {/* User Role Card */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cb-border-subtle)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '11px', color: 'var(--cb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Active Access Tier
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`cb-badge ${getRoleBadgeClass()}`}>
              {role?.replace('_', ' ')}
            </span>
            {user?.country?.code && (
              <span className="cb-badge cb-badge-neutral" style={{ fontSize: '11px' }}>
                {user.country.code}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="cb-sidebar-nav">
          {navLinks.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard/representative' && item.href !== '/dashboard/admin' && item.href !== '/dashboard/client' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={idx}
                href={item.href}
                className={`cb-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {(item as any).badge > 0 && (
                  <span style={{
                    backgroundColor: 'var(--cb-blue-600)',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px'
                  }}>
                    {(item as any).badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--cb-border-subtle)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--cb-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="cb-btn cb-btn-outline cb-btn-sm"
            style={{ width: '100%', gap: '6px' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <div className="cb-dashboard-main">
        {/* Topbar */}
        <header className="cb-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
              {user?.firstName} {user?.lastName}
            </span>
            {user?.country?.name && (
              <span style={{ fontSize: '12px', color: 'var(--cb-text-muted)' }}>
                &bull; {user.country.name} ({user.country.currency || ''})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#F87171',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </header>

        {/* Representative Approval Warning Banner if Pending */}
        {role === 'REPRESENTATIVE' && user?.representative?.status === 'PENDING' && (
          <div style={{
            backgroundColor: 'rgba(217, 119, 6, 0.15)',
            borderBottom: '1px solid rgba(217, 119, 6, 0.3)',
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#FBBF24',
            fontSize: '13px'
          }}>
            <AlertTriangle size={18} />
            <div>
              <strong>Account Status: Pending Administrative Approval.</strong> Your representative application is currently in queue. You can explore the portal and review materials, but lead submission and active commission accrual are locked until approved by an administrator.
            </div>
          </div>
        )}

        {/* Content View */}
        <main className="cb-dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
