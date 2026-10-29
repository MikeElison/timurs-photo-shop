import { smallForm } from '../../../lib/http-form';
import { issueDownload } from '../../../lib/orders';
import { appOrigin,isLocalRuntime,localHeaders } from '../../../lib/security';
export async function POST(request:Request){
  if(!isLocalRuntime()||!localHeaders(request.headers,true))return new Response(null,{status:403});
  if(Number(request.headers.get('content-length')??0)>4096)return new Response(null,{status:413});
  const token=await issueDownload((await smallForm(request)).get('token'));
  if(!token)return new Response('Purchase access is invalid or expired.',{status:404});
  return Response.redirect(`${appOrigin()}/downloads/${token}`,303);
}
