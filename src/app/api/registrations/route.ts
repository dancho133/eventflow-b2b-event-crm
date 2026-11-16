import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const ticketType = searchParams.get('ticketType');
    const utmSource = searchParams.get('utmSource');
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (ticketType && ticketType !== 'all') {
      where.ticketType = ticketType;
    }

    if (utmSource && utmSource !== 'all') {
      where.utmSource = utmSource;
    }

    if (search) {
      where.OR = [
        { contact: { firstName: { contains: search } } },
        { contact: { lastName: { contains: search } } },
        { contact: { email: { contains: search } } },
        { contact: { company: { name: { contains: search } } } },
      ];
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            eventType: true,
            location: true,
          },
        },
        contact: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, registrations });
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      firstName,
      lastName,
      email,
      phone,
      title,
      companyName,
      industry = 'Technology',
      ticketType = 'General',
      utmSource = 'Direct',
      utmMedium,
      utmCampaign,
      notes,
      customAnswers = {},
    } = body;

    // 1. Validation
    if (!eventId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: 'Event ID, first name, last name, and email are required.' },
        { status: 400 }
      );
    }

    // 2. Event existence and capacity check
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Target event does not exist.' },
        { status: 404 }
      );
    }

    if (event.status === 'Cancelled') {
      return NextResponse.json(
        { success: false, error: 'This event has been cancelled and is no longer accepting registrations.' },
        { status: 400 }
      );
    }

    // Capacity check (VIP and Speaker tickets can bypass strict cap)
    if (
      event.capacity > 0 &&
      event.registeredCount >= event.capacity &&
      ticketType !== 'VIP' &&
      ticketType !== 'Speaker'
    ) {
      return NextResponse.json(
        { success: false, error: 'Event has reached maximum attendee capacity. Waitlist only.' },
        { status: 409 }
      );
    }

    const workspaceId = event.workspaceId || (await getDefaultWorkspaceId());

    // 3. Contact & Company auto-association
    let companyId: string | null = null;
    const emailDomain = email.split('@')[1];

    if (companyName) {
      // Find or create company by name
      let company = await prisma.company.findFirst({
        where: {
          workspaceId,
          name: { equals: companyName },
        },
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: companyName,
            domain: emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain) ? emailDomain : null,
            industry,
            tier: 'Mid-Market',
            workspaceId,
          },
        });
      }
      companyId = company.id;
    } else if (emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain)) {
      // Try to find company by domain
      const company = await prisma.company.findFirst({
        where: {
          workspaceId,
          domain: emailDomain,
        },
      });
      if (company) {
        companyId = company.id;
      }
    }

    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: {
        workspaceId,
        email: email.toLowerCase(),
      },
    });

    if (!contact) {
      // Calculate initial lead score based on title & company
      let initialLeadScore = 55;
      const lowerTitle = (title || '').toLowerCase();
      if (
        lowerTitle.includes('c-') ||
        lowerTitle.includes('chief') ||
        lowerTitle.includes('vp') ||
        lowerTitle.includes('director') ||
        lowerTitle.includes('founder')
      ) {
        initialLeadScore = 85;
      } else if (lowerTitle.includes('manager') || lowerTitle.includes('lead') || lowerTitle.includes('head')) {
        initialLeadScore = 70;
      }

      contact = await prisma.contact.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          title,
          companyId,
          leadScore: initialLeadScore,
          leadStatus: 'Qualified',
          tags: JSON.stringify(['Inbound Lead', utmSource]),
          workspaceId,
        },
      });
    } else {
      // Update missing fields if available
      const updateData: any = {};
      if (!contact.phone && phone) updateData.phone = phone;
      if (!contact.title && title) updateData.title = title;
      if (!contact.companyId && companyId) updateData.companyId = companyId;
      if (Object.keys(updateData).length > 0) {
        contact = await prisma.contact.update({
          where: { id: contact.id },
          data: updateData,
        });
      }
    }

    // 4. Duplicate Check
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_contactId: {
          eventId: event.id,
          contactId: contact.id,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact is already registered for this event.',
          registration: existingRegistration,
        },
        { status: 409 }
      );
    }

    // 5. Create Registration
    const registration = await prisma.registration.create({
      data: {
        eventId: event.id,
        contactId: contact.id,
        ticketType,
        status: 'Registered',
        utmSource,
        utmMedium,
        utmCampaign,
        notes,
        customAnswers: typeof customAnswers === 'string' ? customAnswers : JSON.stringify(customAnswers),
      },
      include: {
        event: true,
        contact: {
          include: {
            company: true,
          },
        },
      },
    });

    // 6. Increment Event Registered Count
    await prisma.event.update({
      where: { id: event.id },
      data: {
        registeredCount: { increment: 1 },
      },
    });

    // 7. Activity Logging
    await prisma.activity.create({
      data: {
        type: 'REGISTRATION_CREATED',
        title: `Registration: ${firstName} ${lastName}`,
        description: `Registered for "${event.title}" as ${ticketType} attendee via ${utmSource}.`,
        contactId: contact.id,
        eventId: event.id,
        workspaceId,
      },
    });

    return NextResponse.json({ success: true, registration }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating registration:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
