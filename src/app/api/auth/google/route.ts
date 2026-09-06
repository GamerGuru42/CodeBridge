// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured. GOOGLE_CLIENT_ID environment variable is missing.' },
      { status: 500 }
    );
  }

  // Derive redirect URI (custom override or standard callback path on current host)
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.nextUrl.origin}/api/auth/callback/google`;

  // Cryptographic state parameter to prevent CSRF attacks
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(authUrl.toString());

  // Store state in a short-lived HTTP-only cookie for verification in callback
  response.cookies.set({
    name: 'cb_oauth_state',
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  });

  return response;
}
