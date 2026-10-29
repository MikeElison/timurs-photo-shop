export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { requireLocalAdmin } from '../../../lib/admin-access';
import { db } from '../../../lib/db';
import { deliverOutbox } from '../../../lib/outbox';
export const metadata={title:'Private test email outbox | Timurs',referrer:'strict-origin' as const};
export default async function Mail(){await requireLocalAdmin();await deliverOutbox();const result=await db.query('SELECT id,recipient,subject,body,created_at,delivered_at FROM email_outbox ORDER BY created_at DESC LIMIT 50');return <section className="admin"><Link href="/admin">← Administration</Link><h1>Private email outbox</h1><p>Local test emails only. These messages have not been sent over the internet. Links in them are private credentials.</p>{result.rows.map(message=><article className="catalogue-message" key={message.id}><h2>{message.subject}</h2><p>To: {message.recipient} · {message.created_at.toISOString()}</p><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{message.body}</pre></article>)}</section>;}
