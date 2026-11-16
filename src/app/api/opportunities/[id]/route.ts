import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
        event: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ success: false, error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, opportunity });
  } catch (error: any) {
    console.error('Error fetching opportunity:', error);
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

    const existing = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Opportunity not found' }, { status: 404 });
    }

    const { stage, value, probability, closeDate, notes } = body;
    const updateData: any = {};
    if (value !== undefined) updateData.value = Number(value);
    if (stage !== undefined) updateData.stage = stage;
    if (probability !== undefined) updateData.probability = Number(probability);
    if (closeDate !== undefined) updateData.closeDate = closeDate ? new Date(closeDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.opportunity.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        contact: true,
        event: true,
      },
    });

    if (stage && stage !== existing.stage) {
      await prisma.activity.create({
        data: {
          type: 'OPPORTUNITY_STAGE_CHANGED',
          title: `Deal Stage: ${stage}`,
          description: `Opportunity "${updated.title}" progressed from ${existing.stage} to ${stage}.`,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.opportunity.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Opportunity deleted' });
  } catch (error: any) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
