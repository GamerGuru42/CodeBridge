// src/app/api/users/profile/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { queryOne, execute } from '@/lib/db/connection';

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone } = body;

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return NextResponse.json({ error: 'First name is required.' }, { status: 400 });
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      return NextResponse.json({ error: 'Last name is required.' }, { status: 400 });
    }

    const sanitizedFirst = firstName.trim();
    const sanitizedLast = lastName.trim();
    const sanitizedPhone = phone ? String(phone).trim() : '';

    await execute(`
      UPDATE user_profiles
      SET first_name = ?, last_name = ?, phone = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `, [sanitizedFirst, sanitizedLast, sanitizedPhone, session.userId]);

    const updatedProfile = await queryOne(`
      SELECT p.first_name, p.last_name, p.phone, u.email, u.role
      FROM users u
      JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [session.userId]);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
