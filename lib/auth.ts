import { randomUUID } from 'node:crypto';
import { db } from './db';
import { newToken, hashToken, validToken, appOrigin } from './security';
export async function requestAdminLogin(email: string) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const admin = await client.query('SELECT email FROM administrators WHERE email=$1 FOR UPDATE', [email]);
    if (!admin.rowCount) { await client.query('COMMIT'); return; }
    const recent = await client.query('SELECT count(*)::int AS count FROM admin_login_tokens WHERE email=$1 AND created_at>now()-interval \'15 minutes\'', [email]);
    if (recent.rows[0].count >= 5) { await client.query('COMMIT'); return; }
    const token = newToken();
    await client.query("INSERT INTO admin_login_tokens(token_hash,email,expires_at) VALUES($1,$2,now()+interval '10 minutes')", [hashToken(token), email]);
    await client.query('INSERT INTO email_outbox(id,dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4,$5)', [randomUUID(), `login:${hashToken(token)}`, email, 'Your Timurs administrator sign-in link', `Open ${appOrigin()}/admin/sign-in?token=${token}\nThen confirm sign-in. This link expires in 10 minutes and works once. If you did not request it, ignore this email.`]);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function redeemAdminLogin(token: unknown) {
  if (!validToken(token)) return undefined;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('DELETE FROM admin_login_tokens WHERE token_hash=$1 AND expires_at>now() RETURNING email', [hashToken(token)]);
    if (!result.rowCount) { await client.query('COMMIT'); return undefined; }
    const session = newToken();
    await client.query("INSERT INTO admin_sessions(token_hash,email,expires_at) VALUES($1,$2,now()+interval '8 hours')", [hashToken(session), result.rows[0].email]);
    await client.query('COMMIT');
    return session;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
