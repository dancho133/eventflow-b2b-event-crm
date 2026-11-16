"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  MapPin,
  Users,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/Badge";
import { CreateEventModal } from "@/components/CreateEventModal";
import { formatDate, formatCurrency, formatPercent } from "@/lib/utils";
import { Event, EventStatus, EventType } from "@/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (data.events) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.location && ev.location.toLowerCase().includes(search.toLowerCase())) ||
      (ev.tags && ev.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesStatus = statusFilter === "ALL" || ev.status === statusFilter;
    const matchesType = typeFilter === "ALL" || ev.eventType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRegistered = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
  const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
  const totalAttended = events.reduce((sum, e) => sum + (e.attendedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">Events Portfolio</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#192435] text-[#91A0B5] border border-[#263345]">
              {events.length} Events Total
            </span>
          </div>
          <p className="text-xs text-[#91A0B5] mt-1">
            End-to-end B2B conference, summit, and webinar operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchEvents}
            className="p-2 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#3987F5]" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Total Capacity</span>
          <p className="text-xl font-bold text-[#EAF0F8] mt-1">{totalCapacity.toLocaleString()} Seats</p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Total Registrations</span>
          <p className="text-xl font-bold text-[#3987F5] mt-1">{totalRegistered.toLocaleString()}</p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Verified Attendees</span>
          <p className="text-xl font-bold text-[#35B982] mt-1">{totalAttended.toLocaleString()}</p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Portfolio Show-Up</span>
          <p className="text-xl font-bold text-[#E8B45E] mt-1">
            {totalRegistered > 0 ? formatPercent((totalAttended / totalRegistered) * 100) : "0%"}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[#131C29] border border-[#263345] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event, location, tags..."
            className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#EAF0F8] placeholder-[#91A0B5] focus:outline-none focus:border-[#3987F5]"
          />
        </div>

        {/* Filters & View Modes */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
          >
            <option value="ALL">All Types</option>
            <option value="Conference">Conference</option>
            <option value="Summit">Summit</option>
            <option value="Webinar">Webinar</option>
            <option value="Workshop">Workshop</option>
            <option value="Networking">Networking</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-[#090D14] border border-[#263345] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-[#192435] text-[#3987F5]" : "text-[#91A0B5] hover:text-[#EAF0F8]"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded ${viewMode === "table" ? "bg-[#192435] text-[#3987F5]" : "text-[#91A0B5] hover:text-[#EAF0F8]"}`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Events Presentation */}
      {filteredEvents.length === 0 ? (
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-[#91A0B5] mx-auto opacity-50" />
          <h3 className="text-sm font-semibold text-[#EAF0F8]">No events match your criteria</h3>
          <p className="text-xs text-[#91A0B5] max-w-sm mx-auto">
            Try adjusting your search query or status filter, or create a new event.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-[#3987F5] hover:bg-[#2563EB] text-white text-xs font-semibold rounded-lg shadow-glow"
          >
            Create Event
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => {
            const capPercent = ev.capacity > 0 ? Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100)) : 0;
            const attRate = ev.registeredCount > 0 ? Math.round((ev.attendedCount / ev.registeredCount) * 100) : 0;

            return (
              <div
                key={ev.id}
                className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card hover:border-[#3987F5]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#192435] text-[#3987F5] border border-[#3987F5]/30">
                      {ev.eventType}
                    </span>
                    <StatusBadge status={ev.status} />
                  </div>

                  {/* Title & Short Description */}
                  <Link href={`/events/${ev.id}`} className="group-hover:text-[#3987F5] transition-colors">
                    <h3 className="font-bold text-base text-[#EAF0F8] line-clamp-1">{ev.title}</h3>
                  </Link>
                  <p className="text-xs text-[#91A0B5] mt-1 line-clamp-2 min-h-[32px]">
                    {ev.shortDescription || ev.description}
                  </p>

                  {/* Date & Location */}
                  <div className="mt-4 space-y-1.5 text-xs text-[#91A0B5]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#3987F5]" />
                      <span>{formatDate(ev.startDate)}</span>
                    </div>
                    {ev.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#35B982]" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4 pt-3 border-t border-[#263345]/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#91A0B5]">Capacity Utilization</span>
                      <span className="font-semibold text-[#EAF0F8]">
                        {ev.registeredCount} / {ev.capacity} ({capPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#192435] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          capPercent >= 90 ? "bg-[#E36C75]" : capPercent >= 75 ? "bg-[#E8B45E]" : "bg-[#3987F5]"
                        }`}
                        style={{ width: `${capPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics Row */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#101722] p-2 rounded border border-[#263345]">
                      <span className="text-[10px] text-[#91A0B5] uppercase">Attendance</span>
                      <p className="font-semibold text-[#35B982] mt-0.5">
                        {ev.attendedCount} ({attRate}%)
                      </p>
                    </div>
                    <div className="bg-[#101722] p-2 rounded border border-[#263345]">
                      <span className="text-[10px] text-[#91A0B5] uppercase">Target Rev</span>
                      <p className="font-semibold text-[#EAF0F8] mt-0.5">{formatCurrency(ev.expectedRevenue)}</p>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-3 border-t border-[#263345] flex items-center justify-between gap-2">
                  <Link
                    href={`/register/${ev.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-[11px] text-[#91A0B5] hover:text-[#3987F5] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Public Page</span>
                  </Link>

                  <Link
                    href={`/events/${ev.id}`}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#192435] text-[#3987F5] hover:bg-[#3987F5] hover:text-white transition-all border border-[#3987F5]/30"
                  >
                    <span>Manage Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#131C29] border border-[#263345] rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Registrations</th>
                  <th className="px-4 py-3">Attended</th>
                  <th className="px-4 py-3">Revenue Target</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263345] text-[#EAF0F8]">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#192435]/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link href={`/events/${ev.id}`} className="font-semibold text-sm hover:text-[#3987F5]">
                        {ev.title}
                      </Link>
                      <p className="text-[11px] text-[#91A0B5] truncate max-w-xs">{ev.location || "Virtual"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-[#192435] text-[#91A0B5] border border-[#263345]">
                        {ev.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-4 py-3.5 text-[#91A0B5] whitespace-nowrap">
                      {formatDate(ev.startDate)}
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      {ev.registeredCount} / {ev.capacity}
                    </td>
                    <td className="px-4 py-3.5 text-[#35B982] font-semibold">
                      {ev.attendedCount}
                    </td>
                    <td className="px-4 py-3.5 text-[#EAF0F8]">
                      {formatCurrency(ev.expectedRevenue)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/register/${ev.slug}`}
                          target="_blank"
                          className="p-1.5 rounded hover:bg-[#192435] text-[#91A0B5] hover:text-[#3987F5]"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/events/${ev.id}`}
                          className="px-3 py-1 rounded bg-[#192435] text-[#3987F5] hover:bg-[#3987F5] hover:text-white transition-colors font-medium border border-[#3987F5]/30"
                        >
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchEvents}
      />
    </div>
  );
}
