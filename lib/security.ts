import { createHash, randomBytes } from 'node:crypto';
export const newToken = () => randomBytes(32).toString('hex');
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const validToken = (token: unknown): token is string => typeof token === 'string' && /^[0-9a-f]{64}$/.test(token);
export function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string' || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('Enter a valid email address.');
  return value.trim().toLowerCase();
}
export function appOrigin() {
  const value = process.env.APP_URL ?? 'http://127.0.0.1:3000';
  const url = new URL(value);
  if (url.protocol !== 'http:' || !['127.0.0.1','localhost'].includes(url.hostname) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('This milestone requires a loopback APP_URL.');
  return url.origin;
}
export function isLocalRuntime() { return process.env.NODE_ENV === 'development' && process.env.LOCAL_CATALOG === '1'; }
export function localHeaders(headers: Headers, mutation = false) {
  const origin = appOrigin();
  return headers.get('host') === new URL(origin).host && (!mutation || headers.get('origin') === origin);
}
export const TEST_LICENCES = {
  personal: 'TEST LICENCE v1: private personal use only. Demonstration terms; not a production licence.',
  commercial: 'TEST LICENCE v1: illustrative business-use licence. Demonstration terms; final commercial rights remain to be agreed.',
};
