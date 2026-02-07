import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    // Verify session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    return NextResponse.json({
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: decodedClaims.role,
        team: decodedClaims.team,
      },
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ user: null });
  }
}
