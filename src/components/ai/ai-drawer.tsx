"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Target,
  PlusCircle,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AITaskType } from "@/types";
import { CreateEventModal } from "@/components/CreateEventModal";

export interface AIDrawerProps {
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
  const [structuredData, setStructuredData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>("gemini-1.5-pro");
  const [isFallback, setIsFallback] = useState(true);

  // Follow-up draft inline editing & task creation
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskCreatedSuccess, setTaskCreatedSuccess] = useState<string | null>(null);

  // Event Brief -> Create Event modal
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventDraftData, setEventDraftData] = useState<any>(null);
  const [eventCreatedSuccess, setEventCreatedSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (defaultType) {
      setTaskType(defaultType);
    }
  }, [defaultType]);

  useEffect(() => {
    // Check key status
    fetch("/api/ai")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setIsFallback(Boolean(d.isFallback));
          if (!d.hasKey) {
            setModelUsed("EventFlow Heuristic AI Engine (Rule-Based Fallback)");
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const modeTabs = [
    { type: "operational_query" as AITaskType, label: "Q&A Intelligence", icon: HelpCircle },
    { type: "segment_suggestions" as AITaskType, label: "Segment Suggestions", icon: Target },
    { type: "followup_draft" as AITaskType, label: "Follow-up Drafter", icon: Mail },
    { type: "lead_classification" as AITaskType, label: "Lead Qualifier", icon: UserCheck },
    { type: "event_brief" as AITaskType, label: "Event Brief", icon: FileText },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && taskType === "operational_query") return;

    setIsLoading(true);
    setResponse(null);
    setStructuredData(null);
    setTaskCreatedSuccess(null);
    setEventCreatedSuccess(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: taskType,
          prompt:
            prompt ||
            (taskType === "event_brief"
              ? `Generate executive brief for ${context?.eventTitle || "upcoming enterprise summit"}`
              : taskType === "segment_suggestions"
              ? `Analyze high-value B2B segments for ${context?.eventTitle || "our event"}`
              : undefined),
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
        setStructuredData(data.structuredData || null);
        if (data.model) setModelUsed(data.model);
        if (typeof data.isFallback === "boolean") setIsFallback(data.isFallback);

        // Pre-fill editable follow-up fields
        if (taskType === "followup_draft") {
          if (data.structuredData?.subject) {
            setEditedSubject(data.structuredData.subject);
          } else {
            const subjMatch = (data.result || "").match(/Subject:\s*([^\n]+)/i);
            setEditedSubject(subjMatch ? subjMatch[1].trim() : `Follow-up: ${context?.eventTitle || "Executive Meeting"}`);
          }

          if (data.structuredData?.body) {
            setEditedBody(data.structuredData.body);
          } else {
            const cleanBody = (data.result || "")
              .replace(/Subject:[^\n]+\n*/i, "")
              .replace(/---[\s\S]*$/, "")
              .trim();
            setEditedBody(cleanBody);
          }
        }

        // Prepare event draft if brief
        if (taskType === "event_brief" && data.structuredData?.eventDraft) {
          setEventDraftData(data.structuredData.eventDraft);
        }
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
    const textToCopy =
      taskType === "followup_draft" && editedBody
        ? `Subject: ${editedSubject}\n\n${editedBody}`
        : response;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1-Click "Create Event from this Brief" action
  const handleOpenCreateEventFromBrief = () => {
    let draft = structuredData?.eventDraft;
    if (!draft) {
      draft = {
        title: context?.eventTitle || prompt || "Executive B2B Technology Summit 2026",
        description: response || "Generated from AI Event Brief.",
        shortDescription: "Strategic corporate convening driving pipeline acceleration.",
        eventType: "Conference",
        capacity: 150,
        budget: 35000,
        expectedRevenue: 120000,
        tags: ["AI", "Enterprise", "B2B"],
      };
    }
    setEventDraftData(draft);
    setIsCreateEventOpen(true);
  };

  // 1-Click "Create Follow-up Task from Draft" action
  const handleCreateFollowupTask = async () => {
    if (!editedBody.trim()) return;
    setIsCreatingTask(true);
    setTaskCreatedSuccess(null);

    const taskTitle = editedSubject
      ? `Follow-up: ${context?.contactName || "Contact"} — ${editedSubject.replace(/^Subject:\s*/i, "")}`
      : `Follow-up Email Review: ${context?.contactName || "Contact"}`;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: `EMAIL DRAFT FOR HUMAN REVIEW:\n\nSubject: ${editedSubject}\n\n${editedBody}\n\n---\nCreated via EventFlow AI Copilot. Review and approve before sending.`,
          contactId: context?.contactId || undefined,
          eventId: context?.eventId || undefined,
          priority: "Medium",
          status: "Pending",
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTaskCreatedSuccess(
          `Follow-up task created in Pending status for human review.`
        );
      } else {
        alert(`Failed to create task: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Error creating task: ${err.message}`);
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-[#EAF0F8]">EVENTFLOW AI Copilot</h3>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      isFallback
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                    }`}
                  >
                    {isFallback ? "Deterministic Heuristic Engine" : modelUsed}
                  </span>
                </div>
                <p className="text-[11px] text-[#91A0B5]">
                  Context-aware intelligence & human-approved workflows
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
            <div className="px-6 py-2 bg-[#090D14]/80 border-b border-[#263345] flex items-center gap-2 text-xs text-[#91A0B5] flex-wrap">
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
                    setStructuredData(null);
                    setTaskCreatedSuccess(null);
                    setEventCreatedSuccess(null);
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
            {/* Success Notifications */}
            {taskCreatedSuccess && (
              <div className="p-3 rounded-lg bg-[#35B982]/10 border border-[#35B982]/30 text-xs text-[#35B982] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{taskCreatedSuccess}</span>
              </div>
            )}

            {eventCreatedSuccess && (
              <div className="p-3 rounded-lg bg-[#35B982]/10 border border-[#35B982]/30 text-xs text-[#35B982] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{eventCreatedSuccess}</span>
              </div>
            )}

            {!response && !isLoading && (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#131C29] border border-[#263345] flex items-center justify-center mx-auto text-[#3987F5]">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#EAF0F8]">
                    How can Copilot assist you?
                  </h4>
                  <p className="text-xs text-[#91A0B5] max-w-sm mx-auto mt-1">
                    Ask questions about pipeline attribution, draft post-event follow-up emails, or analyze B2B audience segments.
                  </p>
                </div>

                {/* Sample Prompts */}
                <div className="pt-3 flex flex-col gap-2 max-w-md mx-auto text-left">
                  <button
                    onClick={() => {
                      setTaskType("segment_suggestions");
                      setPrompt("Suggest high-value B2B segments with business rationales for this event.");
                    }}
                    className="p-2.5 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-xs text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
                  >
                    🎯 &ldquo;Suggest high-value B2B segments with business rationales&rdquo;
                  </button>
                  <button
                    onClick={() => {
                      setTaskType("followup_draft");
                      setPrompt("Draft a personalized post-event follow-up email focusing on ROI and architecture.");
                    }}
                    className="p-2.5 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-xs text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
                  >
                    ✉️ &ldquo;Draft a personalized post-event follow-up email focusing on ROI&rdquo;
                  </button>
                  <button
                    onClick={() => {
                      setTaskType("event_brief");
                      setPrompt("Create an executive event brief for 200 CTOs with $35k budget.");
                    }}
                    className="p-2.5 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/40 text-xs text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
                  >
                    📋 &ldquo;Generate an executive event brief with structured draft&rdquo;
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 text-[#3987F5] animate-spin" />
                <p className="text-xs text-[#91A0B5]">
                  Synthesizing event data & executing enterprise reasoning pipeline...
                </p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
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

                {/* Event Brief 1-click Create Event Action */}
                {taskType === "event_brief" && (
                  <div className="p-3.5 rounded-xl bg-[#192435] border border-[#3987F5]/40 flex items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-[#EAF0F8]">Structured Event Draft Ready</h5>
                      <p className="text-[11px] text-[#91A0B5]">Open event creation workflow pre-filled from this brief.</p>
                    </div>
                    <button
                      onClick={handleOpenCreateEventFromBrief}
                      className="px-3 py-1.5 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Create Event</span>
                    </button>
                  </div>
                )}

                {/* Follow-up Draft Inline Review & Task Creation */}
                {taskType === "followup_draft" && (
                  <div className="p-4 rounded-xl bg-[#131C29] border border-[#263345] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#EAF0F8] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#3987F5]" />
                        Inline Review & Task Creation
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                        Review Stage
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#91A0B5] mb-1">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#91A0B5] mb-1">
                        Email Body (Editable)
                      </label>
                      <textarea
                        rows={8}
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        className="w-full bg-[#090D14] border border-[#263345] rounded-lg p-2.5 text-xs text-[#EAF0F8] leading-relaxed focus:outline-none focus:border-[#3987F5] font-sans"
                      />
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#263345]">
                      <p className="text-[10px] text-[#91A0B5] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#35B982]" />
                        <span>No autonomous sending. Creates pending review task.</span>
                      </p>

                      <button
                        onClick={handleCreateFollowupTask}
                        disabled={isCreatingTask || !editedBody.trim()}
                        className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-[#35B982] hover:bg-[#2EA472] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        {isCreatingTask ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Create Follow-up Task from Draft</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Segment Suggestions Visual Cards */}
                {taskType === "segment_suggestions" && structuredData?.segments && (
                  <div className="space-y-2.5">
                    {structuredData.segments.map((seg: any) => (
                      <div
                        key={seg.id}
                        className="p-3 rounded-lg bg-[#131C29] border border-[#263345] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-[#EAF0F8]">{seg.name}</h5>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#192435] text-[#3987F5] border border-[#263345]">
                            {seg.contactCount} contacts
                          </span>
                        </div>
                        <p className="text-[11px] text-[#91A0B5]">{seg.rationale}</p>
                        <div className="text-[11px] text-[#35B982]">
                          <strong>Playbook:</strong> {seg.recommendedAction}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Full formatted output */}
                {taskType !== "followup_draft" && (
                  <div className="p-4 rounded-xl bg-[#131C29] border border-[#263345] text-xs text-[#EAF0F8] leading-relaxed whitespace-pre-wrap font-sans">
                    {response}
                  </div>
                )}
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
                    : taskType === "segment_suggestions"
                    ? "Optional custom segmentation criteria or attendee focus..."
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

      {/* Pre-filled Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        initialData={eventDraftData}
        onSuccess={() => {
          setIsCreateEventOpen(false);
          setEventCreatedSuccess(
            `Event "${eventDraftData?.title || "New Event"}" successfully created from AI Brief!`
          );
        }}
      />
    </>
  );
}
