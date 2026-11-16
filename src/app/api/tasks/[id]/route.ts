import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const { title, description, dueDate, priority, status, assignedToId } = body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
        event: true,
        assignedTo: true,
      },
    });

    if (status === 'Completed' && existing.status !== 'Completed') {
      await prisma.activity.create({
        data: {
          type: 'TASK_COMPLETED',
          title: `Task Completed: ${updated.title}`,
          description: `Task was marked as completed.`,
          contactId: updated.contactId,
          eventId: updated.eventId,
          workspaceId: existing.workspaceId,
        },
      });
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.task.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
