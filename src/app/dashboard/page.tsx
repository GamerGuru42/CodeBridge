// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          switch (data.user.role) {
            case 'SUPER_ADMIN':
              router.replace('/dashboard/super-admin');
              break;
            case 'ADMIN':
              router.replace('/dashboard/admin');
              break;
            case 'COUNTRY_MANAGER':
              router.replace('/dashboard/country-manager');
              break;
            case 'REPRESENTATIVE':
              router.replace('/dashboard/representative');
              break;
            case 'DEVELOPER':
              router.replace('/dashboard/developer');
              break;
            case 'CLIENT':
              router.replace('/dashboard/client');
              break;
            default:
              router.replace('/login');
          }
        } else {
          router.replace('/login');
        }
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cb-text-muted)' }}>
      Routing to your dedicated role dashboard...
    </div>
  );
}
