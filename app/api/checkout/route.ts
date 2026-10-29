import { smallForm } from '../../../lib/http-form';
import { randomUUID } from 'node:crypto';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { db } from '../../../lib/db';
import { findUploaded } from '../../../lib/catalog';
import { isPhotoId } from '../../../lib/catalog-validation';
import { stripeClient } from '../../../lib/stripe';
import { appOrigin,isLocalRuntime,localHeaders,normalizeEmail,TEST_LICENCES } from '../../../lib/security';
export async function POST(request: Request) {
  if(!isLocalRuntime() || !localHeaders(request.headers,true)) return Response.json({error:'Local same-origin request required.'},{status:403});
  if(Number(request.headers.get('content-length')??0)>4096) return new Response(null,{status:413});
  let orderId: string | undefined;
  try {
    const stripe=stripeClient();
    const form=await smallForm(request);
    const id=form.get('photoId'), currency=form.get('currency'), licence=form.get('licence');
    if(typeof id!=='string'|| !isPhotoId(id) || !['GBP','EUR','USD'].includes(String(currency)) || !['personal','commercial'].includes(String(licence))) return Response.json({error:'Choose a valid photo, currency, and licence.'},{status:400});
    const email=normalizeEmail(form.get('email'));
    const photo=await findUploaded(id);
    if(!photo) return Response.json({error:'This photo is not available.'},{status:404});
    await stat(path.join(process.cwd(),'.local-data','photos',id,'original'));
    const selectedCurrency=currency as 'GBP'|'EUR'|'USD', selectedLicence=licence as 'personal'|'commercial';
    const amount=photo.prices[selectedCurrency][selectedLicence];
    orderId=randomUUID();
    await db.query('INSERT INTO orders(id,photo_id,email,photo_title,licence,licence_terms,currency,amount) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[orderId,id,email,photo.title,selectedLicence,TEST_LICENCES[selectedLicence],selectedCurrency,amount]);
    const session=await stripe.checkout.sessions.create({ mode:'payment',allowed_payment_method_types:['card'],customer_email:email,
      line_items:[{quantity:1,price_data:{currency:selectedCurrency.toLowerCase(),unit_amount:amount,product_data:{name:`${photo.title} — ${selectedLicence} licence (TEST)`}}}],
      metadata:{order_id:orderId},client_reference_id:orderId,
      success_url:`${appOrigin()}/checkout/return`,cancel_url:`${appOrigin()}/photos/${photo.slug}`,
    },{idempotencyKey:`checkout:${orderId}`});
    if(session.livemode || !session.url || new URL(session.url).hostname!=='checkout.stripe.com' || new URL(session.url).protocol!=='https:') throw new Error('Invalid test Checkout response.');
    await db.query('UPDATE orders SET stripe_session_id=$2 WHERE id=$1',[orderId,session.id]);
    return Response.json({url:session.url});
  } catch {
    if(orderId) await db.query("UPDATE orders SET status='checkout_failed' WHERE id=$1 AND status='pending'",[orderId]);
    return Response.json({error:'Test checkout is unavailable. Ask the administrator to check the Stripe test keys, webhook setup, and photo availability.'},{status:503});
  }
}
