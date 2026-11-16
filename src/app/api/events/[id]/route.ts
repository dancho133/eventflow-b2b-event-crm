import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        registrations: {
          include: {
            contact: {
              include: {
                company: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        opportunities: {
          include: {
            company: true,
            contact: true,
          },
        },
        tasks: {
          include: {
            assignedTo: true,
            contact: true,
          },
        },
        activities: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    let tags: string[] = [];
    try {
      tags = JSON.parse(event.tags);
    } catch {
      tags = [];
    }

    const pipelineGenerated = event.opportunities.reduce(
      (sum, opp) => sum + (opp.value || 0),
      0
    );
    const revenueAttributed = event.opportunities
      .filter((opp) => opp.stage === 'Won')
      .reduce((sum, opp) => sum + (opp.value || 0), 0);

    const capacityUtilization =
      event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0;
    const attendanceRate =
      event.registeredCount > 0 ? Math.round((event.attendedCount / event.registeredCount) * 100) : 0;

    const stats = {
      capacityUtilization,
      attendanceRate,
      pipelineGenerated,
      revenueAttributed,
      leadsGenerated: event.registrations.length,
    };

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        tags,
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching event detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.event.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.eventType !== undefined) updateData.eventType = body.eventType;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.venueAddress !== undefined) updateData.venueAddress = body.venueAddress;
    if (body.virtualUrl !== undefined) updateData.virtualUrl = body.virtualUrl;
    if (body.capacity !== undefined) updateData.capacity = Number(body.capacity);
    if (body.bannerUrl !== undefined) updateData.bannerUrl = body.bannerUrl;
    if (body.tags !== undefined) {
      updateData.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
    }
    if (body.targetAudience !== undefined) updateData.targetAudience = body.targetAudience;
    if (body.createdById !== undefined) updateData.createdById = body.createdById;
    if (body.budget !== undefined) updateData.budget = Number(body.budget);
    if (body.expectedRevenue !== undefined) updateData.expectedRevenue = Number(body.expectedRevenue);

    const updated = await prisma.event.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const existing = await prisma.event.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    await prisma.event.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
