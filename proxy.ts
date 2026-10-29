import { NextResponse, type NextRequest } from 'next/server';
export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  if (process.env.NODE_ENV !== 'development' || process.env.LOCAL_CATALOG !== '1' || !/^(localhost|127\.0\.0\.1):\d+$/.test(host)) {
    return new NextResponse('Local administration is unavailable.', { status: 404 });
  }
  return NextResponse.next();
}
export const config = { matcher: '/admin/:path*' };
