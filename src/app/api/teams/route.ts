import { NextRequest, NextResponse } from 'next/server';
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
    const userRole = decodedClaims.role;

    if (userRole === 'master') {
      // Master can see all teams
      const teamsSnapshot = await db.collection('teams').get();
      const teams = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json({ teams });
    }

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

// POST - Create new team (Master only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== 'master') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, number, serial, serialQuantity, eventQuota } = body;

    if (!name || !number) {
      return NextResponse.json({ error: 'Name and number are required' }, { status: 400 });
    }

    const teamData = {
      name,
      number: Number(number),
      serial: serial || '',
      serialQuantity: Number(serialQuantity) || 0,
      eventQuota: Number(eventQuota) || 1,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('teams').add(teamData);

    return NextResponse.json({ 
      success: true, 
      team: { id: docRef.id, ...teamData } 
    });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
