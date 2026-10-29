export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { requireLocalAdmin } from '../../../lib/admin-access';
import { db } from '../../../lib/db';
export const metadata={title:'Test orders | Timurs'};
export default async function Orders(){await requireLocalAdmin();const result=await db.query('SELECT id,email,photo_title,licence,licence_terms,amount,currency,status,created_at FROM orders ORDER BY created_at DESC LIMIT 100');return <section className="admin"><Link href="/admin">← Administration</Link><h1>Test orders</h1><p>Most recent 100 orders. Amounts and licence terms are recorded at checkout and stay fixed.</p>{!result.rowCount&&<p>No orders yet.</p>}{result.rows.map(order=><article className="catalogue-message" key={order.id}><h2>{order.photo_title}</h2><p>{order.status} · {(order.amount/100).toFixed(2)} {order.currency} · {order.licence}</p><p>{order.email} · {order.created_at.toISOString()}</p><p>Order {order.id}</p><details><summary>Purchased licence text</summary><p>{order.licence_terms}</p></details></article>)}</section>;}
