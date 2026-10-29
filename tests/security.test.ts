import { test } from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import { hashToken,newToken,validToken,normalizeEmail,localHeaders } from '../lib/security';
import { stripeConfigured,stripeClient } from '../lib/stripe';
test('opaque tokens have 256 bits and hashes do not reveal the token',()=>{const token=newToken();assert.equal(validToken(token),true);assert.notEqual(hashToken(token),token);assert.equal(validToken('../original'),false);assert.equal(new Set(Array.from({length:100},newToken)).size,100);});
test('emails and same-origin checks reject invalid input',()=>{assert.equal(normalizeEmail('Admin@Example.com'),'admin@example.com');for(const email of ['bad','x@example.com\r\nBcc: other@example.com',null])assert.throws(()=>normalizeEmail(email));assert.equal(localHeaders(new Headers({host:'127.0.0.1:3000',origin:'http://attacker.example'}),true),false);assert.equal(localHeaders(new Headers({host:'127.0.0.1:3000'}),true),false);assert.equal(localHeaders(new Headers({host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}),true),true);});
test('Stripe live keys are rejected and no API request is made',()=>{const before=process.env.STRIPE_SECRET_KEY;try{process.env.STRIPE_SECRET_KEY='sk_live_forbidden';assert.equal(stripeConfigured(),false);assert.throws(stripeClient);}finally{if(before===undefined)delete process.env.STRIPE_SECRET_KEY;else process.env.STRIPE_SECRET_KEY=before;}});
test('Stripe SDK verifies raw signatures and rejects tampering',()=>{const stripe=new Stripe('sk_test_synthetic');const payload=JSON.stringify({id:'evt_synthetic',object:'event',type:'checkout.session.completed',livemode:false,data:{object:{id:'cs_test_synthetic'}}});const secret='whsec_synthetic';const header=stripe.webhooks.generateTestHeaderString({payload,secret});assert.equal(stripe.webhooks.constructEvent(payload,header,secret).id,'evt_synthetic');assert.throws(()=>stripe.webhooks.constructEvent(payload+' ',header,secret));assert.throws(()=>stripe.webhooks.constructEvent(payload,header,'whsec_other'));});

test('small form parser bounds chunked bodies before parsing',async()=>{
 const { smallForm }=await import('../lib/http-form');
 const form=await smallForm(new Request('http://127.0.0.1:3000/auth/verify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'token=example'}));assert.equal(form.get('token'),'example');
 await assert.rejects(smallForm(new Request('http://127.0.0.1:3000/auth/verify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'token='+ 'x'.repeat(9000)})),/too large/);
});
