"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Flag,
  RefreshCw,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/Badge";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { formatDate } from "@/lib/utils";
import { Task, TaskPriority, TaskStatus } from "@/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === "Completed" ? "Pending" : "Completed";
    try {
      const res = await fetch(`/api/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const isOverdue = (dueDate?: string | null, status?: TaskStatus) => {
    if (!dueDate || status === "Completed") return false;
    return new Date(dueDate).getTime() < Date.now() - 86400000;
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      (t.contact && `${t.contact.firstName} ${t.contact.lastName}`.toLowerCase().includes(search.toLowerCase())) ||
      (t.event && t.event.title.toLowerCase().includes(search.toLowerCase()));

    if (filterStatus === "OVERDUE") {
      return matchesSearch && isOverdue(t.dueDate, t.status);
    }

    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "In_Progress").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

  const priorityStyles: Record<TaskPriority, string> = {
    Urgent: "bg-[#E36C75]/10 text-[#E36C75] border-[#E36C75]/30",
    High: "bg-[#E8B45E]/10 text-[#E8B45E] border-[#E8B45E]/30",
    Medium: "bg-[#3987F5]/10 text-[#3987F5] border-[#3987F5]/30",
    Low: "bg-[#192435] text-[#91A0B5] border-[#263345]",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">Tasks & Follow-ups</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#192435] text-[#91A0B5] border border-[#263345]">
              {tasks.length} Total
            </span>
          </div>
          <p className="text-xs text-[#91A0B5] mt-1">
            Action items, executive touchpoints, and post-event follow-up orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTasks}
            className="p-2 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#3987F5]" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 4 Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus("Pending")}
          className={`bg-[#131C29] border rounded-xl p-4 text-left transition-all ${
            filterStatus === "Pending" ? "border-[#3987F5] shadow-glow" : "border-[#263345] hover:border-[#3987F5]/40"
          }`}
        >
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">To Do (Pending)</span>
          <p className="text-xl font-bold text-[#3987F5] mt-1">{pendingCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus("In_Progress")}
          className={`bg-[#131C29] border rounded-xl p-4 text-left transition-all ${
            filterStatus === "In_Progress" ? "border-[#3987F5] shadow-glow" : "border-[#263345] hover:border-[#3987F5]/40"
          }`}
        >
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">In Progress</span>
          <p className="text-xl font-bold text-[#E8B45E] mt-1">{inProgressCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus("Completed")}
          className={`bg-[#131C29] border rounded-xl p-4 text-left transition-all ${
            filterStatus === "Completed" ? "border-[#3987F5] shadow-glow" : "border-[#263345] hover:border-[#3987F5]/40"
          }`}
        >
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Completed</span>
          <p className="text-xl font-bold text-[#35B982] mt-1">{completedCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus("OVERDUE")}
          className={`bg-[#131C29] border rounded-xl p-4 text-left transition-all ${
            filterStatus === "OVERDUE" ? "border-[#E36C75] shadow-glow" : "border-[#263345] hover:border-[#E36C75]/40"
          }`}
        >
          <span className="text-[11px] font-medium text-[#91A0B5] uppercase">Overdue</span>
          <p className="text-xl font-bold text-[#E36C75] mt-1">{overdueCount}</p>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#131C29] border border-[#263345] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, descriptions, contacts..."
            className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#EAF0F8] placeholder-[#91A0B5] focus:outline-none focus:border-[#3987F5]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In_Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="OVERDUE">Overdue Only</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-[#131C29] border border-[#263345] rounded-xl overflow-hidden shadow-card divide-y divide-[#263345]">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#91A0B5] space-y-2">
            <CheckSquare className="w-8 h-8 text-[#91A0B5] mx-auto opacity-50" />
            <p className="font-semibold text-[#EAF0F8]">No tasks found</p>
            <p>You're all caught up or no tasks match your filters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const completed = task.status === "Completed";
            const overdue = isOverdue(task.dueDate, task.status);

            return (
              <div
                key={task.id}
                className="p-4 hover:bg-[#192435]/50 transition-colors flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className="mt-0.5 text-[#91A0B5] hover:text-[#35B982] transition-colors flex-shrink-0"
                  >
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#35B982] fill-[#35B982]/20" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold transition-all ${
                          completed ? "line-through text-[#91A0B5]" : "text-[#EAF0F8]"
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          priorityStyles[task.priority] || priorityStyles.Medium
                        }`}
                      >
                        {task.priority}
                      </span>

                      <StatusBadge status={task.status} />
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#91A0B5] line-clamp-2">{task.description}</p>
                    )}

                    {/* Context Links */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#91A0B5]">
                      {task.event && (
                        <Link
                          href={`/events/${task.event.id}`}
                          className="flex items-center gap-1 text-[#3987F5] hover:underline"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{task.event.title}</span>
                        </Link>
                      )}

                      {task.contact && (
                        <Link
                          href={`/crm/contacts/${task.contact.id}`}
                          className="flex items-center gap-1 text-[#35B982] hover:underline"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>
                            {task.contact.firstName} {task.contact.lastName}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Due Date & Badges */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {task.dueDate && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                        overdue
                          ? "bg-[#E36C75]/10 text-[#E36C75] border border-[#E36C75]/30"
                          : "text-[#91A0B5]"
                      }`}
                    >
                      {overdue && <AlertCircle className="w-3 h-3" />}
                      Due {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
