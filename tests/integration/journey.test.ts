import { test,after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile,unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type Stripe from 'stripe';
import { db } from '../../lib/db';
import { requestAdminLogin,redeemAdminLogin } from '../../lib/auth';
import { fulfilSession,purchaseByToken,issueDownload,downloadEntitlement } from '../../lib/orders';
import { hashToken,newToken } from '../../lib/security';
import { storePhoto,removePhoto } from '../../lib/photo-storage';
import { deliverOutbox } from '../../lib/outbox';
const base='http://127.0.0.1:3000';
after(async()=>{await db.end();});
test('admin links are allowlisted, single-use, expiring; sessions protect pages and logout revokes them',async()=>{
 const email=`review-${randomUUID()}@example.invalid`;
 let cookie='';const mailIds:string[]=[];
 try{
  for(const route of ['/admin','/admin/orders','/admin/mail']){const response=await fetch(base+route,{redirect:'manual'});assert.equal(response.status,307);assert.ok(response.headers.get('location')?.includes('/admin/sign-in'));}
  await requestAdminLogin(email);assert.equal((await db.query('SELECT 1 FROM email_outbox WHERE recipient=$1',[email])).rowCount,0);
  await db.query('INSERT INTO administrators(email) VALUES($1)',[email]);
  await requestAdminLogin(email);
  const messages=await db.query('SELECT id,body FROM email_outbox WHERE recipient=$1',[email]);mailIds.push(...messages.rows.map(row=>row.id));
  const token=messages.rows[0].body.match(/token=([a-f0-9]{64})/)[1];
  const before=await fetch(`${base}/admin/sign-in?token=${token}`);assert.equal(before.status,200);
  const confirmations=await Promise.all([redeemAdminLogin(token),redeemAdminLogin(token)]);assert.equal(confirmations.filter(Boolean).length,1);
  cookie=`timurs_admin=${confirmations.find(Boolean)}`;
  const httpToken=newToken();await db.query("INSERT INTO admin_login_tokens(token_hash,email,expires_at) VALUES($1,$2,now()+interval '10 minutes')",[hashToken(httpToken),email]);
  const confirmation=await fetch(base+'/auth/verify',{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:httpToken}),redirect:'manual'});
  assert.equal(confirmation.status,303);const setCookie=confirmation.headers.get('set-cookie')!;
  assert.ok(setCookie.includes('HttpOnly'));assert.ok(setCookie.includes('SameSite=strict'));
  cookie=setCookie.split(';')[0];
  const replay=await fetch(base+'/auth/verify',{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:httpToken}),redirect:'manual'});
  assert.ok(replay.headers.get('location')?.includes('message=invalid'));
  const admin=await fetch(base+'/admin',{headers:{Cookie:cookie}});assert.equal(admin.status,200);assert.ok((await admin.text()).includes('Your photo collection'));
  const expired=newToken();await db.query("INSERT INTO admin_login_tokens(token_hash,email,expires_at) VALUES($1,$2,now()-interval '1 second')",[hashToken(expired),email]);assert.equal(await redeemAdminLogin(expired),undefined);
  const logout=await fetch(base+'/auth/logout',{method:'POST',headers:{Cookie:cookie,Origin:base},redirect:'manual'});assert.equal(logout.status,303);
  assert.equal((await fetch(base+'/admin',{headers:{Cookie:cookie},redirect:'manual'})).status,307);
 }finally{await db.query('DELETE FROM email_outbox WHERE recipient=$1',[email]);await db.query('DELETE FROM administrators WHERE email=$1',[email]);for(const id of mailIds)await unlink(path.join('.local-data/mail',`${id}.txt`)).catch(()=>{});}
});
test('paid-test fulfillment is idempotent; unpaid/tampered orders cannot download; originals require an expiring entitlement',async()=>{
 const photoId=randomUUID(),orderId=randomUUID(),email=`buyer-${randomUUID()}@example.invalid`,sessionId=`cs_test_${randomUUID()}`;
 const original=await sharp({create:{width:360,height:180,channels:3,background:'navy'}}).png().toBuffer();
 const session={id:sessionId,livemode:false,mode:'payment',payment_status:'paid',metadata:{order_id:orderId},amount_total:1729,currency:'gbp'} as unknown as Stripe.Checkout.Session;
 let mailId:string|undefined;
 try{
  await storePhoto(photoId,original,Buffer.from('synthetic preview'));
  await db.query('INSERT INTO photos(id,title,collection,description,width,height,prices) VALUES($1,$2,$3,$4,360,180,$5)',[photoId,'Disposable purchase regression','Tests','Synthetic fixture',{GBP:{personal:1729,commercial:6500},EUR:{personal:1800,commercial:7800},USD:{personal:2000,commercial:8500}}]);
  await db.query('INSERT INTO orders(id,photo_id,email,photo_title,licence,licence_terms,currency,amount,stripe_session_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[orderId,photoId,email,'Original title snapshot','personal','Original licence snapshot','GBP',1729,sessionId]);
  for(const bad of [{...session,livemode:true},{...session,payment_status:'unpaid'},{...session,amount_total:1},{...session,currency:'usd'},{...session,metadata:{order_id:randomUUID()}}])await assert.rejects(fulfilSession(bad as Stripe.Checkout.Session));
  assert.equal((await db.query('SELECT status FROM orders WHERE id=$1',[orderId])).rows[0].status,'pending');
  assert.equal(await purchaseByToken(newToken()),undefined);assert.equal(await issueDownload(newToken()),undefined);
  await Promise.all([fulfilSession(session),fulfilSession(session)]);
  const messages=await db.query('SELECT id,body FROM email_outbox WHERE recipient=$1',[email]);assert.equal(messages.rowCount,1);mailId=messages.rows[0].id;
  const token=messages.rows[0].body.match(/token=([a-f0-9]{64})/)[1];
  await deliverOutbox();await deliverOutbox();assert.ok((await readFile(path.join('.local-data/mail',`${mailId}.txt`),'utf8')).includes(token));
  await db.query("UPDATE photos SET title='Changed title',prices='{}'::jsonb WHERE id=$1",[photoId]);
  const order=await purchaseByToken(token);assert.equal(order.photo_title,'Original title snapshot');assert.equal(order.amount,1729);assert.equal(order.licence_terms,'Original licence snapshot');
  const download=await issueDownload(token);assert.ok(download);assert.ok(await downloadEntitlement(download));
  const response=await fetch(`${base}/downloads/${download}`);assert.equal(response.status,200,response.status===200?'':await response.clone().text());assert.equal(response.headers.get('cache-control'),'private, no-store');assert.ok(response.headers.get('content-disposition')?.startsWith('attachment;'));assert.deepEqual(Buffer.from(await response.arrayBuffer()),original);
  assert.equal((await fetch(`${base}/downloads/${newToken()}`)).status,404);
  await db.query("UPDATE download_tokens SET expires_at=now()-interval '1 second' WHERE token_hash=$1",[hashToken(download!)]);assert.equal(await downloadEntitlement(download),undefined);assert.equal((await fetch(`${base}/downloads/${download}`)).status,404);
  const again=await issueDownload(token);assert.ok(again);assert.notEqual(again,download);
  await db.query("UPDATE orders SET status='pending' WHERE id=$1",[orderId]);assert.equal(await downloadEntitlement(again),undefined);assert.equal(await purchaseByToken(token),undefined);
  await db.query("UPDATE orders SET status='paid',access_expires_at=now()-interval '1 second' WHERE id=$1",[orderId]);assert.equal(await issueDownload(token),undefined);
 }finally{await db.query('DELETE FROM email_outbox WHERE recipient=$1',[email]);await db.query('DELETE FROM download_tokens WHERE order_id=$1',[orderId]);await db.query('DELETE FROM orders WHERE id=$1',[orderId]);await db.query('DELETE FROM photos WHERE id=$1',[photoId]);await removePhoto(photoId);if(mailId)await unlink(path.join('.local-data/mail',`${mailId}.txt`)).catch(()=>{});}
});
