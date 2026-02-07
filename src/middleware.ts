import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;

  // Redirect to login if no session
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Session verification is done via API route instead of Edge runtime
  // The actual verification happens in API routes and page Server Components
  return NextResponse.next();
}
