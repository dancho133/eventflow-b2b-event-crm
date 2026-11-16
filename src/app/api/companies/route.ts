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
    const industry = searchParams.get('industry');
    const tier = searchParams.get('tier');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { domain: { contains: search } },
        { headquarters: { contains: search } },
      ];
    }

    if (industry && industry !== 'all') {
      where.industry = industry;
    }

    if (tier && tier !== 'all') {
      where.tier = tier;
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        contacts: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
            leadScore: true,
          },
        },
        opportunities: {
          select: {
            id: true,
            title: true,
            value: true,
            stage: true,
          },
        },
        _count: {
          select: {
            contacts: true,
            opportunities: true,
          },
        },
      },
    });

    const enriched = companies.map((c) => {
      const pipelineValue = c.opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
      const wonValue = c.opportunities
        .filter((opp) => opp.stage === 'Won')
        .reduce((sum, opp) => sum + (opp.value || 0), 0);

      return {
        ...c,
        metrics: {
          contactCount: c._count.contacts,
          opportunityCount: c._count.opportunities,
          pipelineValue,
          wonValue,
        },
      };
    });

    return NextResponse.json({ success: true, companies: enriched });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      domain,
      industry = 'Technology',
      size = '51-200',
      tier = 'Mid-Market',
      logoUrl,
      website,
      headquarters,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Company name is required.' },
        { status: 400 }
      );
    }

    const workspaceId = await getDefaultWorkspaceId();

    const company = await prisma.company.create({
      data: {
        name,
        domain,
        industry,
        size,
        tier,
        logoUrl,
        website,
        headquarters,
        workspaceId,
      },
    });

    return NextResponse.json({ success: true, company }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
