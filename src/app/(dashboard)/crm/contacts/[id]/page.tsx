"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  User,
  Building,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle2,
  DollarSign,
  Sparkles,
  ChevronLeft,
  Plus,
  RefreshCw,
  ExternalLink,
  Tag,
  Star,
  Clock,
  CheckSquare,
  AlertCircle,
  FileText,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/Badge";
import { AIDrawer } from "@/components/AIDrawer";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { formatCurrency, formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { Contact, Registration, Task, Opportunity, Activity, LeadStatus } from "@/types";

export default function ContactDetailPage() {
  const params = useParams();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"followup_draft" | "lead_classification">("lead_classification");

  useEffect(() => {
    if (contactId) fetchContactData();
  }, [contactId]);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contacts/${contactId}`);
      if (res.ok) {
        const data = await res.json();
        const contactObj = data.contact || data;
        setContact(contactObj);
        if (contactObj.registrations) setRegistrations(contactObj.registrations);
        else if (data.registrations) setRegistrations(data.registrations);

        if (contactObj.tasks) setTasks(contactObj.tasks);
        else if (data.tasks) setTasks(data.tasks);

        if (contactObj.opportunities) setOpportunities(contactObj.opportunities);
        else if (data.opportunities) setOpportunities(data.opportunities);

        if (contactObj.activities) setActivities(contactObj.activities);
        else if (data.activities) setActivities(data.activities);
      }
    } catch (err) {
      console.error("Failed to load contact data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLeadStatus = async (newStatus: LeadStatus) => {
    if (!contact) return;
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadStatus: newStatus }),
      });
      if (res.ok) {
        setContact({ ...contact, leadStatus: newStatus });
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  if (loading && !contact) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-[#91A0B5]">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#3987F5]" />
        Loading contact profile...
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="bg-[#131C29] border border-[#263345] rounded-xl p-12 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-[#E36C75] mx-auto" />
        <h3 className="text-base font-semibold text-[#EAF0F8]">Contact Not Found</h3>
        <p className="text-xs text-[#91A0B5]">The requested contact does not exist or has been removed.</p>
        <Link href="/crm" className="inline-block px-4 py-2 bg-[#3987F5] text-white text-xs font-semibold rounded-lg">
          Back to CRM
        </Link>
      </div>
    );
  }

  const fullName = `${contact.firstName} ${contact.lastName}`;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#91A0B5]">
        <Link href="/crm" className="hover:text-[#EAF0F8] flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          CRM Contacts
        </Link>
        <span>/</span>
        <span className="text-[#EAF0F8] font-medium">{fullName}</span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-[#131C29] border border-[#263345] rounded-2xl p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Avatar Initials */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3987F5] to-indigo-600 flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-[#3987F5]/20 flex-shrink-0">
              {getInitials(fullName)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-[#EAF0F8] tracking-tight">{fullName}</h1>
                {/* Lead Status Select */}
                <select
                  value={contact.leadStatus}
                  onChange={(e) => handleUpdateLeadStatus(e.target.value as LeadStatus)}
                  className="bg-[#101722] border border-[#263345] text-xs font-semibold rounded-lg px-2.5 py-1 text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                >
                  <option value="New">Status: New</option>
                  <option value="Contacted">Status: Contacted</option>
                  <option value="Qualified">Status: Qualified</option>
                  <option value="Nurturing">Status: Nurturing</option>
                  <option value="Customer">Status: Customer</option>
                  <option value="Inactive">Status: Inactive</option>
                </select>
              </div>

              <p className="text-xs text-[#91A0B5] flex items-center gap-2">
                <span>{contact.title || "Executive"}</span>
                {contact.company && (
                  <>
                    <span>•</span>
                    <span className="text-[#3987F5] font-medium">{contact.company.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#192435] text-[#91A0B5] border border-[#263345]">
                      {contact.company.tier}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setAiMode("lead_classification");
                setIsAIDrawerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#3987F5]/10 to-purple-500/10 border border-[#3987F5]/30 text-xs font-semibold text-[#3987F5] hover:text-white transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Lead Analysis</span>
            </button>

            <button
              onClick={() => {
                setAiMode("followup_draft");
                setIsAIDrawerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#192435] border border-[#263345] hover:border-[#3987F5]/40 text-xs font-medium text-[#EAF0F8] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#3987F5]" />
              <span>Draft Email</span>
            </button>

            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white shadow-glow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Profile & Company) vs Right Column (History & Deals) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-[#91A0B5] uppercase tracking-wider">
              Contact Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-[#EAF0F8]">
                <Mail className="w-4 h-4 text-[#3987F5] flex-shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>

              {contact.phone && (
                <div className="flex items-center gap-2.5 text-[#EAF0F8]">
                  <Phone className="w-4 h-4 text-[#35B982] flex-shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 text-[#EAF0F8]">
                <MapPin className="w-4 h-4 text-[#E8B45E] flex-shrink-0" />
                <span>
                  {contact.city || "San Francisco"}, {contact.country || "USA"}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-3 border-t border-[#263345]">
              <span className="text-[11px] text-[#91A0B5] block mb-2 font-medium">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags?.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-[#192435] text-xs text-[#91A0B5] border border-[#263345]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Lead Score Gauge Card */}
          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#91A0B5] uppercase tracking-wider">
                Intent Score
              </span>
              <span className="text-xs font-bold text-[#35B982]">{contact.leadScore}/100</span>
            </div>

            <div className="w-full bg-[#192435] h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  contact.leadScore >= 80 ? "bg-[#35B982]" : contact.leadScore >= 50 ? "bg-[#E8B45E]" : "bg-[#3987F5]"
                }`}
                style={{ width: `${contact.leadScore}%` }}
              />
            </div>

            <p className="text-[11px] text-[#91A0B5] leading-relaxed">
              Calculated based on B2B enterprise tier, event participation rate, and executive decision authority.
            </p>
          </div>

          {/* Company Card */}
          {contact.company && (
            <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#91A0B5] uppercase tracking-wider">
                  Company Account
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#192435] text-[#3987F5] border border-[#3987F5]/30">
                  {contact.company.tier}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#EAF0F8]">{contact.company.name}</h4>
                <p className="text-xs text-[#91A0B5]">{contact.company.industry}</p>
              </div>

              <div className="pt-2 border-t border-[#263345] space-y-1.5 text-xs text-[#91A0B5]">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="text-[#EAF0F8] font-medium">{contact.company.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Headquarters:</span>
                  <span className="text-[#EAF0F8] font-medium">{contact.company.headquarters || "San Francisco"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (8 cols): Event Attendance, Tasks, Opportunities & Activities */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Events Attended & Registration History */}
          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3987F5]" />
                <h3 className="text-sm font-semibold text-[#EAF0F8]">Event Attendance & History</h3>
              </div>
              <span className="text-xs text-[#91A0B5]">{registrations.length} Events</span>
            </div>

            <div className="divide-y divide-[#263345]">
              {registrations.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#91A0B5]">
                  No event registrations recorded yet for this contact.
                </div>
              ) : (
                registrations.map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <Link
                        href={r.eventId ? `/events/${r.eventId}` : "#"}
                        className="text-xs font-semibold text-[#EAF0F8] hover:text-[#3987F5] transition-colors"
                      >
                        {r.event?.title || "Event Registration"}
                      </Link>
                      <p className="text-[11px] text-[#91A0B5] mt-0.5">
                        Registered {formatDate(r.createdAt)} • Source: {r.utmSource}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={r.ticketType === "VIP" ? "purple" : "outline"}>
                        {r.ticketType}
                      </Badge>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Associated Opportunities */}
          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#35B982]" />
                <h3 className="text-sm font-semibold text-[#EAF0F8]">Deals & Pipeline Opportunities</h3>
              </div>
              <Link href="/crm/pipeline" className="text-xs text-[#3987F5] hover:underline">
                View Pipeline
              </Link>
            </div>

            <div className="divide-y divide-[#263345]">
              {opportunities.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#91A0B5]">
                  No active pipeline deals associated with this contact.
                </div>
              ) : (
                opportunities.map((opp) => (
                  <div key={opp.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-[#EAF0F8]">{opp.title}</h4>
                      <p className="text-[11px] text-[#91A0B5]">Stage: {opp.stage}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#35B982]">{formatCurrency(opp.value)}</span>
                      <p className="text-[10px] text-[#91A0B5]">{opp.probability}% probability</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: Tasks & Follow-ups */}
          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#E8B45E]" />
                <h3 className="text-sm font-semibold text-[#EAF0F8]">Action Items & Tasks</h3>
              </div>
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="text-xs text-[#3987F5] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </div>

            <div className="divide-y divide-[#263345]">
              {tasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#91A0B5]">
                  No open tasks for this contact.
                </div>
              ) : (
                tasks.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#EAF0F8]">{t.title}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      {t.description && <p className="text-xs text-[#91A0B5] mt-0.5">{t.description}</p>}
                    </div>
                    <span className="text-xs text-[#91A0B5]">Due: {formatDate(t.dueDate)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Activity Timeline */}
          <div className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3987F5]" />
              <h3 className="text-sm font-semibold text-[#EAF0F8]">Touchpoint & Activity Timeline</h3>
            </div>

            <div className="divide-y divide-[#263345]">
              {activities.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#91A0B5]">
                  No activity history recorded for this contact.
                </div>
              ) : (
                activities.map((a) => (
                  <div key={a.id} className="py-3 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#EAF0F8]">{a.title}</span>
                      <p className="text-xs text-[#91A0B5] mt-0.5">{a.description}</p>
                    </div>
                    <span className="text-[10px] text-[#91A0B5] whitespace-nowrap">
                      {formatDateTime(a.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Drawer with Contact Context */}
      <AIDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        defaultType={aiMode}
        context={{
          contactId: contact.id,
          contactName: fullName,
        }}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultContactId={contact.id}
        onSuccess={fetchContactData}
      />
    </div>
  );
}
