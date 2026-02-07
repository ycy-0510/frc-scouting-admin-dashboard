import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth, db, admin } from '@/lib/firebase/admin';

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

    // Only allow access to own team's matches, unless master
    if (currentUserRole !== 'master' && currentUserTeam !== teamId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get team match document
    const matchDocRef = db.collection('matches').doc(teamId);
    const matchDoc = await matchDocRef.get();
    
    if (!matchDoc.exists) {
      return NextResponse.json({ events: [], currentEvent: null });
    }

    const matchData = matchDoc.data() || {};
    const currentEvent = matchData.event || null;
    
    // Build events list - only 2026 events
    const events: { name: string; code: string; isCurrent: boolean }[] = [];
    
    for (const [key, value] of Object.entries(matchData)) {
      if (key === 'event') continue;
      
      // Only include 2026 events
      if (key.startsWith('2026')) {
        events.push({
          name: key,
          code: value as string,
          isCurrent: currentEvent === key,
        });
      }
    }

    // Sort events by name
    events.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      currentEvent,
      events,
    });
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Add new event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await auth.verifySessionCookie(sessionCookie, true);
    const { teamId } = await params;

    // Only allow admin (own team) or master
    const isMaster = currentUser.role === 'master';
    const isTeamAdmin = currentUser.team === teamId && currentUser.role === 'admin';

    if (!isMaster && !isTeamAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { eventName, tbaCode } = body;

    if (!eventName) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    // Get team document to check eventQuota
    const teamDoc = await db.collection('teams').doc(teamId).get();
    const teamData = teamDoc.data() || {};
    const eventQuota = teamData.eventQuota ?? 1; // Default quota is 1

    // Get current matches document to check event count
    const matchDocRef = db.collection('matches').doc(teamId);
    const matchDoc = await matchDocRef.get();
    const matchData = matchDoc.data() || {};

    // Count 2026 events
    const current2026Events = Object.keys(matchData).filter(
      key => key !== 'event' && key.startsWith('2026')
    );

    // Master can override quota check? Let's say master is bound by quota too, 
    // BUT since master can edit quota, they can increase it first. 
    // Plan said: "Allow master to add events even if quota is full (or just allow editing quota)."
    // Let's stick to strict quota check, relying on master's ability to edit quota.
    // Check event quota (unless master)
    if (!isMaster && current2026Events.length >= eventQuota) {
      return NextResponse.json(
        { error: `Event quota exceeded. Maximum ${eventQuota} event(s) allowed.` },
        { status: 400 }
      );
    }

    // Check if event already exists
    if (matchData[eventName]) {
      return NextResponse.json(
        { error: 'Event already exists' },
        { status: 400 }
      );
    }

    // Add the new event
    await matchDocRef.set(
      { [eventName]: tbaCode || '' },
      { merge: true }
    );

    return NextResponse.json({ success: true, eventName, tbaCode });
  } catch (error) {
    console.error('Add event error:', error);
    return NextResponse.json(
      { error: 'Failed to add event' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an event (Master only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await auth.verifySessionCookie(sessionCookie, true);
    const { teamId } = await params;

    const isMaster = currentUser.role === 'master';
    const isTeamAdmin = currentUser.team === teamId && currentUser.role === 'admin';
    
    if (!isMaster && !isTeamAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { eventName } = body;

    if (!eventName) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const matchDocRef = db.collection('matches').doc(teamId);
    
    // Remove the field
    await matchDocRef.update({
      [eventName]: admin.firestore.FieldValue.delete()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

// PATCH - Update event TBA code (Master only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await auth.verifySessionCookie(sessionCookie, true);
    const { teamId } = await params;

    const isMaster = currentUser.role === 'master';
    const isTeamAdmin = currentUser.team === teamId && currentUser.role === 'admin';

    if (!isMaster && !isTeamAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { eventName, tbaCode } = body;

    if (!eventName) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const matchDocRef = db.collection('matches').doc(teamId);
    
    // Update the field
    await matchDocRef.update({
      [eventName]: tbaCode || ''
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}
