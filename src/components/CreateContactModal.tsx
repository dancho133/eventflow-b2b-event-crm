"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Mail, Phone, Building, Briefcase, Tag, Loader2 } from "lucide-react";
import { LeadStatus, Company } from "@/types";

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateContactModal({ isOpen, onClose, onSuccess }: CreateContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    companyId: "",
    companyName: "",
    leadStatus: "New" as LeadStatus,
    leadScore: 65,
    tags: "VIP, Decision Maker",
    bio: "",
    city: "San Francisco",
    country: "USA",
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/companies")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setCompanies(data);
          else if (data.companies) setCompanies(data.companies);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyId: formData.companyId || undefined,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create contact");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#101722] border border-[#263345] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-elevated">
        <div className="p-6 border-b border-[#263345] flex items-center justify-between bg-[#131C29]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#35B982]/10 text-[#35B982] border border-[#35B982]/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#EAF0F8]">Create New Contact</h3>
              <p className="text-xs text-[#91A0B5]">Add executive contact with CRM & company enrichment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#91A0B5] hover:text-[#EAF0F8] hover:bg-[#192435] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#E36C75]/10 border border-[#E36C75]/30 text-xs text-[#E36C75]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Job Title
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chief Innovation Officer"
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Company
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                {companies.length > 0 ? (
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                  >
                    <option value="">Select Existing Company or type below</option>
                    {companies.map((co) => (
                      <option key={co.id} value={co.id}>
                        {co.name} ({co.tier})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter Company Name"
                    className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Lead Status
              </label>
              <select
                value={formData.leadStatus}
                onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value as LeadStatus })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Nurturing">Nurturing</option>
                <option value="Customer">Customer</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Initial Lead Score (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.leadScore}
                onChange={(e) => setFormData({ ...formData, leadScore: Number(e.target.value) })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
              Tags (comma separated)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g. VIP, Executive, High-Intent"
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#263345] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#192435] text-[#91A0B5] hover:text-[#EAF0F8] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-white text-xs font-semibold flex items-center gap-2 shadow-glow transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Contact</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
