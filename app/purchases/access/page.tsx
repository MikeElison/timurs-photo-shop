import { notFound } from 'next/navigation';
import { purchaseByToken } from '../../../lib/orders';
import { isLocalRuntime } from '../../../lib/security';
export const dynamic='force-dynamic';
export const metadata={title:'Your test purchase | Timurs',referrer:'strict-origin' as const};
export default async function PurchaseAccess({searchParams}:{searchParams:Promise<{token?:string}>}) {
  if(!isLocalRuntime())notFound();
  const {token}=await searchParams;const order=await purchaseByToken(token);if(!order)notFound();
  return <section className="intro"><p className="eyebrow">PRIVATE TEST PURCHASE</p><h1>{order.photo_title}</h1><p>Order {order.id}</p><p>{order.licence} licence · {(order.amount/100).toFixed(2)} {order.currency}</p><p>{order.licence_terms}</p><form action="/purchases/download" method="post"><input type="hidden" name="token" value={token}/><button className="primary-button">Download original</button></form><p>A fresh download link expires after five minutes. This private purchase-access link lasts 30 days during testing. It is a bearer credential: keep it private.</p></section>;
}
