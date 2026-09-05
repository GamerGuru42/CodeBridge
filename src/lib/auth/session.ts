// src/lib/auth/session.ts
import { cookies } from 'next/headers';
import { verifySessionToken, SessionPayload } from './jwt';
import { queryOne, execute } from '../db/connection';
import { UserRole } from '../db/types';

export const SESSION_COOKIE_NAME = 'cb_session';

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session) return null;

  const user = await queryOne(`
    SELECT u.id, u.email, u.role, u.status, u.email_verified,
           p.first_name, p.last_name, p.phone, p.country_id, p.timezone,
           c.name as country_name, c.currency as country_currency, c.code as country_code
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    LEFT JOIN countries c ON p.country_id = c.id
    WHERE u.id = ?
  `, [session.userId]);

  return user;
}

export function getDefaultDashboardPath(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/dashboard/super-admin';
    case 'ADMIN':
      return '/dashboard/admin';
    case 'COUNTRY_MANAGER':
      return '/dashboard/country-manager';
    case 'REPRESENTATIVE':
      return '/dashboard/representative';
    case 'DEVELOPER':
      return '/dashboard/developer';
    case 'CLIENT':
      return '/dashboard/client';
    default:
      return '/login';
  }
}

export async function recordAuditLog(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}) {
  try {
    const id = `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await execute(`
      INSERT INTO audit_logs (id, user_id, action, entity, entity_id, metadata_json, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      id,
      params.userId ?? null,
      params.action,
      params.entity,
      params.entityId ?? null,
      params.metadata ? JSON.stringify(params.metadata) : null,
      params.ipAddress ?? '127.0.0.1'
    ]);
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}
