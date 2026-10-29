import { smallForm } from '../../../lib/http-form';
import { cookies } from 'next/headers';
import { redeemAdminLogin } from '../../../lib/auth';
import { appOrigin, isLocalRuntime, localHeaders } from '../../../lib/security';
export async function POST(request: Request) {
  if (!isLocalRuntime() || !localHeaders(request.headers,true)) return new Response(null,{status:403});
  if (Number(request.headers.get('content-length') ?? 0) > 4096) return new Response(null,{status:413});
  const form = await smallForm(request);
  const token = await redeemAdminLogin(form.get('token'));
  if (!token) return Response.redirect(`${appOrigin()}/admin/sign-in?message=invalid`,303);
  (await cookies()).set('timurs_admin',token,{ httpOnly:true, sameSite:'strict', secure:false, path:'/', maxAge:8*3600 });
  return Response.redirect(`${appOrigin()}/admin`,303);
}
