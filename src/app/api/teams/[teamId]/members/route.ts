import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session and get current user claims
    const currentUser = await auth.verifySessionCookie(sessionCookie, true);
    const currentUserTeam = currentUser.team;
    const currentUserRole = currentUser.role;
    
    const { teamId } = await params;

    // Only allow access to own team, unless master
    if (currentUserRole !== 'master' && currentUserTeam !== teamId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // List all users and filter by team claim
    const listResult = await auth.listUsers(1000);
    const teamMembers = listResult.users
      .filter((user) => user.customClaims?.team === teamId)
      .map((user) => ({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role: user.customClaims?.role || 'member',
        disabled: user.disabled,
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime,
      }));

    return NextResponse.json({ members: teamMembers });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
