// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'cb_sec_dev_9b83fa1c8502f901ddb4a0808cb4ef018283a0029b4e';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cb_session')?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedSecret);
      session = payload;
    } catch (err) {
      // Invalid or expired token
      session = null;
    }
  }

  // 1. Redirect logged-in users away from auth pages (/login, /register)
  if (session && (pathname === '/login' || pathname === '/register')) {
    const targetDashboard = getDashboardPathForRole(session.role);
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // 2. Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = session.role;

    // RBAC: Route-to-Role Enforcement
    if (pathname.startsWith('/dashboard/super-admin') && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.url));
    }

    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.url));
    }

    if (pathname.startsWith('/dashboard/country-manager') && role !== 'COUNTRY_MANAGER' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.url));
    }

    if (pathname.startsWith('/dashboard/representative') && role !== 'REPRESENTATIVE' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.url));
    }

    if (pathname.startsWith('/dashboard/developer') && role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.url));
    }

    if (pathname.startsWith('/dashboard/client') && role !== 'CLIENT' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.url));
    }
  }

  return NextResponse.next();
}

function getDashboardPathForRole(role: string): string {
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

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register'
  ],
};
