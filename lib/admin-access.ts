import 'server-only';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
export async function requireLocalAdmin(mutation = false) {
  if (process.env.NODE_ENV !== 'development' || process.env.LOCAL_CATALOG !== '1') notFound();
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  if (!/^(localhost|127\.0\.0\.1):\d+$/.test(host)) notFound();
  if (mutation) {
    const origin = requestHeaders.get('origin');
    if (origin !== `http://${host}`) throw new Error('Local administration requires a same-origin request.');
  }
}
