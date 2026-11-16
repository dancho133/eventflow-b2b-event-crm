import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Helper to get or create default workspace
async function getDefaultWorkspaceId() {
  const ws = await prisma.workspace.findFirst();
  if (ws) return ws.id;
  const created = await prisma.workspace.create({
    data: { name: 'EventFlow HQ', slug: 'eventflow-hq' },
  });
  return created.id;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'startDate';
    const order = searchParams.get('order') || 'asc';

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.eventType = type;
    }

    const orderBy: any = {};
    if (sortBy === 'registeredCount') {
      orderBy.registeredCount = order === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'capacity') {
      orderBy.capacity = order === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'title') {
      orderBy.title = order === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.startDate = order === 'asc' ? 'asc' : 'desc';
    }

    const events = await prisma.event.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            registrations: true,
            opportunities: true,
            tasks: true,
          },
        },
      },
    });

    const parsedEvents = events.map((ev) => {
      let tags: string[] = [];
      try {
        tags = JSON.parse(ev.tags);
      } catch {
        tags = [];
      }

      const capacityUtilization = ev.capacity > 0 ? Math.round((ev.registeredCount / ev.capacity) * 100) : 0;
      const attendanceRate = ev.registeredCount > 0 ? Math.round((ev.attendedCount / ev.registeredCount) * 100) : 0;

      return {
        ...ev,
        tags,
        stats: {
          capacityUtilization,
          attendanceRate,
          registrationCount: ev._count.registrations,
          opportunityCount: ev._count.opportunities,
          taskCount: ev._count.tasks,
        },
      };
    });

    return NextResponse.json({ success: true, events: parsedEvents });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug: customSlug,
      description,
      shortDescription,
      eventType = 'Conference',
      status = 'Draft',
      startDate,
      endDate,
      timezone = 'America/New_York',
      location,
      venueAddress,
      virtualUrl,
      capacity = 100,
      bannerUrl,
      tags = [],
      budget = 0,
      expectedRevenue = 0,
    } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Title, start date, and end date are required.' },
        { status: 400 }
      );
    }

    const workspaceId = await getDefaultWorkspaceId();
    const slug =
      customSlug ||
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description: description || title,
        shortDescription,
        eventType,
        status,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        timezone,
        location,
        venueAddress,
        virtualUrl,
        capacity: Number(capacity),
        bannerUrl,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        budget: Number(budget),
        expectedRevenue: Number(expectedRevenue),
        workspaceId,
      },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        type: 'REGISTRATION_CREATED',
        title: 'New Event Created',
        description: `Event "${event.title}" was scheduled for ${new Date(startDate).toLocaleDateString()}.`,
        eventId: event.id,
        workspaceId,
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
