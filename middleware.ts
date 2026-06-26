import { NextRequest, NextResponse } from 'next/server';
import { isSuspiciousRequest, SECURITY_HEADERS } from '@/lib/security';

export function middleware(request: NextRequest): NextResponse {
  if (isSuspiciousRequest(request)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
