// src/lib/auth/jwt.ts
import { SignJWT, jwtVerify } from 'jose';
import { UserRole, UserStatus } from '../db/types';

const JWT_SECRET = process.env.JWT_SECRET || 'cb_sec_dev_9b83fa1c8502f901ddb4a0808cb4ef018283a0029b4e';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  countryId?: string;
  firstName?: string;
  lastName?: string;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}
