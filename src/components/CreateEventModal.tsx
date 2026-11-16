"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Users, MapPin, Tag, Loader2, UserCheck, Target } from "lucide-react";
import { EventType, User } from "@/types";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function CreateEventModal({ isOpen, onClose, onSuccess, initialData }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    shortDescription: "",
    eventType: "Conference" as EventType,
    startDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 16),
    capacity: 150,
    location: "San Francisco Convention Center",
    venueAddress: "747 Howard St, San Francisco, CA 94103",
    virtualUrl: "",
    targetAudience: "",
    createdById: "",
    budget: 25000,
    expectedRevenue: 100000,
    tags: "Enterprise, AI, SaaS",
  });

  useEffect(() => {
    // Fetch users for responsible manager selection
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) {
          setTeamMembers(data.users);
          if (data.users.length > 0 && !formData.createdById) {
            setFormData((prev) => ({ ...prev, createdById: prev.createdById || data.users[0].id }));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData((prev) => ({
        ...prev,
        title: initialData.title || prev.title,
        slug: initialData.slug || (initialData.title ? initialData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : prev.slug),
        description: initialData.description || prev.description,
        shortDescription: initialData.shortDescription || prev.shortDescription,
        eventType: initialData.eventType || prev.eventType,
        capacity: initialData.capacity !== undefined ? Number(initialData.capacity) : prev.capacity,
        budget: initialData.budget !== undefined ? Number(initialData.budget) : prev.budget,
        expectedRevenue: initialData.expectedRevenue !== undefined ? Number(initialData.expectedRevenue) : prev.expectedRevenue,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : (initialData.tags || prev.tags),
        targetAudience: initialData.targetAudience || prev.targetAudience,
        createdById: initialData.createdById || prev.createdById,
        location: initialData.location || prev.location,
        venueAddress: initialData.venueAddress || prev.venueAddress,
        startDate: initialData.startDate || prev.startDate,
        endDate: initialData.endDate || prev.endDate,
      }));
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug === "" || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") ? slug : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Event title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity),
          budget: Number(formData.budget),
          expectedRevenue: Number(formData.expectedRevenue),
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
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
      <div className="bg-[#101722] border border-[#263345] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-elevated">
        <div className="p-6 border-b border-[#263345] flex items-center justify-between bg-[#131C29]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3987F5]/10 text-[#3987F5] border border-[#3987F5]/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#EAF0F8]">Create New Event</h3>
              <p className="text-xs text-[#91A0B5]">Define event details, capacity, and revenue objectives</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Business Innovation Forum 2026"
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. business-innovation-forum-2026"
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Event Type
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              >
                <option value="Conference">Conference</option>
                <option value="Summit">Summit</option>
                <option value="Webinar">Webinar</option>
                <option value="Workshop">Workshop</option>
                <option value="Networking">Networking</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Summary / Short Description
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Key theme and value proposition for attendees"
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Full Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed agenda, keynotes, sessions, and outcomes..."
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg p-2.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Capacity Limit (Seats)
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Location Name / Venue
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco Convention Center"
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Budget Allocation ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <input
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Expected Attributed Revenue ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <input
                  type="number"
                  min="0"
                  value={formData.expectedRevenue}
                  onChange={(e) => setFormData({ ...formData, expectedRevenue: Number(e.target.value) })}
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Target Audience
              </label>
              <div className="relative">
                <Target className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g. Enterprise IT Directors, VP of Security, Head of Infrastructure"
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Responsible Team Member / Manager
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <select
                  value={formData.createdById}
                  onChange={(e) => setFormData({ ...formData, createdById: e.target.value })}
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                >
                  <option value="">Select Responsible Manager...</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Tags (comma separated)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. Enterprise, AI, B2B, Keynote"
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                />
              </div>
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
              <span>Create Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
