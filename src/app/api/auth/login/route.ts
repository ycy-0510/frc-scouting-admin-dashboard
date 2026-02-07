import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const IS_DEBUG = process.env.DEBUG === '1';

async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY not configured');
    return false;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { idToken, turnstileToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    // Verify Turnstile token (skip in debug mode)
    if (!IS_DEBUG) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Captcha verification required' },
          { status: 400 }
        );
      }

      const isTurnstileValid = await verifyTurnstileToken(turnstileToken);
      if (!isTurnstileValid) {
        return NextResponse.json(
          { error: 'Captcha verification failed' },
          { status: 400 }
        );
      }
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Check if user has admin or master role
    const role = decodedToken.role;
    if (role !== 'admin' && role !== 'master') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin or Master access required' },
        { status: 403 }
      );
    }

    // Create session cookie (expires in 5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role,
        team: decodedToken.team,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
