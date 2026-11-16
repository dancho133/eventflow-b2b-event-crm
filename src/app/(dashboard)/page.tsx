"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Briefcase,
  Target,
  Sparkles,
  ArrowUpRight,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/Badge";
import { formatCurrency, formatPercent, formatDate, formatDateTime } from "@/lib/utils";
import { AnalyticsMetrics, Activity } from "@/types";

const COLORS = ["#3987F5", "#35B982", "#E8B45E", "#8B5CF6", "#EC4899", "#E36C75"];

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsMetrics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.recentActivities) {
          setActivities(json.recentActivities);
        }
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {
    totalEvents: 6,
    activeEvents: 3,
    totalRegistrations: 142,
    totalAttendees: 98,
    overallAttendanceRate: 69,
    totalPipelineValue: 485000,
    totalWonRevenue: 185000,
    qualifiedLeads: 42,
    totalLeads: 88,
    activeTasks: 12,
  };

  const registrationTrends = data?.registrationTrends || [
    { date: "Oct 1", registrations: 12, attendees: 8 },
    { date: "Oct 8", registrations: 24, attendees: 16 },
    { date: "Oct 15", registrations: 38, attendees: 25 },
    { date: "Oct 22", registrations: 62, attendees: 44 },
    { date: "Oct 29", registrations: 89, attendees: 61 },
    { date: "Nov 5", registrations: 115, attendees: 79 },
    { date: "Nov 12", registrations: 142, attendees: 98 },
  ];

  const eventComparisons = data?.eventComparisons || [
    { id: "1", title: "Business Innovation Forum 2026", registered: 45, attended: 36, attendanceRate: 80 },
    { id: "2", title: "Global AI Summit", registered: 38, attended: 28, attendanceRate: 74 },
    { id: "3", title: "Enterprise Cloud Expo", registered: 30, attended: 19, attendanceRate: 63 },
    { id: "4", title: "B2B SaaS Growth Workshop", registered: 20, attended: 15, attendanceRate: 75 },
  ];

  const sourceBreakdown = data?.sourceBreakdown || [
    { source: "LinkedIn", count: 58, percentage: 41, conversionRate: 72 },
    { source: "Email Campaign", count: 34, percentage: 24, conversionRate: 68 },
    { source: "Direct / Organic", count: 28, percentage: 20, conversionRate: 64 },
    { source: "Partner / Co-marketing", count: 22, percentage: 15, conversionRate: 77 },
  ];

  const funnel = data?.funnel || [
    { stage: "Event Page Visits", count: 850, percentage: 100 },
    { stage: "Registrations", count: 142, percentage: 16.7 },
    { stage: "Confirmed", count: 124, percentage: 14.6 },
    { stage: "Attended", count: 98, percentage: 11.5 },
    { stage: "Qualified Leads", count: 42, percentage: 4.9 },
    { stage: "Opportunities Won", count: 9, percentage: 1.1 },
  ];

  const taskBreakdown = [
    { name: "Completed", value: 18, color: "#35B982" },
    { name: "In Progress", value: 12, color: "#3987F5" },
    { name: "Pending", value: 8, color: "#E8B45E" },
    { name: "Overdue", value: 3, color: "#E36C75" },
  ];

  const defaultActivities = [
    {
      id: "a1",
      type: "REGISTRATION_CREATED",
      title: "New Registration",
      description: "Marcus Vance registered for Business Innovation Forum 2026 via LinkedIn",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "a2",
      type: "CHECK_IN",
      title: "Attendee Checked In",
      description: "Elena Rostova checked into Business Innovation Forum 2026",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "a3",
      type: "STATUS_CHANGED",
      title: "Lead Qualified",
      description: "David Chen marked as Qualified Lead ($45,000 potential pipeline)",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "a4",
      type: "AI_INSIGHT_GENERATED",
      title: "AI Follow-up Drafted",
      description: "Personalized follow-up draft generated for Sarah Lin (CTO @ Apex)",
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
  ];

  const activeActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">
              Executive Command Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#35B982]/10 text-[#35B982] border border-[#35B982]/30">
              Live Attribution
            </span>
          </div>
          <p className="text-xs text-[#91A0B5] mt-1">
            Real-time event performance, attendee engagement, and pipeline attribution metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-xs text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#3987F5]" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/events"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white shadow-glow transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Manage Events</span>
          </Link>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard
          title="Total Events"
          value={kpis.totalEvents}
          subtitle="All-time"
          icon={Calendar}
          variant="default"
        />
        <StatCard
          title="Active Events"
          value={kpis.activeEvents}
          subtitle="Published/Live"
          icon={Target}
          variant="brand"
        />
        <StatCard
          title="Registrations"
          value={kpis.totalRegistrations}
          subtitle="Across channels"
          icon={Users}
          change="+18%"
          trend="up"
          variant="brand"
        />
        <StatCard
          title="Total Attendees"
          value={kpis.totalAttendees}
          subtitle="Verified check-ins"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Attendance Rate"
          value={formatPercent(kpis.overallAttendanceRate)}
          subtitle="Show-up ratio"
          icon={TrendingUp}
          change="+4.2%"
          trend="up"
          variant="success"
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(kpis.totalPipelineValue)}
          subtitle="Influenced deals"
          icon={DollarSign}
          variant="warning"
        />
        <StatCard
          title="Won Revenue"
          value={formatCurrency(kpis.totalWonRevenue)}
          subtitle="Attributed closed"
          icon={DollarSign}
          change="+24%"
          trend="up"
          variant="success"
        />
        <StatCard
          title="Qualified Leads"
          value={kpis.qualifiedLeads}
          subtitle={`${kpis.totalLeads} total in CRM`}
          icon={Briefcase}
          variant="brand"
        />
      </div>

      {/* Charts Grid: 5 Interactive Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Registration & Attendance Trend (7 cols) */}
        <div className="lg:col-span-7 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Registration & Attendance Pace</h3>
              <p className="text-xs text-[#91A0B5]">Cumulative registrations vs verified attendees over time</p>
            </div>
            <span className="text-xs text-[#3987F5] bg-[#3987F5]/10 px-2 py-0.5 rounded border border-[#3987F5]/30 font-medium">
              Daily Pace
            </span>
          </div>

          <div className="h-64 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3987F5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3987F5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#35B982" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#35B982" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263345" vertical={false} />
                  <XAxis dataKey="date" stroke="#91A0B5" fontSize={11} tickLine={false} />
                  <YAxis stroke="#91A0B5" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#101722",
                      borderColor: "#263345",
                      borderRadius: "8px",
                      color: "#EAF0F8",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    name="Registrations"
                    stroke="#3987F5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#regGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="attendees"
                    name="Attendees"
                    stroke="#35B982"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#attGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: UTM Source Attribution (5 cols) */}
        <div className="lg:col-span-5 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Acquisition Channels (UTM)</h3>
              <p className="text-xs text-[#91A0B5]">Registration volume and conversion efficiency</p>
            </div>
            <span className="text-xs text-[#91A0B5]">By Channel</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceBreakdown}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {sourceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#101722",
                      borderColor: "#263345",
                      borderRadius: "8px",
                      color: "#EAF0F8",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Event Performance Comparison (6 cols) */}
        <div className="lg:col-span-6 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Event Performance Comparison</h3>
              <p className="text-xs text-[#91A0B5]">Registered vs Verified Attended per major event</p>
            </div>
            <Link href="/analytics" className="text-xs text-[#3987F5] hover:underline flex items-center gap-1">
              Full Matrix <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventComparisons} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263345" vertical={false} />
                  <XAxis
                    dataKey="title"
                    stroke="#91A0B5"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#91A0B5" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#101722",
                      borderColor: "#263345",
                      borderRadius: "8px",
                      color: "#EAF0F8",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                  <Bar dataKey="registered" name="Registered" fill="#3987F5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attended" name="Attended" fill="#35B982" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Conversion Funnel (6 cols) */}
        <div className="lg:col-span-6 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Event-to-Revenue Funnel</h3>
              <p className="text-xs text-[#91A0B5]">End-to-end conversion from visit to closed-won revenue</p>
            </div>
            <span className="text-xs font-semibold text-[#35B982] bg-[#35B982]/10 px-2 py-0.5 rounded border border-[#35B982]/30">
              6.3% Win Rate
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {funnel.map((item, index) => {
              const widths = [100, 75, 62, 50, 32, 16];
              const colors = ["#3987F5", "#2563EB", "#6366F1", "#8B5CF6", "#35B982", "#10B981"];
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#EAF0F8]">{item.stage}</span>
                    <span className="text-[#91A0B5] font-semibold">
                      {item.count.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#192435] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widths[index] || 20}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Follow-up Status & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 5: Follow-up & Task Status Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Follow-up & Task Status</h3>
              <p className="text-xs text-[#91A0B5]">Operational health of sales touches</p>
            </div>
            <Link href="/tasks" className="text-xs text-[#3987F5] hover:underline">
              View All
            </Link>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {taskBreakdown.map((entry, index) => (
                      <Cell key={`task-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#101722",
                      borderColor: "#263345",
                      borderRadius: "8px",
                      color: "#EAF0F8",
                      fontSize: "12px",
                    }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-[#263345] flex justify-between text-xs text-[#91A0B5]">
            <span>Completion Rate</span>
            <span className="font-bold text-[#35B982]">75.8% on-time</span>
          </div>
        </div>

        {/* Recent Activity Live Stream (8 cols) */}
        <div className="lg:col-span-8 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3987F5]" />
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Live Activity & Audit Feed</h3>
            </div>
            <span className="text-[11px] text-[#35B982] flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#35B982] animate-pulse" />
              Streaming Real-time
            </span>
          </div>

          <div className="divide-y divide-[#263345]/60 max-h-72 overflow-y-auto">
            {activeActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between gap-3 group">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#3987F5] flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#EAF0F8]">{act.title}</span>
                      <StatusBadge status={act.type.replace(/_/g, " ")} />
                    </div>
                    <p className="text-xs text-[#91A0B5] mt-0.5">{act.description}</p>
                  </div>
                </div>
                <span className="text-[11px] text-[#91A0B5] whitespace-nowrap flex-shrink-0">
                  {formatDateTime(act.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
