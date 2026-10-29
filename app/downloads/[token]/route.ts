import { createReadStream } from 'node:fs';
import { open } from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import { downloadEntitlement } from '../../../lib/orders';
import { isLocalRuntime } from '../../../lib/security';
import { isPhotoId } from '../../../lib/catalog-validation';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}){
  if(!isLocalRuntime())return new Response(null,{status:404});
  const order=await downloadEntitlement((await params).token);
  if(!order || !isPhotoId(order.photo_id))return new Response(null,{status:404});
  const file=path.join(process.cwd(),'.local-data','photos',order.photo_id,'original');
  try{
    const handle=await open(file,'r');let size;let png;
    try{size=(await handle.stat()).size;const prefix=Buffer.alloc(8);await handle.read(prefix,0,8,0);png=prefix.equals(Buffer.from([137,80,78,71,13,10,26,10]));}finally{await handle.close();}
    const stream=Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>;
    return new Response(stream,{headers:{'Content-Type':png?'image/png':'image/jpeg','Content-Length':String(size),'Content-Disposition':`attachment; filename="timurs-${order.id}.${png?'png':'jpg'}"`,'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
  }catch{return new Response('Original unavailable. Contact the seller.',{status:404});}
}
