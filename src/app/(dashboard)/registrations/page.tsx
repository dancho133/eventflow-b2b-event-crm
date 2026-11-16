"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Calendar,
  Building,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/Badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Registration, Event, RegistrationStatus } from "@/types";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ticketFilter, setTicketFilter] = useState("ALL");

  useEffect(() => {
    fetchRegistrations();
    fetchEvents();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/registrations");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setRegistrations(data);
        else if (data.registrations) setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setEvents(data);
        else if (data.events) setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: RegistrationStatus) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          checkInTime: newStatus === "Attended" ? new Date().toISOString() : null,
        }),
      });

      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: newStatus,
                  checkInTime: newStatus === "Attended" ? new Date().toISOString() : r.checkInTime,
                }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const fullName = `${r.contact?.firstName || ""} ${r.contact?.lastName || ""}`.toLowerCase();
    const email = (r.contact?.email || "").toLowerCase();
    const company = (r.contact?.company?.name || "").toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = fullName.includes(q) || email.includes(q) || company.includes(q);
    const matchesEvent = eventFilter === "ALL" || r.eventId === eventFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesTicket = ticketFilter === "ALL" || r.ticketType === ticketFilter;

    return matchesSearch && matchesEvent && matchesStatus && matchesTicket;
  });

  const exportCSV = () => {
    const headers = ["Name", "Email", "Company", "Title", "Event", "Ticket Type", "Status", "UTM Source", "Created At", "Check-in Time"];
    const rows = filteredRegistrations.map((r) => [
      `"${r.contact?.firstName || ""} ${r.contact?.lastName || ""}"`,
      `"${r.contact?.email || ""}"`,
      `"${r.contact?.company?.name || ""}"`,
      `"${r.contact?.title || ""}"`,
      `"${r.event?.title || ""}"`,
      `"${r.ticketType}"`,
      `"${r.status}"`,
      `"${r.utmSource}"`,
      `"${r.createdAt}"`,
      `"${r.checkInTime || ""}"`,
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `eventflow-registrations-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const total = registrations.length;
  const attended = registrations.filter((r) => r.status === "Attended").length;
  const confirmed = registrations.filter((r) => r.status === "Confirmed").length;
  const noShows = registrations.filter((r) => r.status === "No-show").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">Registrations Ledger</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#192435] text-[#91A0B5] border border-[#263345]">
              {total} Total Records
            </span>
          </div>
          <p className="text-xs text-[#91A0B5] mt-1">
            Global attendance registry, channel attribution, and lifecycle status management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRegistrations}
            className="p-2 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#3987F5]" : ""}`} />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#192435] border border-[#263345] hover:border-[#3987F5]/40 text-xs font-semibold text-[#EAF0F8] transition-colors"
          >
            <Download className="w-4 h-4 text-[#3987F5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Total Registered</span>
          <p className="text-xl font-bold text-[#3987F5] mt-1">{total}</p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Confirmed</span>
          <p className="text-xl font-bold text-[#EAF0F8] mt-1">{confirmed}</p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Verified Attended</span>
          <p className="text-xl font-bold text-[#35B982] mt-1">{attended}</p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">No-Show / Cancelled</span>
          <p className="text-xl font-bold text-[#E36C75] mt-1">{noShows}</p>
        </div>
      </div>

      {/* Search & Multi-Filters */}
      <div className="bg-[#131C29] border border-[#263345] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee, email, company..."
            className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#EAF0F8] placeholder-[#91A0B5] focus:outline-none focus:border-[#3987F5]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Event Filter */}
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5] max-w-xs truncate"
          >
            <option value="ALL">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Registered">Registered</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Attended">Attended</option>
            <option value="No-show">No-show</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Ticket Type Filter */}
          <select
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            className="bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
          >
            <option value="ALL">All Tickets</option>
            <option value="General">General</option>
            <option value="VIP">VIP</option>
            <option value="Speaker">Speaker</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Press">Press</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-[#131C29] border border-[#263345] rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Organization & Title</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Registered Date</th>
                <th className="px-4 py-3 text-right">Quick Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263345] text-[#EAF0F8]">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs text-[#91A0B5]">
                    No registrations found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((r) => (
                  <tr key={r.id} className="hover:bg-[#192435]/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={r.contact ? `/crm/contacts/${r.contact.id}` : "#"}
                        className="font-semibold text-sm hover:text-[#3987F5] transition-colors"
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
                      <Link
                        href={r.eventId ? `/events/${r.eventId}` : "#"}
                        className="font-medium hover:text-[#3987F5] truncate block max-w-xs"
                      >
                        {r.event?.title || "Event"}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={r.ticketType === "VIP" ? "purple" : "outline"}>
                        {r.ticketType}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="px-4 py-3 text-[#91A0B5] whitespace-nowrap">
                      {r.utmSource}
                    </td>

                    <td className="px-4 py-3 text-[#91A0B5] whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <select
                        value={r.status}
                        onChange={(e) => handleUpdateStatus(r.id, e.target.value as RegistrationStatus)}
                        className="bg-[#101722] border border-[#263345] rounded px-2 py-1 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                      >
                        <option value="Registered">Registered</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Attended">Attended</option>
                        <option value="No-show">No-show</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
