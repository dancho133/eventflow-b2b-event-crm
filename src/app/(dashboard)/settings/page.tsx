"use client";

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Key,
  Users,
  Layers,
  Sparkles,
  Check,
  RefreshCw,
  Globe,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "ai" | "notifications" | "data">("workspace");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">Workspace Settings</h1>
        <p className="text-xs text-[#91A0B5] mt-1">
          Configure enterprise workspace parameters, AI model integrations, and audit policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#263345] gap-2">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "workspace"
              ? "border-[#3987F5] text-[#3987F5]"
              : "border-transparent text-[#91A0B5] hover:text-[#EAF0F8]"
          }`}
        >
          General & Organization
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "ai"
              ? "border-[#3987F5] text-[#3987F5]"
              : "border-transparent text-[#91A0B5] hover:text-[#EAF0F8]"
          }`}
        >
          AI Copilot Engine
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "notifications"
              ? "border-[#3987F5] text-[#3987F5]"
              : "border-transparent text-[#91A0B5] hover:text-[#EAF0F8]"
          }`}
        >
          Alerts & Webhooks
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "data"
              ? "border-[#3987F5] text-[#3987F5]"
              : "border-transparent text-[#91A0B5] hover:text-[#EAF0F8]"
          }`}
        >
          Data & Database
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "workspace" && (
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-semibold text-[#EAF0F8]">Organization Profile</h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#91A0B5] font-semibold mb-1">Organization Name</label>
              <input
                type="text"
                defaultValue="Acme Global Enterprise"
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>
            <div>
              <label className="block text-[#91A0B5] font-semibold mb-1">Custom Domain</label>
              <input
                type="text"
                defaultValue="events.acmeglobal.com"
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              />
            </div>
            <div>
              <label className="block text-[#91A0B5] font-semibold mb-1">Primary Currency</label>
              <select className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#91A0B5] font-semibold mb-1">Default Timezone</label>
              <select className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]">
                <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
                <option value="America/New_York">America/New York (EST/EDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-semibold text-[#EAF0F8]">AI Copilot Configuration</h3>
          <p className="text-xs text-[#91A0B5]">
            Manage LLM model orchestration, fallback modes, and prompt guardrails.
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#101722] border border-[#263345]">
              <div>
                <p className="font-semibold text-[#EAF0F8]">Primary Model</p>
                <p className="text-[11px] text-[#91A0B5]">Google Gemini 1.5 Pro / Flash</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#35B982]/10 text-[#35B982] border border-[#35B982]/30">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#101722] border border-[#263345]">
              <div>
                <p className="font-semibold text-[#EAF0F8]">Autonomous Fallback Engine</p>
                <p className="text-[11px] text-[#91A0B5]">
                  High-fidelity deterministic intelligence fallback if API quota or offline
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3987F5]/10 text-[#3987F5] border border-[#3987F5]/30">
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-semibold text-[#EAF0F8]">Alert Triggers</h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded bg-[#090D14] border-[#263345]" />
              <span className="text-[#EAF0F8]">Capacity warning when event reaches 85% occupancy</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded bg-[#090D14] border-[#263345]" />
              <span className="text-[#EAF0F8]">Instant alert on VIP or C-level registration</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded bg-[#090D14] border-[#263345]" />
              <span className="text-[#EAF0F8]">Automated post-event follow-up draft notification</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === "data" && (
        <div className="bg-[#131C29] border border-[#263345] rounded-xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-semibold text-[#EAF0F8]">Database & Storage</h3>
          <p className="text-xs text-[#91A0B5]">SQLite Prisma local engine active with ACID guarantees.</p>

          <div className="p-4 rounded-lg bg-[#101722] border border-[#263345] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#EAF0F8]">Reset & Re-seed Demo Environment</p>
              <p className="text-[11px] text-[#91A0B5]">
                Rebuild database with 6 B2B events, 142 registrations, and CRM contacts
              </p>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/seed", { method: "POST" });
                alert("Database re-seeded successfully!");
              }}
              className="px-3 py-1.5 rounded-lg bg-[#192435] text-[#3987F5] border border-[#3987F5]/30 hover:bg-[#3987F5] hover:text-white text-xs font-semibold transition-all"
            >
              Run Seed
            </button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs text-[#35B982] flex items-center gap-1 font-semibold">
            <Check className="w-4 h-4" /> Changes saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-white text-xs font-semibold shadow-glow transition-all"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
