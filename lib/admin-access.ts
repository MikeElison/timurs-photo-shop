import 'server-only';
import { cookies, headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from './db';
import { hashToken, validToken, isLocalRuntime, localHeaders } from './security';
export async function requireLocalAdmin(mutation = false) {
  if (!isLocalRuntime() || !localHeaders(await headers(), mutation)) notFound();
  const token = (await cookies()).get('timurs_admin')?.value;
  if (!validToken(token)) redirect('/admin/sign-in');
  const session = await db.query('SELECT email FROM admin_sessions WHERE token_hash=$1 AND expires_at>now()', [hashToken(token)]);
  if (!session.rowCount) redirect('/admin/sign-in');
  return session.rows[0].email as string;
}
