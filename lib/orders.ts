import type Stripe from 'stripe';
import { randomUUID } from 'node:crypto';
import { db } from './db';
import { newToken, hashToken, validToken, appOrigin } from './security';
export async function fulfilSession(session: Stripe.Checkout.Session) {
  if (session.livemode || session.mode !== 'payment' || session.payment_status !== 'paid') throw new Error('A paid test Checkout session is required.');
  const client=await db.connect();
  try {
    await client.query('BEGIN');
    const result=await client.query('SELECT * FROM orders WHERE stripe_session_id=$1 FOR UPDATE',[session.id]);
    const order=result.rows[0];
    if(!order || session.metadata?.order_id!==order.id || session.amount_total!==order.amount || session.currency?.toUpperCase()!==order.currency) throw new Error('Checkout does not match the recorded order.');
    if(order.status!=='paid') {
      if(order.status!=='pending') throw new Error('Order cannot be fulfilled.');
      const token=newToken();
      await client.query("UPDATE orders SET status='paid', paid_at=now(), access_hash=$2, access_expires_at=now()+interval '30 days' WHERE id=$1",[order.id,hashToken(token)]);
      await client.query('INSERT INTO email_outbox(id,dedupe_key,recipient,subject,body) VALUES($1,$2,$3,$4,$5) ON CONFLICT(dedupe_key) DO NOTHING', [randomUUID(),`purchase:${order.id}`,order.email,'Your Timurs test purchase and download',`TEST PURCHASE — no real payment\nOrder: ${order.id}\nPhoto: ${order.photo_title}\nLicence: ${order.licence}\nTerms: ${order.licence_terms}\nAmount: ${(order.amount/100).toFixed(2)} ${order.currency}\n\nAccess your purchase: ${appOrigin()}/purchases/access?token=${token}\nThis private link works for 30 days in this test environment. It can create fresh download links valid for five minutes. Keep it private.`]);
    }
    await client.query('COMMIT');
  } catch(error) {await client.query('ROLLBACK');throw error;} finally {client.release();}
}
export async function purchaseByToken(token: unknown) {
  if(!validToken(token)) return undefined;
  const result=await db.query("SELECT id,photo_title,licence,licence_terms,amount,currency FROM orders WHERE access_hash=$1 AND access_expires_at>now() AND status='paid'",[hashToken(token)]);
  return result.rows[0];
}
export async function issueDownload(token: unknown) {
  if(!validToken(token)) return undefined;
  const download=newToken();
  const result=await db.query("INSERT INTO download_tokens(token_hash,order_id,expires_at) SELECT $2,id,now()+interval '5 minutes' FROM orders WHERE access_hash=$1 AND access_expires_at>now() AND status='paid' RETURNING order_id",[hashToken(token),hashToken(download)]);
  return result.rowCount ? download : undefined;
}
export async function downloadEntitlement(token: unknown) {
  if(!validToken(token)) return undefined;
  const result=await db.query("SELECT o.id,o.photo_id FROM download_tokens d JOIN orders o ON o.id=d.order_id WHERE d.token_hash=$1 AND d.expires_at>now() AND o.status='paid'",[hashToken(token)]);
  return result.rows[0];
}
