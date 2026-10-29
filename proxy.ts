import { NextResponse, type NextRequest } from 'next/server';
export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  if (process.env.NODE_ENV !== 'development' || process.env.LOCAL_CATALOG !== '1' || !/^(localhost|127\.0\.0\.1):\d+$/.test(host)) {
    return new NextResponse('Local test functionality is unavailable.', { status: 404 });
  }
  const response = NextResponse.next();
  response.headers.set('Cache-Control','private, no-store');
  response.headers.set('Referrer-Policy','strict-origin');
  response.headers.set('X-Robots-Tag','noindex, nofollow');
  return response;
}
export const config = { matcher: ['/admin/:path*','/auth/:path*','/purchases/:path*','/downloads/:path*','/api/checkout','/api/stripe/webhook'] };
