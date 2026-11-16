"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Kanban,
  DollarSign,
  TrendingUp,
  Plus,
  Building,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  ChevronRight,
  MoreVertical,
  X,
  Loader2,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Opportunity, OpportunityStage, Event, Contact, Company } from "@/types";

const STAGES: { stage: OpportunityStage; label: string; color: string }[] = [
  { stage: "Discovery", label: "Discovery", color: "#3987F5" },
  { stage: "Qualified", label: "Qualified", color: "#6366F1" },
  { stage: "Proposal", label: "Proposal", color: "#8B5CF6" },
  { stage: "Negotiation", label: "Negotiation", color: "#E8B45E" },
  { stage: "Won", label: "Closed Won", color: "#35B982" },
  { stage: "Lost", label: "Closed Lost", color: "#E36C75" },
];

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // For modal creation
  const [events, setEvents] = useState<Event[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newDeal, setNewDeal] = useState({
    title: "",
    value: 50000,
    stage: "Discovery" as OpportunityStage,
    probability: 25,
    companyId: "",
    contactId: "",
    eventId: "",
    notes: "",
  });

  useEffect(() => {
    fetchOpportunities();
    fetchSupportData();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/opportunities");
      if (res.ok) {
        const data = await res.json();
        setOpportunities(Array.isArray(data) ? data : data.opportunities || []);
      }
    } catch (err) {
      console.error("Failed to load opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [eRes, cRes, coRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/contacts"),
        fetch("/api/companies"),
      ]);
      if (eRes.ok) {
        const eData = await eRes.json();
        setEvents(Array.isArray(eData) ? eData : eData.events || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setContacts(Array.isArray(cData) ? cData : cData.contacts || []);
      }
      if (coRes.ok) {
        const coData = await coRes.json();
        setCompanies(Array.isArray(coData) ? coData : coData.companies || []);
      }
    } catch {}
  };

  const handleStageChange = async (oppId: string, newStage: OpportunityStage) => {
    try {
      const res = await fetch(`/api/opportunities`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: oppId, stage: newStage }),
      });

      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === oppId ? { ...o, stage: newStage } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update opportunity stage:", err);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.title.trim()) return;

    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newDeal,
          value: Number(newDeal.value),
          probability: Number(newDeal.probability),
        }),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        fetchOpportunities();
      }
    } catch (err) {
      console.error("Failed to create deal:", err);
    }
  };

  const totalValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);
  const wonValue = opportunities
    .filter((o) => o.stage === "Won")
    .reduce((sum, o) => sum + (o.value || 0), 0);
  const activeDeals = opportunities.filter((o) => o.stage !== "Won" && o.stage !== "Lost");
  const activeValue = activeDeals.reduce((sum, o) => sum + (o.value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">Opportunity Pipeline</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#35B982]/10 text-[#35B982] border border-[#35B982]/30">
              {formatCurrency(totalValue)} Influenced
            </span>
          </div>
          <p className="text-xs text-[#91A0B5] mt-1">
            Visual deal flow and event-attributed revenue acceleration across stages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOpportunities}
            className="p-2 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#3987F5]" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Pipeline Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Total Active Pipeline</span>
          <p className="text-xl font-bold text-[#3987F5] mt-1">{formatCurrency(activeValue)}</p>
          <span className="text-[10px] text-[#91A0B5] mt-0.5 block">{activeDeals.length} active deals</span>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Attributed Closed-Won</span>
          <p className="text-xl font-bold text-[#35B982] mt-1">{formatCurrency(wonValue)}</p>
          <span className="text-[10px] text-[#35B982] mt-0.5 block">100% realized</span>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Average Deal Size</span>
          <p className="text-xl font-bold text-[#EAF0F8] mt-1">
            {opportunities.length > 0 ? formatCurrency(totalValue / opportunities.length) : "$0"}
          </p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Pipeline Health</span>
          <p className="text-xl font-bold text-[#E8B45E] mt-1">High Velocity</p>
          <span className="text-[10px] text-[#91A0B5] mt-0.5 block">Avg 24 days to close</span>
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px]">
          {STAGES.map((col) => {
            const stageDeals = opportunities.filter((o) => o.stage === col.stage);
            const stageTotal = stageDeals.reduce((sum, o) => sum + (o.value || 0), 0);

            return (
              <div
                key={col.stage}
                className="w-80 flex-shrink-0 bg-[#101722] border border-[#263345] rounded-2xl flex flex-col max-h-[750px]"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-[#263345] bg-[#131C29] rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                      <h3 className="font-bold text-xs text-[#EAF0F8]">{col.label}</h3>
                    </div>
                    <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-[#192435] text-[#91A0B5] border border-[#263345]">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#91A0B5] mt-1">
                    {formatCurrency(stageTotal)}
                  </p>
                </div>

                {/* Cards Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-[#91A0B5] border border-dashed border-[#263345] rounded-xl">
                      No deals in this stage
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/50 rounded-xl p-3.5 shadow-sm space-y-2.5 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-xs text-[#EAF0F8] group-hover:text-[#3987F5] transition-colors leading-snug">
                            {deal.title}
                          </h4>
                          <span className="font-bold text-xs text-[#35B982] whitespace-nowrap">
                            {formatCurrency(deal.value)}
                          </span>
                        </div>

                        {/* Company & Contact */}
                        <div className="space-y-1 text-[11px] text-[#91A0B5]">
                          {deal.company && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Building className="w-3 h-3 text-[#3987F5]" />
                              <span className="truncate">{deal.company.name}</span>
                            </div>
                          )}
                          {deal.contact && (
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="w-3 h-3 text-[#35B982]" />
                              <span className="truncate">
                                {deal.contact.firstName} {deal.contact.lastName}
                              </span>
                            </div>
                          )}
                          {deal.event && (
                            <div className="flex items-center gap-1.5 truncate text-[10px] text-[#E8B45E]">
                              <Calendar className="w-3 h-3" />
                              <span className="truncate">{deal.event.title}</span>
                            </div>
                          )}
                        </div>

                        {/* Probability Progress */}
                        <div className="space-y-1 pt-1 border-t border-[#263345]/60">
                          <div className="flex justify-between text-[10px] text-[#91A0B5]">
                            <span>Probability</span>
                            <span>{deal.probability}%</span>
                          </div>
                          <div className="w-full bg-[#192435] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#3987F5]"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                        </div>

                        {/* Move Stage Selector */}
                        <div className="pt-1 flex items-center justify-between text-[10px] text-[#91A0B5]">
                          <span>Stage:</span>
                          <select
                            value={deal.stage}
                            onChange={(e) => handleStageChange(deal.id, e.target.value as OpportunityStage)}
                            className="bg-[#090D14] border border-[#263345] rounded px-1.5 py-0.5 text-[10px] text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                          >
                            {STAGES.map((s) => (
                              <option key={s.stage} value={s.stage}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Deal Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101722] border border-[#263345] rounded-2xl w-full max-w-lg shadow-elevated">
            <div className="p-6 border-b border-[#263345] flex items-center justify-between bg-[#131C29]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#35B982]/10 text-[#35B982] border border-[#35B982]/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#EAF0F8]">Create Deal Opportunity</h3>
                  <p className="text-xs text-[#91A0B5]">Track pipeline generated from events</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-[#91A0B5] hover:text-[#EAF0F8] hover:bg-[#192435]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">Deal Name *</label>
                <input
                  type="text"
                  required
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  placeholder="e.g. Acme Enterprise License (500 seats)"
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">Value ($)</label>
                  <input
                    type="number"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                    className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as OpportunityStage })}
                    className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                  >
                    {STAGES.map((s) => (
                      <option key={s.stage} value={s.stage}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">Company</label>
                  <select
                    value={newDeal.companyId}
                    onChange={(e) => setNewDeal({ ...newDeal, companyId: e.target.value })}
                    className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                  >
                    <option value="">Select Company</option>
                    {companies.map((co) => (
                      <option key={co.id} value={co.id}>
                        {co.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">Contact</label>
                  <select
                    value={newDeal.contactId}
                    onChange={(e) => setNewDeal({ ...newDeal, contactId: e.target.value })}
                    className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                  >
                    <option value="">Select Contact</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">Attributed Event</label>
                <select
                  value={newDeal.eventId}
                  onChange={(e) => setNewDeal({ ...newDeal, eventId: e.target.value })}
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                >
                  <option value="">None / Outbound</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-[#263345] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#192435] text-[#91A0B5] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-white text-xs font-semibold shadow-glow"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
