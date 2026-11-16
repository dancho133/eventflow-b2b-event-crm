"use client";

import React, { useState, useEffect } from "react";
import { X, CheckSquare, Calendar, Flag, Loader2 } from "lucide-react";
import { TaskPriority, TaskStatus, Event, Contact } from "@/types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultEventId?: string;
  defaultContactId?: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  defaultEventId,
  defaultContactId,
}: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    priority: "High" as TaskPriority,
    status: "Pending" as TaskStatus,
    eventId: defaultEventId || "",
    contactId: defaultContactId || "",
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/events")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setEvents(data);
          else if (data.events) setEvents(data.events);
        })
        .catch(() => {});

      fetch("/api/contacts")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setContacts(data);
          else if (data.contacts) setContacts(data.contacts);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId: formData.eventId || undefined,
          contactId: formData.contactId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task");
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
      <div className="bg-[#101722] border border-[#263345] rounded-2xl w-full max-w-lg shadow-elevated">
        <div className="p-6 border-b border-[#263345] flex items-center justify-between bg-[#131C29]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#E8B45E]/10 text-[#E8B45E] border border-[#E8B45E]/30">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#EAF0F8]">Create Task / Follow-up</h3>
              <p className="text-xs text-[#91A0B5]">Assign actionable item to an event or contact</p>
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

          <div>
            <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Follow up on custom enterprise SLA & send slide deck"
              className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Context, discussion points, key requirements..."
              className="w-full bg-[#090D14] border border-[#263345] rounded-lg p-2.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Related Event
              </label>
              <select
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              >
                <option value="">None / General</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Related Contact
              </label>
              <select
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              >
                <option value="">None / General</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} {c.company?.name ? `(${c.company.name})` : ""}
                  </option>
                ))}
              </select>
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
              <span>Save Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
