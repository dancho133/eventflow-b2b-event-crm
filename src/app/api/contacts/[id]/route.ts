import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        registrations: {
          include: {
            event: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        opportunities: {
          include: {
            event: true,
            company: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          include: {
            assignedTo: true,
            event: true,
          },
          orderBy: { dueDate: 'asc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        aiInteractions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      );
    }

    let tags: string[] = [];
    try {
      tags = JSON.parse(contact.tags);
    } catch {
      tags = [];
    }

    // Calculate aggregated contact intelligence
    const totalEventsAttended = contact.registrations.filter(
      (r) => r.status === 'Attended'
    ).length;
    const totalPipelineValue = contact.opportunities.reduce(
      (sum, opp) => sum + (opp.value || 0),
      0
    );
    const wonRevenue = contact.opportunities
      .filter((opp) => opp.stage === 'Won')
      .reduce((sum, opp) => sum + (opp.value || 0), 0);

    return NextResponse.json({
      success: true,
      contact: {
        ...contact,
        tags,
        metrics: {
          totalRegistrations: contact.registrations.length,
          totalEventsAttended,
          totalPipelineValue,
          wonRevenue,
          openTasksCount: contact.tasks.filter((t) => t.status !== 'Completed').length,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching contact profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.contact.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email.toLowerCase();
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.companyId !== undefined) updateData.companyId = body.companyId;
    if (body.leadScore !== undefined) updateData.leadScore = Number(body.leadScore);
    if (body.leadStatus !== undefined) updateData.leadStatus = body.leadStatus;
    if (body.tags !== undefined) {
      updateData.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
    }
    if (body.city !== undefined) updateData.city = body.city;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.linkedinUrl !== undefined) updateData.linkedinUrl = body.linkedinUrl;

    const updated = await prisma.contact.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
      },
    });

    // Log activity if lead status or score changed significantly
    if (body.leadStatus && body.leadStatus !== existing.leadStatus) {
      await prisma.activity.create({
        data: {
          type: 'STATUS_CHANGED',
          title: 'Lead Status Updated',
          description: `Lead status updated to ${body.leadStatus} for ${updated.firstName} ${updated.lastName}.`,
          contactId: id,
          workspaceId: existing.workspaceId,
        },
      });
    }

    return NextResponse.json({ success: true, contact: updated });
  } catch (error: any) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
