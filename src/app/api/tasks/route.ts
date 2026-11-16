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
    const contactId = searchParams.get('contactId');
    const eventId = searchParams.get('eventId');
    const assignedToId = searchParams.get('assignedToId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const overdue = searchParams.get('overdue');

    const where: any = {};

    if (contactId) where.contactId = contactId;
    if (eventId) where.eventId = eventId;
    if (assignedToId) where.assignedToId = assignedToId;
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;

    if (overdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'Completed' };
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      include: {
        contact: true,
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
    const inProgressCount = tasks.filter((t) => t.status === 'In_Progress').length;
    const completedCount = tasks.filter((t) => t.status === 'Completed').length;
    const overdueCount = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    ).length;

    return NextResponse.json({
      success: true,
      tasks,
      stats: {
        total: tasks.length,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        overdue: overdueCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      dueDate,
      priority = 'Medium',
      status = 'Pending',
      contactId,
      eventId,
      assignedToId,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Task title is required.' },
        { status: 400 }
      );
    }

    const workspaceId = await getDefaultWorkspaceId();

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        status,
        contactId,
        eventId,
        assignedToId,
        workspaceId,
      },
      include: {
        contact: true,
        event: true,
        assignedTo: true,
      },
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, dueDate, priority, status, assignedToId } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required.' },
        { status: 400 }
      );
    }

    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Task not found.' },
        { status: 404 }
      );
    }

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
