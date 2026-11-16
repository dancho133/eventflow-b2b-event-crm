"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Send,
  Copy,
  Check,
  Bot,
  Zap,
  FileText,
  UserCheck,
  Mail,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AITaskType } from "@/types";

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: AITaskType;
  context?: {
    eventId?: string;
    eventTitle?: string;
    contactId?: string;
    contactName?: string;
    notes?: string;
  };
}

export function AIDrawer({
  isOpen,
  onClose,
  defaultType = "operational_query",
  context,
}: AIDrawerProps) {
  const [taskType, setTaskType] = useState<AITaskType>(defaultType);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>("gemini-1.5-pro");

  if (!isOpen) return null;

  const modeTabs = [
    { type: "operational_query" as AITaskType, label: "Q&A Intelligence", icon: HelpCircle },
    { type: "followup_draft" as AITaskType, label: "Follow-up Drafter", icon: Mail },
    { type: "lead_classification" as AITaskType, label: "Lead Qualifier", icon: UserCheck },
    { type: "event_brief" as AITaskType, label: "Event Brief", icon: FileText },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && taskType === "operational_query") return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: taskType,
          prompt: prompt || (taskType === "event_brief" ? `Generate brief for ${context?.eventTitle || "upcoming enterprise summit"}` : undefined),
          eventId: context?.eventId,
          contactId: context?.contactId,
          context: {
            ...context,
            userNote: prompt,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.result || data.response || "No response received.");
        if (data.model) setModelUsed(data.model);
      } else {
        setResponse(`Error: ${data.error || "Failed to generate AI response"}`);
      }
    } catch (err: any) {
      setResponse(`Request error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-xl bg-[#101722] border-l border-[#263345] shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#263345] flex items-center justify-between bg-[#131C29]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3987F5]/10 border border-[#3987F5]/30 text-[#3987F5]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#EAF0F8]">EVENTFLOW AI Copilot</h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  {modelUsed}
                </span>
              </div>
              <p className="text-[11px] text-[#91A0B5]">
                Context-aware intelligence & automated workflows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#91A0B5] hover:text-[#EAF0F8] hover:bg-[#192435] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Context Banner */}
        {context && (context.eventTitle || context.contactName) && (
          <div className="px-6 py-2 bg-[#090D14]/80 border-b border-[#263345] flex items-center gap-2 text-xs text-[#91A0B5]">
            <Zap className="w-3.5 h-3.5 text-[#3987F5]" />
            <span>Active context:</span>
            {context.eventTitle && (
              <span className="font-medium text-[#EAF0F8] bg-[#192435] px-2 py-0.5 rounded border border-[#263345]">
                Event: {context.eventTitle}
              </span>
            )}
            {context.contactName && (
              <span className="font-medium text-[#EAF0F8] bg-[#192435] px-2 py-0.5 rounded border border-[#263345]">
                Contact: {context.contactName}
              </span>
            )}
          </div>
        )}

        {/* Mode Selector */}
        <div className="px-6 py-3 border-b border-[#263345] bg-[#101722] flex gap-1.5 overflow-x-auto">
          {modeTabs.map((tab) => {
            const Icon = tab.icon;
            const active = taskType === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => {
                  setTaskType(tab.type);
                  setResponse(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-[#3987F5] text-white shadow-sm"
                    : "bg-[#131C29] text-[#91A0B5] hover:text-[#EAF0F8] border border-[#263345]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat / Results Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!response && !isLoading && (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#131C29] border border-[#263345] flex items-center justify-center mx-auto text-[#3987F5]">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#EAF0F8]">
                  How can Copilot assist you today?
                </h4>
                <p className="text-xs text-[#91A0B5] max-w-sm mx-auto mt-1">
                  Ask questions about pipeline attribution, draft hyper-personalized follow-up emails, or analyze attendee qualification.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="pt-4 flex flex-col gap-2 max-w-md mx-auto text-left">
                <button
                  onClick={() => {
                    setPrompt("Which events contributed the most qualified pipeline this quarter?");
                  }}
                  className="p-2.5 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-xs text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
                >
                  💡 "Which events contributed the most qualified pipeline this quarter?"
                </button>
                <button
                  onClick={() => {
                    setPrompt("Draft a personalized post-event follow-up email focusing on ROI and platform trial.");
                  }}
                  className="p-2.5 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-xs text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
                >
                  ✉️ "Draft a personalized post-event follow-up email focusing on ROI"
                </button>
                <button
                  onClick={() => {
                    setPrompt("Recommend lead scoring adjustments based on attendee drop-off rate.");
                  }}
                  className="p-2.5 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-xs text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
                >
                  🎯 "Recommend lead scoring adjustments based on attendee drop-off rate"
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-[#3987F5] animate-spin" />
              <p className="text-xs text-[#91A0B5]">
                Synthesizing event data & generating enterprise response...
              </p>
            </div>
          )}

          {response && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#91A0B5] uppercase tracking-wider">
                  Generated Output
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#192435] border border-[#263345] text-xs text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#35B982]" />
                      <span className="text-[#35B982]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#131C29] border border-[#263345] text-xs text-[#EAF0F8] leading-relaxed whitespace-pre-wrap font-sans">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#263345] bg-[#131C29]">
          <form onSubmit={handleGenerate} className="flex gap-2">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                taskType === "followup_draft"
                  ? "Specify tone, key value propositions or attendee context..."
                  : taskType === "event_brief"
                  ? "Describe theme, target audience, budget, or key milestones..."
                  : "Type instruction or prompt for EVENTFLOW AI..."
              }
              className="flex-1 bg-[#090D14] border border-[#263345] rounded-lg p-2.5 text-xs text-[#EAF0F8] placeholder-[#91A0B5]/70 focus:outline-none focus:border-[#3987F5] resize-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 bg-[#3987F5] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center transition-colors shadow-glow"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
