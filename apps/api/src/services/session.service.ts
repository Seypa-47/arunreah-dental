import type { CookieOptions } from 'hono/utils/cookie';
import type { Bindings } from '../types/env';

export const sessionCookieName = 'arunreah_admin_session';
export const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

export function createSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export async function hashSessionToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const bytes = new Uint8Array(digest);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getSessionExpiry(now = new Date()): string {
  return new Date(now.getTime() + sessionMaxAgeSeconds * 1000).toISOString();
}

export function getSessionCookieOptions(bindings: Bindings): CookieOptions {
  return {
    httpOnly: true,
    secure: bindings.APP_ENV !== 'development',
    sameSite: 'Lax',
    path: '/',
    maxAge: sessionMaxAgeSeconds,
  };
}
