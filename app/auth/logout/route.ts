import { cookies } from 'next/headers';
import { db } from '../../../lib/db';
import { appOrigin, isLocalRuntime, localHeaders, hashToken, validToken } from '../../../lib/security';
export async function POST(request: Request) {
  if (!isLocalRuntime() || !localHeaders(request.headers,true)) return new Response(null,{status:403});
  const jar = await cookies(); const token=jar.get('timurs_admin')?.value;
  if (validToken(token)) await db.query('DELETE FROM admin_sessions WHERE token_hash=$1',[hashToken(token)]);
  jar.delete('timurs_admin');
  return Response.redirect(`${appOrigin()}/admin/sign-in`,303);
}
