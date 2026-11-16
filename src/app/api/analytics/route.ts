import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    // 1. Basic counts
    const [
      totalEvents,
      activeEvents,
      totalRegistrations,
      totalAttendees,
      opportunities,
      totalLeads,
      qualifiedLeads,
      activeTasks,
      allEvents,
      registrations,
      companies,
      contacts,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: { in: ['Published', 'Draft'] } } }),
      prisma.registration.count({ where: { status: { not: 'Cancelled' } } }),
      prisma.registration.count({ where: { status: 'Attended' } }),
      prisma.opportunity.findMany({
        where: eventId ? { eventId } : undefined,
        include: { event: true, company: true },
      }),
      prisma.contact.count(),
      prisma.contact.count({ where: { leadStatus: { in: ['Qualified', 'Customer'] } } }),
      prisma.task.count({ where: { status: { in: ['Pending', 'In_Progress'] } } }),
      prisma.event.findMany({
        orderBy: { startDate: 'desc' },
        include: {
          registrations: true,
          opportunities: true,
        },
      }),
      prisma.registration.findMany({
        where: eventId ? { eventId } : undefined,
        orderBy: { createdAt: 'asc' },
        include: { event: true },
      }),
      prisma.company.findMany({
        include: {
          opportunities: true,
          contacts: true,
        },
      }),
      prisma.contact.findMany({
        select: { leadStatus: true },
      }),
    ]);

    // Financial KPIs
    const totalPipelineValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    const totalWonRevenue = opportunities
      .filter((opp) => opp.stage === 'Won')
      .reduce((sum, opp) => sum + (opp.value || 0), 0);
    const overallAttendanceRate =
      totalRegistrations > 0 ? Math.round((totalAttendees / totalRegistrations) * 100) : 0;

    const kpis = {
      totalEvents,
      activeEvents,
      totalRegistrations,
      totalAttendees,
      overallAttendanceRate,
      totalPipelineValue,
      totalWonRevenue,
      totalLeads,
      qualifiedLeads,
      activeTasks,
    };

    // 2. Registration Trends (aggregated by date)
    const trendMap = new Map<string, { date: string; registrations: number; attendees: number }>();
    registrations.forEach((reg) => {
      const dateStr = new Date(reg.createdAt).toISOString().split('T')[0];
      const existing = trendMap.get(dateStr) || { date: dateStr, registrations: 0, attendees: 0 };
      existing.registrations += 1;
      if (reg.status === 'Attended') {
        existing.attendees += 1;
      }
      trendMap.set(dateStr, existing);
    });

    const registrationTrends = Array.from(trendMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 3. Event Performance Comparisons
    const eventComparisons = allEvents.map((ev) => {
      const regCount = ev.registrations.filter((r) => r.status !== 'Cancelled').length;
      const attCount = ev.registrations.filter((r) => r.status === 'Attended').length;
      const attRate = regCount > 0 ? Math.round((attCount / regCount) * 100) : 0;
      const pipeline = ev.opportunities.reduce((s, o) => s + (o.value || 0), 0);
      const won = ev.opportunities.filter((o) => o.stage === 'Won').reduce((s, o) => s + (o.value || 0), 0);

      return {
        id: ev.id,
        title: ev.title,
        eventType: ev.eventType,
        startDate: ev.startDate.toISOString(),
        status: ev.status,
        capacity: ev.capacity,
        registered: regCount,
        attended: attCount,
        attendanceRate: attRate,
        pipeline,
        revenue: won,
      };
    });

    // 4. UTM Source Breakdown
    const sourceCountMap = new Map<string, { count: number; attended: number }>();
    registrations.forEach((r) => {
      const src = r.utmSource || 'Direct';
      const cur = sourceCountMap.get(src) || { count: 0, attended: 0 };
      cur.count += 1;
      if (r.status === 'Attended') cur.attended += 1;
      sourceCountMap.set(src, cur);
    });

    const sourceBreakdown = Array.from(sourceCountMap.entries()).map(([source, data]) => {
      const percentage = totalRegistrations > 0 ? Math.round((data.count / totalRegistrations) * 100) : 0;
      const conversionRate = data.count > 0 ? Math.round((data.attended / data.count) * 100) : 0;
      return {
        source,
        count: data.count,
        percentage,
        conversionRate,
      };
    });

    // 5. Conversion Funnel
    const estimatedImpressions = Math.round(totalRegistrations * 3.8);
    const confirmedCount = registrations.filter((r) => r.status === 'Confirmed' || r.status === 'Attended').length;
    const wonCount = opportunities.filter((o) => o.stage === 'Won').length;

    const funnel = [
      { stage: 'Campaign Reach', count: estimatedImpressions, percentage: 100 },
      {
        stage: 'Registrations',
        count: totalRegistrations,
        percentage: Math.round((totalRegistrations / estimatedImpressions) * 100),
      },
      {
        stage: 'Confirmed',
        count: confirmedCount,
        percentage: Math.round((confirmedCount / totalRegistrations) * 100),
      },
      {
        stage: 'Attended',
        count: totalAttendees,
        percentage: Math.round((totalAttendees / (confirmedCount || 1)) * 100),
      },
      {
        stage: 'Qualified Leads',
        count: qualifiedLeads,
        percentage: Math.round((qualifiedLeads / (totalAttendees || 1)) * 100),
      },
      {
        stage: 'Opportunities Won',
        count: wonCount,
        percentage: Math.round((wonCount / (opportunities.length || 1)) * 100),
      },
    ];

    // 6. Lead Status Distribution
    const statusMap = new Map<string, number>();
    contacts.forEach((c) => {
      statusMap.set(c.leadStatus, (statusMap.get(c.leadStatus) || 0) + 1);
    });
    const leadStatusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    }));

    // 7. Industry Breakdown
    const industryMap = new Map<string, { companyCount: number; contactCount: number; pipelineValue: number }>();
    companies.forEach((comp) => {
      const ind = comp.industry || 'Technology';
      const cur = industryMap.get(ind) || { companyCount: 0, contactCount: 0, pipelineValue: 0 };
      cur.companyCount += 1;
      cur.contactCount += comp.contacts.length;
      cur.pipelineValue += comp.opportunities.reduce((s, o) => s + (o.value || 0), 0);
      industryMap.set(ind, cur);
    });

    const industryBreakdown = Array.from(industryMap.entries()).map(([industry, data]) => ({
      industry,
      ...data,
    }));

    // 8. Follow-up Status
    const tasks = await prisma.task.findMany();
    const followUpStatus = {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === 'Pending').length,
      inProgressTasks: tasks.filter((t) => t.status === 'In_Progress').length,
      completedTasks: tasks.filter((t) => t.status === 'Completed').length,
      overdueTasks: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
      completionRate: tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === 'Completed').length / tasks.length) * 100) : 0,
    };

    return NextResponse.json({
      success: true,
      analytics: {
        kpis,
        registrationTrends,
        eventComparisons,
        sourceBreakdown,
        funnel,
        leadStatusDistribution,
        industryBreakdown,
        followUpStatus,
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
