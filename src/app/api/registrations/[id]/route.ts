import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, ticketType, checkInTime, notes } = body;

    const existing = await prisma.registration.findUnique({
      where: { id },
      include: { event: true, contact: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Registration record not found.' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (ticketType) updateData.ticketType = ticketType;
    if (notes !== undefined) updateData.notes = notes;

    let activityType = 'STATUS_CHANGED';
    let activityDesc = `Registration status updated from ${existing.status} to ${status}.`;

    if (status && status !== existing.status) {
      updateData.status = status;

      // Handle check-in
      if (status === 'Attended') {
        updateData.checkInTime = checkInTime ? new Date(checkInTime) : new Date();
        activityType = 'CHECK_IN';
        activityDesc = `${existing.contact.firstName} ${existing.contact.lastName} checked in for ${existing.event.title}.`;
      }

      // Handle event counts
      const eventUpdates: any = {};

      // If transitioning to Attended from non-Attended
      if (status === 'Attended' && existing.status !== 'Attended') {
        eventUpdates.attendedCount = { increment: 1 };
      }
      // If transitioning from Attended to non-Attended
      if (existing.status === 'Attended' && status !== 'Attended') {
        eventUpdates.attendedCount = { decrement: 1 };
      }

      // If transitioning to Cancelled from non-Cancelled
      if (status === 'Cancelled' && existing.status !== 'Cancelled') {
        eventUpdates.registeredCount = { decrement: 1 };
      }
      // If transitioning from Cancelled to active
      if (existing.status === 'Cancelled' && status !== 'Cancelled') {
        eventUpdates.registeredCount = { increment: 1 };
      }

      if (Object.keys(eventUpdates).length > 0) {
        await prisma.event.update({
          where: { id: existing.eventId },
          data: eventUpdates,
        });
      }
    } else if (checkInTime) {
      updateData.checkInTime = new Date(checkInTime);
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: updateData,
      include: {
        event: true,
        contact: {
          include: {
            company: true,
          },
        },
      },
    });

    // Log activity
    if (status && status !== existing.status) {
      await prisma.activity.create({
        data: {
          type: activityType,
          title: `Status: ${status}`,
          description: activityDesc,
          contactId: existing.contactId,
          eventId: existing.eventId,
          workspaceId: existing.event.workspaceId,
        },
      });
    }

    return NextResponse.json({ success: true, registration: updated });
  } catch (error: any) {
    console.error('Error updating registration:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await prisma.registration.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Registration record not found.' },
        { status: 404 }
      );
    }

    // Decrement event counts if needed
    if (existing.status !== 'Cancelled') {
      const eventUpdates: any = { registeredCount: { decrement: 1 } };
      if (existing.status === 'Attended') {
        eventUpdates.attendedCount = { decrement: 1 };
      }
      await prisma.event.update({
        where: { id: existing.eventId },
        data: eventUpdates,
      });
    }

    await prisma.registration.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting registration:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
