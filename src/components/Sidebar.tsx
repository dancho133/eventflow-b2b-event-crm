"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Contact2,
  Kanban,
  CheckSquare,
  BarChart3,
  Sparkles,
  Settings,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Registrations", href: "/registrations", icon: UserCheck },
  { label: "CRM", href: "/crm", icon: Contact2 },
  { label: "Pipeline", href: "/crm/pipeline", icon: Kanban },
  { label: "Tasks & Follow-ups", href: "/tasks", icon: CheckSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "AI Copilot", href: "/ai", icon: Sparkles, badge: "PRO", badgeColor: "bg-[#3987F5]/20 text-[#3987F5] border-[#3987F5]/40" },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen bg-[#101722] border-r border-[#263345] select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#263345]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3987F5] to-[#2563EB] flex items-center justify-center shadow-lg shadow-[#3987F5]/20 transition-transform group-hover:scale-105">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-[#EAF0F8]">
                EVENTFLOW
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3987F5]/10 text-[#3987F5] border border-[#3987F5]/30">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-[#91A0B5] font-medium leading-none">
              Enterprise Lifecycle & CRM
            </p>
          </div>
        </Link>
      </div>

      {/* Workspace Indicator */}
      <div className="px-4 py-3 border-b border-[#263345]/60 bg-[#090D14]/40">
        <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-[#131C29] border border-[#263345]">
          <div className="flex items-center gap-2 truncate">
            <Layers className="w-3.5 h-3.5 text-[#3987F5] flex-shrink-0" />
            <span className="font-medium text-[#EAF0F8] truncate">Acme Global Enterprise</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#35B982] flex-shrink-0" title="Connected" />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-[#91A0B5]/70 uppercase">
          Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-[#192435] text-[#EAF0F8] border border-[#3987F5]/40 shadow-sm"
                  : "text-[#91A0B5] hover:text-[#EAF0F8] hover:bg-[#131C29] border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    active
                      ? "text-[#3987F5]"
                      : "text-[#91A0B5] group-hover:text-[#EAF0F8]"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.2 rounded border",
                    item.badgeColor || "bg-[#192435] text-[#91A0B5] border-[#263345]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Live System Stats Footer */}
      <div className="p-4 border-t border-[#263345] bg-[#090D14]/60">
        <div className="rounded-lg p-3 bg-[#131C29] border border-[#263345] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#91A0B5]">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#35B982]" />
              Event Engine
            </span>
            <span className="text-[#35B982] font-semibold text-[11px]">Active</span>
          </div>
          <div className="w-full bg-[#192435] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#35B982] h-full w-[94%]" />
          </div>
          <div className="flex justify-between text-[10px] text-[#91A0B5]">
            <span>DB Synced</span>
            <span>99.98% SLA</span>
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3987F5] to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              SJ
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-[#EAF0F8]">Sarah Jenkins</p>
              <p className="text-[10px] text-[#91A0B5]">VP Event Marketing</p>
            </div>
          </div>
          <Link
            href="/settings"
            className="p-1.5 rounded-md text-[#91A0B5] hover:text-[#EAF0F8] hover:bg-[#192435] transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
