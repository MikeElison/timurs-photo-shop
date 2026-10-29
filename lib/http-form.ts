// Bound even chunked requests before parsing login, checkout, and token forms.
export async function smallForm(request: Request): Promise<FormData> {
  if(!request.body) throw new Error('Missing form.');
  const reader=request.body.getReader();const parts:Uint8Array[]=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();throw new Error('Form too large.');}parts.push(value);}
  return new Request(request.url,{method:'POST',headers:{'content-type':request.headers.get('content-type')??''},body:Buffer.concat(parts)}).formData();
}
