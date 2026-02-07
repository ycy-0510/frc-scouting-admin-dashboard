import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/admin';

// DELETE - Delete a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; uid: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await auth.verifySessionCookie(sessionCookie, true);
    const { teamId, uid } = await params;

    // Check team access
    if (currentUser.team !== teamId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cannot delete self
    if (currentUser.uid === uid) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    // Verify target user belongs to same team
    const targetUser = await auth.getUser(uid);
    if (targetUser.customClaims?.team !== teamId) {
      return NextResponse.json({ error: 'User not in team' }, { status: 403 });
    }

    await auth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
  }
}

// PATCH - Update a member (displayName, role, disabled)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; uid: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await auth.verifySessionCookie(sessionCookie, true);
    const { teamId, uid } = await params;
    const body = await request.json();

    // Check team access
    if (currentUser.team !== teamId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify target user belongs to same team
    const targetUser = await auth.getUser(uid);
    if (targetUser.customClaims?.team !== teamId) {
      return NextResponse.json({ error: 'User not in team' }, { status: 403 });
    }

    const updates: {
      displayName?: string;
      disabled?: boolean;
    } = {};

    // Update displayName if provided
    if (body.displayName !== undefined) {
      updates.displayName = body.displayName;
    }

    // Update disabled status if provided (cannot disable self)
    if (body.disabled !== undefined) {
      if (currentUser.uid === uid) {
        return NextResponse.json(
          { error: 'Cannot disable yourself' },
          { status: 400 }
        );
      }
      updates.disabled = body.disabled;
    }

    // Apply auth updates
    if (Object.keys(updates).length > 0) {
      await auth.updateUser(uid, updates);
    }

    // Update role claim if provided (cannot change own role)
    if (body.role !== undefined) {
      if (currentUser.uid === uid) {
        return NextResponse.json(
          { error: 'Cannot change your own role' },
          { status: 400 }
        );
      }
      
      const existingClaims = targetUser.customClaims || {};
      await auth.setCustomUserClaims(uid, {
        ...existingClaims,
        role: body.role,
      });
    }

    // Get updated user
    const updatedUser = await auth.getUser(uid);

    return NextResponse.json({
      success: true,
      member: {
        uid: updatedUser.uid,
        email: updatedUser.email || '',
        displayName: updatedUser.displayName || '',
        role: updatedUser.customClaims?.role || 'member',
        disabled: updatedUser.disabled,
      },
    });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}
