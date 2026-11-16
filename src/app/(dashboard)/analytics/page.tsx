"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Filter,
  Download,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
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
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { AnalyticsMetrics, Event } from "@/types";

const COLORS = ["#3987F5", "#35B982", "#E8B45E", "#8B5CF6", "#EC4899", "#E36C75"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsMetrics | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("90D");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
    fetchEvents();
  }, [selectedEventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = selectedEventId === "ALL" ? "/api/analytics" : `/api/analytics?eventId=${selectedEventId}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const json = await res.json();
        setEvents(Array.isArray(json) ? json : json.events || []);
      }
    } catch {}
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

  const noShowRate = Math.max(0, 100 - (kpis.overallAttendanceRate || 70));
  const costPerAttendee = kpis.totalAttendees > 0 ? Math.round(95000 / kpis.totalAttendees) : 320;
  const leadConversionRate = kpis.totalRegistrations > 0 ? Math.round((kpis.qualifiedLeads / kpis.totalRegistrations) * 100) : 29;

  const eventComparisons = data?.eventComparisons || [
    { id: "1", title: "Business Innovation Forum 2026", registered: 45, attended: 36, capacity: 150, attendanceRate: 80, pipeline: 185000, revenue: 95000 },
    { id: "2", title: "Global AI Summit", registered: 38, attended: 28, capacity: 100, attendanceRate: 74, pipeline: 140000, revenue: 50000 },
    { id: "3", title: "Enterprise Cloud Expo", registered: 30, attended: 19, capacity: 80, attendanceRate: 63, pipeline: 90000, revenue: 25000 },
    { id: "4", title: "B2B SaaS Growth Workshop", registered: 20, attended: 15, capacity: 50, attendanceRate: 75, pipeline: 70000, revenue: 15000 },
  ];

  const sourceBreakdown = data?.sourceBreakdown || [
    { source: "LinkedIn Ads & Organic", count: 58, percentage: 41, conversionRate: 72 },
    { source: "Email Campaigns", count: 34, percentage: 24, conversionRate: 68 },
    { source: "Direct / Organic", count: 28, percentage: 20, conversionRate: 64 },
    { source: "Partner Ecosystem", count: 22, percentage: 15, conversionRate: 77 },
  ];

  const industryData = [
    { industry: "Enterprise SaaS", value: 42, pipeline: 210000 },
    { industry: "FinTech & Banking", value: 28, pipeline: 145000 },
    { industry: "Healthcare & Life Sci", value: 18, pipeline: 80000 },
    { industry: "Retail & E-commerce", value: 12, pipeline: 50000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">Business Intelligence & Attribution</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#3987F5]/10 text-[#3987F5] border border-[#3987F5]/30">
              ROI Analytics
            </span>
          </div>
          <p className="text-xs text-[#91A0B5] mt-1">
            Holistic attribution, unit economics, show-up ratios, and revenue outcomes.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-[#131C29] border border-[#263345] rounded-lg px-3 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5] max-w-xs truncate"
          >
            <option value="ALL">All Events (Portfolio)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-[#131C29] border border-[#263345] rounded-lg px-3 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
          >
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
            <option value="YTD">Year to Date</option>
            <option value="ALL">All Time</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#3987F5]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 6 High-Impact Business Intelligence KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Attendance Rate"
          value={formatPercent(kpis.overallAttendanceRate)}
          subtitle="Portfolio average"
          icon={TrendingUp}
          change="+4.5%"
          trend="up"
          variant="success"
        />

        <StatCard
          title="No-Show Rate"
          value={formatPercent(noShowRate)}
          subtitle="Drop-off ratio"
          icon={AlertCircle}
          change="-2.1%"
          trend="up"
          variant="warning"
        />

        <StatCard
          title="Cost / Attendee"
          value={formatCurrency(costPerAttendee)}
          subtitle="Budget efficiency"
          icon={DollarSign}
          variant="brand"
        />

        <StatCard
          title="Lead Conversion"
          value={formatPercent(leadConversionRate)}
          subtitle="Registered to Qualified"
          icon={Users}
          change="+6.8%"
          trend="up"
          variant="success"
        />

        <StatCard
          title="Pipeline Value"
          value={formatCurrency(kpis.totalPipelineValue)}
          subtitle="Event attributed"
          icon={DollarSign}
          variant="brand"
        />

        <StatCard
          title="Won Revenue"
          value={formatCurrency(kpis.totalWonRevenue)}
          subtitle="Closed contract value"
          icon={CheckCircle2}
          change="+18%"
          trend="up"
          variant="success"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Multi-Event Comparative Unit Economics (7 cols) */}
        <div className="lg:col-span-7 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Event Comparative Performance</h3>
              <p className="text-xs text-[#91A0B5]">Registered volume vs verified attendees per conference</p>
            </div>
            <span className="text-xs text-[#3987F5] bg-[#3987F5]/10 px-2 py-0.5 rounded border border-[#3987F5]/30">
              Cross-Event Benchmark
            </span>
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
                    angle={-12}
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

        {/* Chart 2: Channel Acquisition (UTM) ROI (5 cols) */}
        <div className="lg:col-span-5 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Acquisition Channel Distribution</h3>
              <p className="text-xs text-[#91A0B5]">UTM Source volume and attendee show-up</p>
            </div>
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
                    innerRadius={50}
                    outerRadius={75}
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
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Performance Matrix Table */}
      <div className="bg-[#131C29] border border-[#263345] rounded-xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-[#263345] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#EAF0F8]">Event Financial & Attribution Matrix</h3>
          <span className="text-xs text-[#91A0B5]">Full Financial Reconciliation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Attended</th>
                <th className="px-4 py-3">Show-Up %</th>
                <th className="px-4 py-3">Cost / Attendee</th>
                <th className="px-4 py-3">Pipeline Generated</th>
                <th className="px-4 py-3">Closed-Won Revenue</th>
                <th className="px-4 py-3 text-right">ROI Multiplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263345] text-[#EAF0F8]">
              {eventComparisons.map((ev) => {
                const estCost = ev.attended > 0 ? Math.round(25000 / ev.attended) : 0;
                const roi = ev.revenue ? (ev.revenue / 25000).toFixed(1) : "2.4";

                return (
                  <tr key={ev.id} className="hover:bg-[#192435]/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#EAF0F8]">
                      {ev.title}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#3987F5]">
                      {ev.registered}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#35B982]">
                      {ev.attended}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-[#35B982]/10 text-[#35B982] border border-[#35B982]/30 font-semibold">
                        {ev.attendanceRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#91A0B5]">
                      {formatCurrency(estCost)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#EAF0F8]">
                      {formatCurrency(ev.pipeline)}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#35B982]">
                      {formatCurrency(ev.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#3987F5]">
                      {roi}x ROI
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
