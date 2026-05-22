import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'attendance_session';

function getPassword() {
  return process.env.APP_PASSWORD || process.env.NEXT_PUBLIC_APP_PASSWORD || 'ChangeMe123!';
}

function sign(value) {
  return crypto.createHmac('sha256', getPassword()).update(value).digest('hex');
}

export function createSessionValue() {
  const value = 'authenticated';
  return `${value}.${sign(value)}`;
}

export function isValidSession(value) {
  if (!value) return false;
  const [sessionValue, signature] = value.split('.');
  if (!sessionValue || !signature) return false;
  const expected = sign(sessionValue);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function isAuthed() {
  return isValidSession(cookies().get(COOKIE_NAME)?.value);
}

export function requireAuth() {
  if (!isAuthed()) {
    return Response.json({ error: 'Not authorized' }, { status: 401 });
  }
  return null;
}

export function setSessionCookie() {
  cookies().set(COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function passwordMatches(value) {
  return String(value || '') === getPassword();
}
