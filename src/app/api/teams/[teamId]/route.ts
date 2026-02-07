import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth, db } from '@/lib/firebase/admin';

// PATCH - Update team details (Master only)
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

    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== 'master') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { teamId } = await params;
    const body = await request.json();
    const { name, serial, serialQuantity, eventQuota } = body;

    const updateData: {
      name?: string;
      serial?: string;
      serialQuantity?: number;
      eventQuota?: number;
    } = {};
    if (name) updateData.name = name;
    if (serial !== undefined) updateData.serial = serial;
    if (serialQuantity !== undefined) updateData.serialQuantity = Number(serialQuantity);
    if (eventQuota !== undefined) updateData.eventQuota = Number(eventQuota);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await db.collection('teams').doc(teamId).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

// DELETE - Explicitly Forbidden
export async function DELETE() {
  return NextResponse.json(
    { error: 'Deleting teams is not allowed' },
    { status: 405 }
  );
}
