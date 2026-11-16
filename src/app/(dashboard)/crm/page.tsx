"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Contact2,
  Building,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Star,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/Badge";
import { CreateContactModal } from "@/components/CreateContactModal";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Contact, Company, LeadStatus } from "@/types";

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<"contacts" | "companies">("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resContacts, resCompanies] = await Promise.all([
        fetch("/api/contacts"),
        fetch("/api/companies"),
      ]);

      if (resContacts.ok) {
        const cData = await resContacts.json();
        setContacts(Array.isArray(cData) ? cData : cData.contacts || []);
      }
      if (resCompanies.ok) {
        const coData = await resCompanies.json();
        setCompanies(Array.isArray(coData) ? coData : coData.companies || []);
      }
    } catch (err) {
      console.error("Failed to fetch CRM data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const email = c.email.toLowerCase();
    const comp = (c.company?.name || "").toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = fullName.includes(q) || email.includes(q) || comp.includes(q);
    const matchesStatus = leadStatusFilter === "ALL" || c.leadStatus === leadStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCompanies = companies.filter((co) => {
    const name = co.name.toLowerCase();
    const ind = (co.industry || "").toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = name.includes(q) || ind.includes(q);
    const matchesTier = tierFilter === "ALL" || co.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const qualifiedCount = contacts.filter((c) => c.leadStatus === "Qualified").length;
  const enterpriseCount = companies.filter((co) => co.tier === "Enterprise").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">Customer Intelligence (CRM)</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#192435] text-[#91A0B5] border border-[#263345]">
              {contacts.length} Contacts • {companies.length} Accounts
            </span>
          </div>
          <p className="text-xs text-[#91A0B5] mt-1">
            Executive contacts, target company accounts, and cross-event relationship tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#3987F5]" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Contact</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Total Contacts</span>
          <p className="text-xl font-bold text-[#EAF0F8] mt-1">{contacts.length}</p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Qualified Leads</span>
          <p className="text-xl font-bold text-[#35B982] mt-1">{qualifiedCount}</p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Enterprise Accounts</span>
          <p className="text-xl font-bold text-[#3987F5] mt-1">{enterpriseCount}</p>
        </div>
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-4">
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Total Companies</span>
          <p className="text-xl font-bold text-[#E8B45E] mt-1">{companies.length}</p>
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="bg-[#131C29] border border-[#263345] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex items-center bg-[#090D14] border border-[#263345] rounded-lg p-1 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "contacts" ? "bg-[#192435] text-[#3987F5]" : "text-[#91A0B5] hover:text-[#EAF0F8]"
            }`}
          >
            <Contact2 className="w-3.5 h-3.5" />
            <span>Contacts ({contacts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("companies")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "companies" ? "bg-[#192435] text-[#3987F5]" : "text-[#91A0B5] hover:text-[#EAF0F8]"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Companies ({companies.length})</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "contacts" ? "Search contacts..." : "Search companies..."}
              className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#EAF0F8] placeholder-[#91A0B5] focus:outline-none focus:border-[#3987F5]"
            />
          </div>

          {activeTab === "contacts" ? (
            <select
              value={leadStatusFilter}
              onChange={(e) => setLeadStatusFilter(e.target.value)}
              className="bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Nurturing">Nurturing</option>
              <option value="Customer">Customer</option>
              <option value="Inactive">Inactive</option>
            </select>
          ) : (
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
            >
              <option value="ALL">All Tiers</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="SMB">SMB</option>
              <option value="Startup">Startup</option>
            </select>
          )}
        </div>
      </div>

      {/* Directory Contents */}
      {activeTab === "contacts" ? (
        /* Contacts Table */
        <div className="bg-[#131C29] border border-[#263345] rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Title & Company</th>
                  <th className="px-4 py-3">Lead Score</th>
                  <th className="px-4 py-3">Lead Status</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263345] text-[#EAF0F8]">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-[#192435]/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/crm/contacts/${c.id}`}
                        className="font-semibold text-sm hover:text-[#3987F5] transition-colors"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                      <p className="text-[11px] text-[#91A0B5]">{c.email}</p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-[#EAF0F8]">{c.title || "Executive"}</p>
                      <p className="text-[11px] text-[#91A0B5]">{c.company?.name || "Direct"}</p>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            c.leadScore >= 80
                              ? "bg-[#35B982]/10 text-[#35B982] border border-[#35B982]/30"
                              : c.leadScore >= 50
                              ? "bg-[#E8B45E]/10 text-[#E8B45E] border border-[#E8B45E]/30"
                              : "bg-[#192435] text-[#91A0B5]"
                          }`}
                        >
                          {c.leadScore}
                        </span>
                        <span className="text-[10px] text-[#91A0B5]">/100</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={c.leadStatus} />
                    </td>

                    <td className="px-4 py-3 text-[#91A0B5]">
                      {c.city || "San Francisco"}, {c.country || "USA"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags?.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded bg-[#192435] text-[10px] text-[#91A0B5] border border-[#263345]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/crm/contacts/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#192435] text-[#3987F5] hover:bg-[#3987F5] hover:text-white transition-colors font-medium border border-[#3987F5]/30 text-xs"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Companies Directory Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((co) => (
            <div
              key={co.id}
              className="bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card hover:border-[#3987F5]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#192435] text-[#3987F5] border border-[#3987F5]/30">
                    {co.tier}
                  </span>
                  <span className="text-xs text-[#91A0B5]">{co.size || "100-500 employees"}</span>
                </div>

                <h3 className="font-bold text-base text-[#EAF0F8]">{co.name}</h3>
                <p className="text-xs text-[#91A0B5] mt-0.5">{co.industry || "Software & Cloud"}</p>

                <div className="mt-4 pt-3 border-t border-[#263345] space-y-2 text-xs text-[#91A0B5]">
                  <div className="flex justify-between">
                    <span>Headquarters:</span>
                    <span className="text-[#EAF0F8] font-medium">{co.headquarters || "San Francisco, CA"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Website:</span>
                    <span className="text-[#3987F5] font-medium">{co.website || co.domain || "acme.com"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#263345] flex items-center justify-between text-xs">
                <span className="text-[#35B982] font-semibold">Active Account</span>
                <span className="text-[#91A0B5]">{co.contacts?.length || 0} Associated Contacts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateContactModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
