"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Share2,
  ExternalLink,
  Edit,
  Trash2,
  Sparkles,
  Search,
  Filter,
  Download,
  Check,
  X,
  Plus,
  QrCode,
  Send,
  Copy,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  FileText,
  BarChart2,
  History,
  UserCheck,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/Badge";
import { StatCard } from "@/components/StatCard";
import { AIDrawer } from "@/components/AIDrawer";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { formatCurrency, formatDate, formatDateTime, formatPercent } from "@/lib/utils";
import { Event, Registration, Task, Activity, RegistrationStatus } from "@/types";

type TabKey = "overview" | "registrations" | "landing" | "attendance" | "followups" | "analytics" | "activity";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Modals & Drawers
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Registration Filter & Search
  const [regSearch, setRegSearch] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("ALL");

  // Attendance check-in simulation
  const [checkInSearch, setCheckInSearch] = useState("");
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        const eventObj = data.event || data;
        setEvent(eventObj);
        if (eventObj.registrations) setRegistrations(eventObj.registrations);
        else if (data.registrations) setRegistrations(data.registrations);

        if (eventObj.tasks) setTasks(eventObj.tasks);
        else if (data.tasks) setTasks(data.tasks);

        if (eventObj.activities) setActivities(eventObj.activities);
        else if (data.activities) setActivities(data.activities);
      } else {
        // Fallback fetch registrations directly if not embedded
        fetch(`/api/registrations?eventId=${eventId}`)
          .then((r) => r.json())
          .then((rData) => {
            if (Array.isArray(rData)) setRegistrations(rData);
            else if (rData.registrations) setRegistrations(rData.registrations);
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error("Failed to load event data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (regId: string, currentStatus: RegistrationStatus) => {
    const nextStatus: RegistrationStatus = currentStatus === "Attended" ? "Registered" : "Attended";
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          checkInTime: nextStatus === "Attended" ? new Date().toISOString() : null,
        }),
      });

      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === regId
              ? {
                  ...r,
                  status: nextStatus,
                  checkInTime: nextStatus === "Attended" ? new Date().toISOString() : null,
                }
              : r
          )
        );
        // Update local event stats
        if (event) {
          const delta = nextStatus === "Attended" ? 1 : -1;
          setEvent({
            ...event,
            attendedCount: Math.max(0, event.attendedCount + delta),
          });
        }
      }
    } catch (err) {
      console.error("Failed to update registration status:", err);
    }
  };

  const handleQuickCheckIn = (reg: Registration) => {
    handleStatusToggle(reg.id, "Registered");
    setCheckInSuccessMsg(`Checked in ${reg.contact?.firstName || "Attendee"} successfully!`);
    setTimeout(() => setCheckInSuccessMsg(null), 3500);
  };

  const handleCopyPublicLink = () => {
    if (!event) return;
    const url = `${window.location.origin}/register/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Company", "Title", "Ticket", "Status", "Source", "Check-in Time"];
    const rows = registrations.map((r) => [
      `"${r.contact?.firstName || ""} ${r.contact?.lastName || ""}"`,
      `"${r.contact?.email || ""}"`,
      `"${r.contact?.company?.name || ""}"`,
      `"${r.contact?.title || ""}"`,
      `"${r.ticketType}"`,
      `"${r.status}"`,
      `"${r.utmSource}"`,
      `"${r.checkInTime || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event?.slug || "event"}-registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-[#91A0B5]">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#3987F5]" />
        Loading event workspace...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-[#131C29] border border-[#263345] rounded-xl p-12 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-[#E36C75] mx-auto" />
        <h3 className="text-base font-semibold text-[#EAF0F8]">Event Not Found</h3>
        <p className="text-xs text-[#91A0B5]">The requested event does not exist or has been removed.</p>
        <Link href="/events" className="inline-block px-4 py-2 bg-[#3987F5] text-white text-xs font-semibold rounded-lg">
          Back to Events
        </Link>
      </div>
    );
  }

  const capacityRate = event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0;
  const attendanceRate = event.registeredCount > 0 ? Math.round((event.attendedCount / event.registeredCount) * 100) : 0;

  const filteredRegistrations = registrations.filter((r) => {
    const fullName = `${r.contact?.firstName || ""} ${r.contact?.lastName || ""}`.toLowerCase();
    const email = (r.contact?.email || "").toLowerCase();
    const company = (r.contact?.company?.name || "").toLowerCase();
    const query = regSearch.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query) || company.includes(query);
    const matchesStatus = regStatusFilter === "ALL" || r.status === regStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "registrations", label: "Registrations", count: registrations.length },
    { key: "landing", label: "Landing Page" },
    { key: "attendance", label: "Live Attendance", count: event.attendedCount },
    { key: "followups", label: "Follow-ups & Tasks", count: tasks.length },
    { key: "analytics", label: "Analytics" },
    { key: "activity", label: "Activity Audit", count: activities.length },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#91A0B5]">
        <Link href="/events" className="hover:text-[#EAF0F8] flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Events
        </Link>
        <span>/</span>
        <span className="text-[#EAF0F8] font-medium truncate max-w-sm">{event.title}</span>
      </div>

      {/* Main Event Header Card */}
      <div className="bg-[#131C29] border border-[#263345] rounded-xl p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#192435] text-[#3987F5] border border-[#3987F5]/30">
                {event.eventType}
              </span>
              <StatusBadge status={event.status} />
              <span className="text-xs text-[#91A0B5] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#3987F5]" />
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#EAF0F8] tracking-tight">{event.title}</h1>
            <p className="text-xs text-[#91A0B5] max-w-2xl">{event.shortDescription || event.description}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAIDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#3987F5]/10 to-purple-500/10 border border-[#3987F5]/30 text-xs font-semibold text-[#3987F5] hover:text-white transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Event Assistant</span>
            </button>

            <button
              onClick={handleCopyPublicLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#192435] border border-[#263345] hover:border-[#3987F5]/40 text-xs font-medium text-[#EAF0F8] transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#35B982]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share Link"}</span>
            </button>

            <Link
              href={`/register/${event.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white shadow-glow transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Page</span>
            </Link>
          </div>
        </div>

        {/* 4 High-level Stats */}
        <div className="mt-6 pt-6 border-t border-[#263345] grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#101722] p-3 rounded-lg border border-[#263345]">
            <span className="text-[11px] text-[#91A0B5] uppercase font-medium">Registrations</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-[#3987F5]">{event.registeredCount}</span>
              <span className="text-xs text-[#91A0B5]">/ {event.capacity} ({capacityRate}%)</span>
            </div>
          </div>
          <div className="bg-[#101722] p-3 rounded-lg border border-[#263345]">
            <span className="text-[11px] text-[#91A0B5] uppercase font-medium">Verified Attendees</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-[#35B982]">{event.attendedCount}</span>
              <span className="text-xs text-[#35B982] font-semibold">{attendanceRate}% show-up</span>
            </div>
          </div>
          <div className="bg-[#101722] p-3 rounded-lg border border-[#263345]">
            <span className="text-[11px] text-[#91A0B5] uppercase font-medium">Budget</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-[#EAF0F8]">{formatCurrency(event.budget)}</span>
              <span className="text-xs text-[#91A0B5]">Allocated</span>
            </div>
          </div>
          <div className="bg-[#101722] p-3 rounded-lg border border-[#263345]">
            <span className="text-[11px] text-[#91A0B5] uppercase font-medium">Target Revenue</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-[#E8B45E]">{formatCurrency(event.expectedRevenue)}</span>
              <span className="text-xs text-[#35B982] font-semibold">Attributable</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Tab Navigation Bar */}
      <div className="flex border-b border-[#263345] overflow-x-auto gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? "border-[#3987F5] text-[#3987F5] bg-[#131C29]/50"
                  : "border-transparent text-[#91A0B5] hover:text-[#EAF0F8] hover:border-[#263345]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? "bg-[#3987F5]/20 text-[#3987F5]" : "bg-[#192435] text-[#91A0B5]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Agenda */}
            <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-3">
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Executive Description & Agenda</h3>
              <p className="text-xs text-[#91A0B5] leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Venue & Location Details */}
            <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-3">
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Venue & Logistics</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#91A0B5]">Venue / Location:</span>
                  <p className="font-medium text-[#EAF0F8] mt-0.5">{event.location || "Virtual / Remote"}</p>
                </div>
                <div>
                  <span className="text-[#91A0B5]">Address:</span>
                  <p className="font-medium text-[#EAF0F8] mt-0.5">{event.venueAddress || "Online Webinar Platform"}</p>
                </div>
                <div>
                  <span className="text-[#91A0B5]">Timezone:</span>
                  <p className="font-medium text-[#EAF0F8] mt-0.5">{event.timezone || "UTC"}</p>
                </div>
                <div>
                  <span className="text-[#91A0B5]">Virtual URL:</span>
                  <p className="font-medium text-[#3987F5] mt-0.5 truncate">
                    {event.virtualUrl || "https://eventflow.io/live/" + event.slug}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info Card */}
          <div className="space-y-6">
            <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-4">
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Event Configuration</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#263345]/50">
                  <span className="text-[#91A0B5]">Public URL Slug</span>
                  <span className="font-mono text-[#3987F5]">/register/{event.slug}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#263345]/50">
                  <span className="text-[#91A0B5]">Capacity Cap</span>
                  <span className="font-semibold text-[#EAF0F8]">{event.capacity} seats</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#263345]/50">
                  <span className="text-[#91A0B5]">Tags</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {event.tags?.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-[#192435] text-[10px] text-[#91A0B5]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsAIDrawerOpen(true)}
                  className="w-full py-2 bg-[#192435] border border-[#3987F5]/40 hover:bg-[#3987F5]/20 text-[#3987F5] font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Event Brief via AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Registrations */}
      {activeTab === "registrations" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
              <input
                type="text"
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                placeholder="Search attendees by name, email, company..."
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#EAF0F8] placeholder-[#91A0B5] focus:outline-none focus:border-[#3987F5]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={regStatusFilter}
                onChange={(e) => setRegStatusFilter(e.target.value)}
                className="bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Registered">Registered</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Attended">Attended</option>
                <option value="No-show">No-show</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#192435] border border-[#263345] hover:border-[#3987F5]/40 text-xs font-medium text-[#EAF0F8] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#3987F5]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#131C29] border border-[#263345] rounded-xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3">Attendee</th>
                    <th className="px-4 py-3">Company & Title</th>
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">UTM Source</th>
                    <th className="px-4 py-3">Check-in Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263345] text-[#EAF0F8]">
                  {filteredRegistrations.map((r) => {
                    const isAttended = r.status === "Attended";
                    return (
                      <tr key={r.id} className="hover:bg-[#192435]/60 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={r.contact ? `/crm/contacts/${r.contact.id}` : "#"}
                            className="font-semibold text-sm hover:text-[#3987F5]"
                          >
                            {r.contact?.firstName} {r.contact?.lastName}
                          </Link>
                          <p className="text-[11px] text-[#91A0B5]">{r.contact?.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#EAF0F8]">{r.contact?.company?.name || "Direct"}</p>
                          <p className="text-[11px] text-[#91A0B5]">{r.contact?.title || "Executive"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{r.ticketType}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3 text-[#91A0B5]">{r.utmSource}</td>
                        <td className="px-4 py-3">
                          {isAttended ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#35B982] font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Checked In
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#91A0B5]">Awaiting</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleStatusToggle(r.id, r.status)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                              isAttended
                                ? "bg-[#E36C75]/10 text-[#E36C75] border border-[#E36C75]/30 hover:bg-[#E36C75]/20"
                                : "bg-[#35B982]/10 text-[#35B982] border border-[#35B982]/30 hover:bg-[#35B982]/20"
                            }`}
                          >
                            {isAttended ? "Undo Check-In" : "Check In"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Landing Page Config */}
      {activeTab === "landing" && (
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-6 shadow-card space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#EAF0F8]">Public Registration Portal Setup</h3>
            <p className="text-xs text-[#91A0B5]">Configure public URL, registration limits, and form parameters</p>
          </div>

          <div className="p-4 rounded-xl bg-[#101722] border border-[#263345] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#91A0B5] uppercase">Live Registration URL</span>
              <p className="text-sm font-mono text-[#3987F5]">
                {typeof window !== "undefined" ? window.location.origin : ""}/register/{event.slug}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPublicLink}
                className="px-3 py-1.5 rounded-lg bg-[#192435] text-xs font-medium text-[#EAF0F8] border border-[#263345] hover:border-[#3987F5]"
              >
                {copiedLink ? "Copied!" : "Copy Link"}
              </button>
              <Link
                href={`/register/${event.slug}`}
                target="_blank"
                className="px-4 py-1.5 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Page</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#91A0B5] font-semibold">Capacity Warning Threshold</label>
              <input
                type="text"
                disabled
                value={`Warning triggered at 85% capacity (${Math.round(event.capacity * 0.85)} registered)`}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg p-2 text-xs text-[#91A0B5]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[#91A0B5] font-semibold">Duplicate Registration Prevention</label>
              <input
                type="text"
                disabled
                value="Active (Rejects duplicate emails with 409 Conflict)"
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg p-2 text-xs text-[#35B982]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Attendance */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {checkInSuccessMsg && (
            <div className="p-3 rounded-lg bg-[#35B982]/10 border border-[#35B982]/30 text-xs text-[#35B982] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{checkInSuccessMsg}</span>
            </div>
          )}

          {/* Quick Check-in Console */}
          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#EAF0F8]">On-Site Check-in Scanner & Console</h3>
                <p className="text-xs text-[#91A0B5]">Rapid badge verification and attendance confirmation</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#35B982]">
                  {event.attendedCount} / {event.registeredCount} Verified ({attendanceRate}%)
                </span>
              </div>
            </div>

            <div className="relative">
              <QrCode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#3987F5]" />
              <input
                type="text"
                value={checkInSearch}
                onChange={(e) => setCheckInSearch(e.target.value)}
                placeholder="Scan attendee QR code or type attendee name / email to check-in..."
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] placeholder-[#91A0B5] focus:outline-none focus:border-[#3987F5]"
              />
            </div>

            {checkInSearch && (
              <div className="divide-y divide-[#263345] bg-[#101722] rounded-lg border border-[#263345] max-h-60 overflow-y-auto">
                {registrations
                  .filter((r) =>
                    `${r.contact?.firstName} ${r.contact?.lastName} ${r.contact?.email}`
                      .toLowerCase()
                      .includes(checkInSearch.toLowerCase())
                  )
                  .map((r) => (
                    <div key={r.id} className="p-3 flex items-center justify-between hover:bg-[#192435]">
                      <div>
                        <p className="text-xs font-semibold text-[#EAF0F8]">
                          {r.contact?.firstName} {r.contact?.lastName}
                        </p>
                        <p className="text-[11px] text-[#91A0B5]">
                          {r.contact?.email} • {r.contact?.company?.name || "Company"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleQuickCheckIn(r)}
                        className="px-3 py-1 rounded bg-[#35B982] hover:bg-[#2fa373] text-white text-xs font-semibold"
                      >
                        Confirm Check-In
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Follow-ups & Tasks */}
      {activeTab === "followups" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#EAF0F8]">Assigned Follow-ups & Tasks</h3>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white shadow-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>

          <div className="bg-[#131C29] border border-[#263345] rounded-xl overflow-hidden shadow-card">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#91A0B5]">
                No follow-up tasks recorded yet for this event. Click &quot;New Task&quot; to create one.
              </div>
            ) : (
              <div className="divide-y divide-[#263345]">
                {tasks.map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#EAF0F8]">{t.title}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      {t.description && <p className="text-xs text-[#91A0B5] mt-1">{t.description}</p>}
                    </div>
                    <span className="text-xs text-[#91A0B5]">Due: {formatDate(t.dueDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Analytics */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
            <h3 className="text-sm font-semibold text-[#EAF0F8] mb-3">Event Unit Economics</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#263345]/50">
                <span className="text-[#91A0B5]">Cost per Attendee</span>
                <span className="font-semibold text-[#EAF0F8]">
                  {event.attendedCount > 0 ? formatCurrency(event.budget / event.attendedCount) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#263345]/50">
                <span className="text-[#91A0B5]">Expected Revenue Multiplier</span>
                <span className="font-semibold text-[#35B982]">
                  {event.budget > 0 ? `${(event.expectedRevenue / event.budget).toFixed(1)}x ROI` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#263345]/50">
                <span className="text-[#91A0B5]">Show-Up Rate</span>
                <span className="font-semibold text-[#3987F5]">{attendanceRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
            <h3 className="text-sm font-semibold text-[#EAF0F8] mb-3">Audience Seniority Breakdown</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#91A0B5]">C-Level & VP (Executives)</span>
                <span className="font-semibold text-[#EAF0F8]">48%</span>
              </div>
              <div className="h-2 bg-[#192435] rounded-full overflow-hidden">
                <div className="h-full bg-[#3987F5] w-[48%]" />
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-[#91A0B5]">Directors & Heads</span>
                <span className="font-semibold text-[#EAF0F8]">32%</span>
              </div>
              <div className="h-2 bg-[#192435] rounded-full overflow-hidden">
                <div className="h-full bg-[#35B982] w-[32%]" />
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-[#91A0B5]">Managers & Leads</span>
                <span className="font-semibold text-[#EAF0F8]">20%</span>
              </div>
              <div className="h-2 bg-[#192435] rounded-full overflow-hidden">
                <div className="h-full bg-[#E8B45E] w-[20%]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Activity */}
      {activeTab === "activity" && (
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold text-[#EAF0F8] mb-4">Event Audit Trail</h3>
          <div className="divide-y divide-[#263345]">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#91A0B5]">
                No logged activity yet for this event.
              </div>
            ) : (
              activities.map((a) => (
                <div key={a.id} className="py-3 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#EAF0F8]">{a.title}</p>
                    <p className="text-[11px] text-[#91A0B5]">{a.description}</p>
                  </div>
                  <span className="text-[10px] text-[#91A0B5]">{formatDateTime(a.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* AI Drawer with Event Context */}
      <AIDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        context={{
          eventId: event.id,
          eventTitle: event.title,
        }}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultEventId={event.id}
        onSuccess={fetchEventData}
      />
    </div>
  );
}
