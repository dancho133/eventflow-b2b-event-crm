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
    const stage = searchParams.get('stage');
    const companyId = searchParams.get('companyId');
    const eventId = searchParams.get('eventId');
    const contactId = searchParams.get('contactId');
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (stage && stage !== 'all') {
      where.stage = stage;
    }
    if (companyId) {
      where.companyId = companyId;
    }
    if (eventId) {
      where.eventId = eventId;
    }
    if (contactId) {
      where.contactId = contactId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { name: { contains: search } } },
        { contact: { firstName: { contains: search } } },
        { contact: { lastName: { contains: search } } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { value: 'desc' },
      include: {
        company: true,
        contact: true,
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
          },
        },
      },
    });

    const totalValue = opportunities.reduce((acc, opp) => acc + (opp.value || 0), 0);
    const wonValue = opportunities
      .filter((opp) => opp.stage === 'Won')
      .reduce((acc, opp) => acc + (opp.value || 0), 0);

    return NextResponse.json({
      success: true,
      opportunities,
      metrics: {
        totalOpportunities: opportunities.length,
        totalPipelineValue: totalValue,
        wonRevenue: wonValue,
      },
    });
  } catch (error: any) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      value = 0,
      stage = 'Discovery',
      probability = 20,
      closeDate,
      companyId,
      contactId,
      eventId,
      notes,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Opportunity title is required.' },
        { status: 400 }
      );
    }

    const workspaceId = await getDefaultWorkspaceId();

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        value: Number(value),
        stage,
        probability: Number(probability),
        closeDate: closeDate ? new Date(closeDate) : null,
        companyId,
        contactId,
        eventId,
        notes,
        workspaceId,
      },
      include: {
        company: true,
        contact: true,
        event: true,
      },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        type: 'OPPORTUNITY_STAGE_CHANGED',
        title: `Opportunity Created: ${title}`,
        description: `Created opportunity valued at $${Number(value).toLocaleString()} in ${stage} stage.`,
        opportunityId: opportunity.id,
        contactId,
        eventId,
        workspaceId,
      },
    });

    return NextResponse.json({ success: true, opportunity }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, stage, value, probability, closeDate, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Opportunity ID is required.' },
        { status: 400 }
      );
    }

    const existing = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found.' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (value !== undefined) updateData.value = Number(value);
    if (stage !== undefined) updateData.stage = stage;
    if (probability !== undefined) updateData.probability = Number(probability);
    if (closeDate !== undefined) updateData.closeDate = closeDate ? new Date(closeDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    // Adjust probability based on stage automatically if stage changed and probability not explicitly provided
    if (stage && stage !== existing.stage && probability === undefined) {
      const stageProbabilities: Record<string, number> = {
        Discovery: 20,
        Qualified: 40,
        Proposal: 65,
        Negotiation: 85,
        Won: 100,
        Lost: 0,
      };
      if (stageProbabilities[stage] !== undefined) {
        updateData.probability = stageProbabilities[stage];
      }
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        contact: true,
        event: true,
      },
    });

    // Log activity if stage changed
    if (stage && stage !== existing.stage) {
      await prisma.activity.create({
        data: {
          type: 'OPPORTUNITY_STAGE_CHANGED',
          title: `Deal Stage: ${stage}`,
          description: `Opportunity "${updated.title}" progressed from ${existing.stage} to ${stage} ($${updated.value.toLocaleString()}).`,
          opportunityId: id,
          contactId: updated.contactId,
          eventId: updated.eventId,
          workspaceId: existing.workspaceId,
        },
      });
    }

    return NextResponse.json({ success: true, opportunity: updated });
  } catch (error: any) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
