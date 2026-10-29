import { stripeClient } from '../../../../lib/stripe';
import { isLocalRuntime } from '../../../../lib/security';
import { fulfilSession } from '../../../../lib/orders';
import { deliverOutbox } from '../../../../lib/outbox';
export async function POST(request: Request) {
  if(!isLocalRuntime()) return new Response(null,{status:404});
  let stripe;try{stripe=stripeClient();}catch{return new Response('Stripe test configuration missing.',{status:503});}
  const signature=request.headers.get('stripe-signature');
  if(!signature || !request.body) return new Response('Missing signature.',{status:400});
  const reader=request.body.getReader();let length=0;const parts:Uint8Array[]=[];
  for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>256*1024){await reader.cancel();return new Response(null,{status:413});}parts.push(value);}
  let event;
  try{event=stripe.webhooks.constructEvent(Buffer.concat(parts),signature,process.env.STRIPE_WEBHOOK_SECRET!);}catch{return new Response('Invalid signature.',{status:400});}
  if(event.livemode) return new Response('Live events are disabled.',{status:400});
  if(event.type!=='checkout.session.completed' && event.type!=='checkout.session.async_payment_succeeded') return Response.json({received:true});
  try {
    const session=await stripe.checkout.sessions.retrieve(event.data.object.id);
    if(session.livemode) throw new Error('Live session rejected.');
    if(session.payment_status==='paid') await fulfilSession(session);
    await deliverOutbox();
    return Response.json({received:true});
  }catch{return new Response('Fulfilment failed; retry this event.',{status:500});}
}
