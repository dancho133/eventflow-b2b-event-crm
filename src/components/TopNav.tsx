"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  ChevronDown,
  Calendar,
  UserPlus,
  CheckSquare,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopNavProps {
  onOpenCreateEvent?: () => void;
  onOpenCreateTask?: () => void;
  onToggleAIDrawer?: () => void;
}

export function TopNav({
  onOpenCreateEvent,
  onOpenCreateTask,
  onToggleAIDrawer,
}: TopNavProps) {
  const router = useRouter();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("Acme Global Enterprise");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const workspaces = [
    { name: "Acme Global Enterprise", region: "Global / US-East" },
    { name: "EMEA Marketing Hub", region: "Frankfurt / London" },
    { name: "APAC Developer Growth", region: "Singapore / Tokyo" },
  ];

  const notifications = [
    {
      id: 1,
      title: "New VIP Registration",
      desc: "Marcus Vance (CTO @ Nexus Systems) registered for Business Innovation Forum 2026",
      time: "2m ago",
      type: "vip",
    },
    {
      id: 2,
      title: "Lead Qualified by AI",
      desc: "Elena Rostova scored 94 intent score based on enterprise tier & attendance",
      time: "14m ago",
      type: "ai",
    },
    {
      id: 3,
      title: "Capacity Alert (85%)",
      desc: "Business Innovation Forum 2026 has reached 85% capacity (128/150)",
      time: "1h ago",
      type: "alert",
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/registrations?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleResetData = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to seed:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="h-16 flex-shrink-0 bg-[#101722] border-b border-[#263345] px-6 flex items-center justify-between z-20">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, contacts, companies, registrations... (Press Enter)"
            className="w-full bg-[#090D14] border border-[#263345] rounded-lg pl-9 pr-12 py-2 text-xs text-[#EAF0F8] placeholder-[#91A0B5]/70 focus:outline-none focus:border-[#3987F5] transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#192435] text-[#91A0B5] border border-[#263345]">
            ⌘K
          </kbd>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-xs font-medium text-[#EAF0F8] transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-[#3987F5]" />
            <span>{selectedWorkspace}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#91A0B5]" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#131C29] border border-[#263345] rounded-xl shadow-elevated py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-[#91A0B5] uppercase tracking-wider">
                Select Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.name}
                  onClick={() => {
                    setSelectedWorkspace(ws.name);
                    setShowWorkspaceMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-[#192435] transition-colors",
                    ws.name === selectedWorkspace ? "text-[#3987F5] font-semibold" : "text-[#EAF0F8]"
                  )}
                >
                  <span>{ws.name}</span>
                  <span className="text-[10px] text-[#91A0B5]">{ws.region}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Copilot Quick Summon */}
        <button
          onClick={onToggleAIDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#3987F5]/10 to-purple-500/10 border border-[#3987F5]/30 hover:border-[#3987F5] text-xs font-semibold text-[#3987F5] hover:text-white transition-all shadow-sm"
          title="Open AI Intelligence Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#3987F5]" />
          <span>Ask Copilot</span>
        </button>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-xs font-semibold text-white transition-all shadow-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-48 bg-[#131C29] border border-[#263345] rounded-xl shadow-elevated py-1.5 z-50">
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  if (onOpenCreateEvent) onOpenCreateEvent();
                  else router.push("/events?create=true");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EAF0F8] hover:bg-[#192435] transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#3987F5]" />
                <span>Create Event</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  router.push("/registrations?create=true");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EAF0F8] hover:bg-[#192435] transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#35B982]" />
                <span>Register Attendee</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  if (onOpenCreateTask) onOpenCreateTask();
                  else router.push("/tasks?create=true");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EAF0F8] hover:bg-[#192435] transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#E8B45E]" />
                <span>Create Task</span>
              </button>
            </div>
          )}
        </div>

        {/* Reset / Sync Demo Data */}
        <button
          onClick={handleResetData}
          disabled={isSeeding}
          className="p-2 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-[#91A0B5] hover:text-[#EAF0F8] transition-colors relative"
          title="Reset Demo Data"
        >
          <RefreshCw className={cn("w-4 h-4", isSeeding && "animate-spin text-[#3987F5]")} />
          {seedSuccess && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#35B982]" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-[#91A0B5] hover:text-[#EAF0F8] transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3987F5]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#131C29] border border-[#263345] rounded-xl shadow-elevated py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#263345]">
                <span className="text-xs font-semibold text-[#EAF0F8]">Notifications</span>
                <span className="text-[10px] text-[#3987F5] font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-[#263345]/50 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-[#192435] transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#EAF0F8]">{n.title}</p>
                      <span className="text-[10px] text-[#91A0B5]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#91A0B5] mt-1 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
