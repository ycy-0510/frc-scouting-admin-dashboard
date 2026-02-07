import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth, db } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session and get claims
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userTeam = decodedClaims.team;

    if (!userTeam) {
      return NextResponse.json({ error: 'No team assigned' }, { status: 403 });
    }

    // Get only the user's team from Firestore
    const teamDoc = await db.collection('teams').doc(userTeam).get();

    if (!teamDoc.exists) {
      return NextResponse.json({ teams: [] });
    }

    const teamData = teamDoc.data();
    const team = {
      id: teamDoc.id,
      name: teamData?.name || '',
      number: teamData?.number || 0,
      serial: teamData?.serial || '',
      serialQuantity: teamData?.serialQuantity || 0,
      eventQuota: teamData?.eventQuota ?? 1, // Default 1
    };

    return NextResponse.json({ teams: [team] });
  } catch (error) {
    console.error('Teams fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
