import { smallForm } from '../../../lib/http-form';
import { requestAdminLogin } from '../../../lib/auth';
import { normalizeEmail, isLocalRuntime, localHeaders, appOrigin } from '../../../lib/security';
import { deliverOutbox } from '../../../lib/outbox';
export async function POST(request: Request) {
  if (!isLocalRuntime() || !localHeaders(request.headers, true)) return new Response(null,{status:403});
  if (Number(request.headers.get('content-length') ?? 0) > 4096) return new Response(null,{status:413});
  try {
    const form = await smallForm(request);
    await requestAdminLogin(normalizeEmail(form.get('email')));
    await deliverOutbox();
  } catch { return Response.redirect(`${appOrigin()}/admin/sign-in?message=unavailable`,303); }
  return Response.redirect(`${appOrigin()}/admin/sign-in?message=sent`,303);
}
