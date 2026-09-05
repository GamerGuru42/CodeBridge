// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, transaction } from '@/lib/db/connection';
import { hashPassword } from '@/lib/auth/password';
import { signSessionToken } from '@/lib/auth/jwt';
import { SESSION_COOKIE_NAME, getDefaultDashboardPath, recordAuditLog } from '@/lib/auth/session';
import { UserRole, UserStatus } from '@/lib/db/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      countryCode, // 'NG' or 'KE'
      accountType, // 'CLIENT' or 'REPRESENTATIVE'
      companyName,
      industry,
    } = body;

    if (!email || !password || !firstName || !lastName || !accountType) {
      return NextResponse.json(
        { error: 'Please provide all required fields: name, email, password, and account type.' },
        { status: 400 }
      );
    }

    // Security Gate: Strict prevention of administrative role escalation
    const allowedRegistrationRoles: UserRole[] = ['CLIENT', 'REPRESENTATIVE'];
    if (!allowedRegistrationRoles.includes(accountType as UserRole)) {
      return NextResponse.json(
        { error: 'Public registration is only available for Clients and Representatives. Administrative roles cannot be registered publicly.' },
        { status: 403 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await queryOne('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Resolve country
    const targetCountryCode = (countryCode || 'NG').toUpperCase();
    const country = await queryOne('SELECT id, currency FROM countries WHERE code = ?', [targetCountryCode]);
    const countryId = country ? country.id : 'c_ng';

    const userId = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const hashedPassword = await hashPassword(password);

    // Representatives require admin approval before becoming ACTIVE
    const initialStatus: UserStatus = accountType === 'REPRESENTATIVE' ? 'PENDING' : 'ACTIVE';

    // Execute atomic creation transaction
    await transaction(async (tx) => {
      // 1. Insert User
      await tx.execute(`
        INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `, [userId, cleanEmail, hashedPassword, accountType, initialStatus]);

      // 2. Insert Profile
      await tx.execute(`
        INSERT INTO user_profiles (user_id, first_name, last_name, phone, country_id, timezone, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        userId,
        firstName.trim(),
        lastName.trim(),
        phone || '',
        countryId,
        targetCountryCode === 'KE' ? 'Africa/Nairobi' : 'Africa/Lagos'
      ]);

      // 3. Insert Role-specific record
      if (accountType === 'REPRESENTATIVE') {
        const repId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        await tx.execute(`
          INSERT INTO representatives (id, user_id, country_id, approval_status, commission_rate_bps, notes, created_at, updated_at)
          VALUES (?, ?, ?, 'PENDING', 2000, ?, datetime('now'), datetime('now'))
        `, [repId, userId, countryId, 'Public representative application']);
      } else if (accountType === 'CLIENT') {
        const clientId = `cli_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        await tx.execute(`
          INSERT INTO clients (id, user_id, company_name, industry, country_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [clientId, userId, companyName || `${firstName}'s Enterprise`, industry || 'Technology', countryId]);
      }
    });

    // Record audit log
    await recordAuditLog({
      userId,
      action: 'USER_REGISTRATION',
      entity: 'users',
      entityId: userId,
      metadata: { role: accountType, status: initialStatus, country: targetCountryCode },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
    });

    // Sign session token
    const token = await signSessionToken({
      userId,
      email: cleanEmail,
      role: accountType,
      status: initialStatus,
      countryId,
      firstName,
      lastName,
    });

    const targetDashboard = getDefaultDashboardPath(accountType);

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        role: accountType,
        status: initialStatus,
        firstName,
        lastName,
      },
      redirectTo: targetDashboard,
      message: accountType === 'REPRESENTATIVE'
        ? 'Registration successful! Your representative account is pending administrative approval.'
        : 'Welcome to CodeBridge! Your account is active.'
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
