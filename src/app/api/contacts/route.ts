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
    const search = searchParams.get('search') || '';
    const companyId = searchParams.get('companyId');
    const leadStatus = searchParams.get('leadStatus');
    const minScore = searchParams.get('minScore');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { title: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (leadStatus && leadStatus !== 'all') {
      where.leadStatus = leadStatus;
    }

    if (minScore) {
      where.leadScore = { gte: parseInt(minScore, 10) };
    }

    const [total, contacts] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { leadScore: 'desc' },
        include: {
          company: true,
          _count: {
            select: {
              registrations: true,
              opportunities: true,
              tasks: true,
            },
          },
        },
      }),
    ]);

    const formatted = contacts.map((c) => {
      let tags: string[] = [];
      try {
        tags = JSON.parse(c.tags);
      } catch {
        tags = [];
      }
      return {
        ...c,
        tags,
        stats: {
          registrationsCount: c._count.registrations,
          opportunitiesCount: c._count.opportunities,
          tasksCount: c._count.tasks,
        },
      };
    });

    return NextResponse.json({
      success: true,
      contacts: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      companyId,
      companyName,
      leadScore = 50,
      leadStatus = 'New',
      tags = [],
      city,
      country = 'United States',
      bio,
      linkedinUrl,
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, and email are required.' },
        { status: 400 }
      );
    }

    const workspaceId = await getDefaultWorkspaceId();

    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && companyName) {
      let company = await prisma.company.findFirst({
        where: { workspaceId, name: companyName },
      });
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: companyName,
            workspaceId,
          },
        });
      }
      resolvedCompanyId = company.id;
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        title,
        companyId: resolvedCompanyId,
        leadScore: Number(leadScore),
        leadStatus,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        city,
        country,
        bio,
        linkedinUrl,
        workspaceId,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
