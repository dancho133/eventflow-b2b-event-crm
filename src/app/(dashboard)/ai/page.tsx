"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  Mail,
  UserCheck,
  HelpCircle,
  NotebookText,
  Copy,
  Check,
  Send,
  Loader2,
  Calendar,
  Building,
  User,
  Zap,
  TrendingUp,
  Users,
  Target,
  Key,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Layers,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AITaskType, Event, Contact } from "@/types";
import { CreateEventModal } from "@/components/CreateEventModal";

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<AITaskType>("event_brief");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<any | null>(null);
  const [model, setModel] = useState<string>("gemini-1.5-pro");
  const [isFallback, setIsFallback] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [keyProvider, setKeyProvider] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [copied, setCopied] = useState(false);

  // Selector context
  const [events, setEvents] = useState<Event[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [tone, setTone] = useState("Executive & Consultative");

  // Event Brief -> Create Event workflow
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [eventDraftData, setEventDraftData] = useState<any>(null);
  const [eventCreatedMessage, setEventCreatedMessage] = useState<string | null>(null);

  // Follow-up Draft -> Inline Review & Task Creation
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskCreatedSuccess, setTaskCreatedSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check AI status
    fetch("/api/ai")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setHasApiKey(Boolean(d.hasKey));
          setIsFallback(Boolean(d.isFallback));
          if (d.provider) setKeyProvider(d.provider);
          if (!d.hasKey) {
            setModel("EventFlow Heuristic AI Engine (Rule-Based Fallback)");
          }
        }
      })
      .catch(() => {});

    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => setEvents(Array.isArray(d) ? d : d.events || []))
      .catch(() => {});

    fetch("/api/contacts")
      .then((r) => r.json())
      .then((d) => setContacts(Array.isArray(d) ? d : d.contacts || []))
      .catch(() => {});
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResponse(null);
    setStructuredData(null);
    setTaskCreatedSuccess(null);
    setEventCreatedMessage(null);

    const eventObj = events.find((ev) => ev.id === selectedEventId);
    const contactObj = contacts.find((c) => c.id === selectedContactId);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          prompt,
          eventId: selectedEventId || undefined,
          contactId: selectedContactId || undefined,
          context: {
            eventTitle: eventObj?.title,
            contactName: contactObj ? `${contactObj.firstName} ${contactObj.lastName}` : undefined,
            contactTitle: contactObj?.title,
            companyName: contactObj?.company?.name,
            tone,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.result || data.response || "No response received");
        setStructuredData(data.structuredData || null);
        if (data.model) setModel(data.model);
        if (typeof data.isFallback === "boolean") setIsFallback(data.isFallback);

        // Pre-fill editable follow-up fields
        if (activeTab === "followup_draft") {
          if (data.structuredData?.subject) {
            setEditedSubject(data.structuredData.subject);
          } else {
            const subjMatch = (data.result || "").match(/Subject:\s*([^\n]+)/i);
            setEditedSubject(subjMatch ? subjMatch[1].trim() : `Follow-up: ${eventObj?.title || "Executive Briefing"}`);
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
        if (activeTab === "event_brief" && data.structuredData?.eventDraft) {
          setEventDraftData(data.structuredData.eventDraft);
        }
      } else {
        setResponse(`Error: ${data.error || "Failed to generate AI response"}`);
      }
    } catch (err: any) {
      setResponse(`Request error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy =
      activeTab === "followup_draft" && editedBody
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
      const eventObj = events.find((ev) => ev.id === selectedEventId);
      draft = {
        title: eventObj?.title || prompt || "Executive B2B Technology Summit 2026",
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
    setIsCreateEventModalOpen(true);
  };

  // 1-Click "Create Follow-up Task from Draft" action
  const handleCreateFollowupTask = async () => {
    if (!editedBody.trim()) return;
    setIsCreatingTask(true);
    setTaskCreatedSuccess(null);

    const contactObj = contacts.find((c) => c.id === selectedContactId);
    const eventObj = events.find((ev) => ev.id === selectedEventId);
    const contactName = contactObj ? `${contactObj.firstName} ${contactObj.lastName}` : "Attendee";
    const taskTitle = editedSubject
      ? `Follow-up: ${contactName} — ${editedSubject.replace(/^Subject:\s*/i, "")}`
      : `Follow-up Email Review: ${contactName}`;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: `EMAIL DRAFT FOR HUMAN REVIEW:\n\nSubject: ${editedSubject}\n\n${editedBody}\n\n---\nCreated via EventFlow AI Drafter. Review and approve before sending.`,
          contactId: selectedContactId || undefined,
          eventId: selectedEventId || undefined,
          priority: "Medium",
          status: "Pending",
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTaskCreatedSuccess(
          `Follow-up task "${taskTitle}" created successfully in Pending status for human review.`
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

  const tools = [
    {
      type: "event_brief" as AITaskType,
      title: "Event Brief Assistant",
      desc: "Generate comprehensive B2B conference scopes, agendas, and target personas.",
      icon: FileText,
      placeholder:
        "Specify event theme, goals, budget, or target audience (e.g. Next-Gen Enterprise AI Architecture Summit for 200 CTOs)...",
    },
    {
      type: "segment_suggestions" as AITaskType,
      title: "B2B Segment Suggestions",
      desc: "Analyze event attendees & contacts into high-value B2B segments with strategic rationales.",
      icon: Target,
      placeholder:
        "Optional: Specify segmentation priority (e.g. Focus on enterprise accounts with >$100k pipeline or technical champions)...",
    },
    {
      type: "followup_draft" as AITaskType,
      title: "Follow-up Drafter",
      desc: "Produce personalized, high-converting post-event outreach emails for human review.",
      icon: Mail,
      placeholder: "Add any specific talking points, deal stage context, or requested deliverables...",
    },
    {
      type: "lead_classification" as AITaskType,
      title: "Lead Classifier & Qualifier",
      desc: "Score attendee intent, purchase readiness, and sales routing.",
      icon: UserCheck,
      placeholder:
        "Provide context on attendee engagement, company tier, or specific questions asked during the session...",
    },
    {
      type: "meeting_notes" as AITaskType,
      title: "Meeting Notes Assistant",
      desc: "Synthesize unstructured notes into executive summaries and action items.",
      icon: NotebookText,
      placeholder: "Paste unstructured notes, discussion bullets, or audio transcript excerpts from your meeting...",
    },
    {
      type: "operational_query" as AITaskType,
      title: "Operational Intelligence Q&A",
      desc: "Natural language analytical assistant across events and pipeline data.",
      icon: HelpCircle,
      placeholder: "Ask anything (e.g. Which acquisition channel drove the highest show-up rate this quarter?)...",
    },
  ];

  const currentTool = tools.find((t) => t.type === activeTab) || tools[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">EVENTFLOW AI Copilot Suite</h1>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                isFallback
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-purple-500/10 text-purple-400 border-purple-500/30"
              }`}
            >
              {model}
            </span>
          </div>
          <p className="text-xs text-[#91A0B5] mt-1">
            Enterprise event intelligence, deterministic fallback engines, and human-in-the-loop workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfigHelp((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131C29] border border-[#263345] hover:border-[#3987F5]/50 text-xs text-[#91A0B5] hover:text-[#EAF0F8] transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-[#3987F5]" />
            <span>AI Configuration</span>
            {showConfigHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* AI Key Configuration Info Banner */}
      {isFallback && (
        <div className="bg-[#131C29] border border-amber-500/30 rounded-xl p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#EAF0F8]">
                    Smart Heuristic Rule Engine Active (Deterministic Fallback)
                  </h4>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Zero External API Dependency
                  </span>
                </div>
                <p className="text-xs text-[#91A0B5] leading-relaxed">
                  No LLM API keys were detected in the environment. EventFlow is currently operating in robust,
                  deterministic rule-based fallback mode. All responses, briefs, lead scoring, and B2B segments are
                  synthesized directly from verified database records.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConfigHelp((v) => !v)}
              className="text-xs text-[#3987F5] hover:underline font-semibold shrink-0"
            >
              {showConfigHelp ? "Hide Instructions" : "Configure Live LLM Keys"}
            </button>
          </div>

          {showConfigHelp && (
            <div className="mt-3 pt-3 border-t border-[#263345] text-xs text-[#91A0B5] space-y-2 animate-in fade-in">
              <p className="font-semibold text-[#EAF0F8]">How to configure external AI model providers:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="p-3 bg-[#090D14] border border-[#263345] rounded-lg">
                  <span className="font-bold text-[#EAF0F8] block mb-1">1. OpenAI</span>
                  <code className="text-[11px] text-[#3987F5] block">OPENAI_API_KEY=sk-...</code>
                  <span className="text-[10px] text-[#91A0B5] block mt-1">Activates GPT-4o models</span>
                </div>
                <div className="p-3 bg-[#090D14] border border-[#263345] rounded-lg">
                  <span className="font-bold text-[#EAF0F8] block mb-1">2. Anthropic</span>
                  <code className="text-[11px] text-[#3987F5] block">ANTHROPIC_API_KEY=sk-ant-...</code>
                  <span className="text-[10px] text-[#91A0B5] block mt-1">Activates Claude 3.5 Sonnet</span>
                </div>
                <div className="p-3 bg-[#090D14] border border-[#263345] rounded-lg">
                  <span className="font-bold text-[#EAF0F8] block mb-1">3. Google Gemini</span>
                  <code className="text-[11px] text-[#3987F5] block">GEMINI_API_KEY=AIza...</code>
                  <span className="text-[10px] text-[#91A0B5] block mt-1">Activates Gemini 1.5 Pro</span>
                </div>
              </div>
              <p className="text-[11px] text-[#91A0B5]">
                Add any of the above variables to <code className="text-[#EAF0F8]">.env.local</code> in the project
                root and restart the server.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Assistant Tool Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tools.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.type;

          return (
            <button
              key={t.type}
              onClick={() => {
                setActiveTab(t.type);
                setResponse(null);
                setStructuredData(null);
                setTaskCreatedSuccess(null);
                setEventCreatedMessage(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                active
                  ? "bg-[#192435] border-[#3987F5] shadow-glow"
                  : "bg-[#131C29] border-[#263345] hover:border-[#3987F5]/40"
              }`}
            >
              <div
                className={`p-2 rounded-lg w-fit mb-2 ${
                  active ? "bg-[#3987F5] text-white" : "bg-[#101722] text-[#3987F5] border border-[#263345]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs text-[#EAF0F8] line-clamp-1">{t.title}</h3>
              <p className="text-[11px] text-[#91A0B5] mt-1 line-clamp-2">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Execution Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[#EAF0F8] flex items-center gap-2">
              <currentTool.icon className="w-4 h-4 text-[#3987F5]" />
              <span>{currentTool.title}</span>
            </h3>
            <p className="text-xs text-[#91A0B5] mt-0.5">{currentTool.desc}</p>
          </div>

          {/* Context Selectors */}
          <div className="space-y-3 pt-2 border-t border-[#263345]">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Target Event Context {activeTab === "segment_suggestions" ? "(Select for attendee analysis)" : "(Optional)"}
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
              >
                <option value="">
                  {activeTab === "segment_suggestions"
                    ? "All Workspace Contacts & Attendees"
                    : "None / General Scope"}
                </option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.registeredCount || 0} registered)
                  </option>
                ))}
              </select>
            </div>

            {(activeTab === "followup_draft" || activeTab === "lead_classification") && (
              <div>
                <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                  Target Contact *
                </label>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                >
                  <option value="">Select Target Contact</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.title || "No Title"} @ {c.company?.name || "Direct"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === "followup_draft" && (
              <div>
                <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                  Tone & Style
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                >
                  <option value="Executive & Consultative">Executive & Consultative</option>
                  <option value="Technical & Architecture-Focused">Technical & Architecture-Focused</option>
                  <option value="Direct Sales & Closing">Direct Sales & Closing</option>
                  <option value="Warm & Relationship Building">Warm & Relationship Building</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Instruction / Custom Guidance (Optional)
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={currentTool.placeholder}
                className="w-full bg-[#090D14] border border-[#263345] rounded-lg p-3 text-xs text-[#EAF0F8] placeholder-[#91A0B5]/70 focus:outline-none focus:border-[#3987F5]"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Intelligence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Output</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Panel (7 cols) */}
        <div className="lg:col-span-7 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card min-h-[500px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#263345]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#91A0B5] uppercase tracking-wider">
                  Copilot Intelligence Output
                </span>
                {structuredData?.totalContactsAnalyzed !== undefined && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#192435] border border-[#263345] text-[#3987F5] font-semibold">
                    {structuredData.totalContactsAnalyzed} verified contacts
                  </span>
                )}
              </div>

              {response && (
                <div className="flex items-center gap-2">
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
              )}
            </div>

            {/* Notification messages */}
            {eventCreatedMessage && (
              <div className="mt-3 p-3 rounded-lg bg-[#35B982]/10 border border-[#35B982]/30 text-xs text-[#35B982] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{eventCreatedMessage}</span>
                </div>
                <Link
                  href="/events"
                  className="font-semibold underline flex items-center gap-1 hover:text-white"
                >
                  View Events <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}

            {taskCreatedSuccess && (
              <div className="mt-3 p-3 rounded-lg bg-[#35B982]/10 border border-[#35B982]/30 text-xs text-[#35B982] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{taskCreatedSuccess}</span>
                </div>
                <Link
                  href="/crm/tasks"
                  className="font-semibold underline flex items-center gap-1 hover:text-white"
                >
                  View Tasks <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}

            <div className="mt-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-28 space-y-3">
                  <Loader2 className="w-8 h-8 text-[#3987F5] animate-spin" />
                  <p className="text-xs text-[#91A0B5]">
                    Analyzing event context, participant graphs, and executing reasoning pipeline...
                  </p>
                </div>
              ) : response ? (
                <div className="space-y-4">
                  {/* Action Bar for Event Brief */}
                  {activeTab === "event_brief" && (
                    <div className="p-3.5 rounded-xl bg-[#192435] border border-[#3987F5]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-[#EAF0F8] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#3987F5]" />
                          Structured Event Draft Ready
                        </h4>
                        <p className="text-[11px] text-[#91A0B5]">
                          Convert this AI-synthesized brief into a live event with capacity, budget, and scope pre-filled.
                        </p>
                      </div>
                      <button
                        onClick={handleOpenCreateEventFromBrief}
                        className="px-3.5 py-1.5 rounded-lg bg-[#3987F5] hover:bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow transition-all whitespace-nowrap"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Create Event from this Brief</span>
                      </button>
                    </div>
                  )}

                  {/* Enhanced Inline Review & Editing for Follow-up Draft */}
                  {activeTab === "followup_draft" && (
                    <div className="p-4 rounded-xl bg-[#101722] border border-[#263345] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#3987F5]" />
                          <h4 className="text-xs font-bold text-[#EAF0F8]">Inline Outreach Review & Editor</h4>
                        </div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Human Review Stage
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#91A0B5] mb-1">
                          Email Subject Line
                        </label>
                        <input
                          type="text"
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#91A0B5] mb-1">
                          Email Body (Directly Editable)
                        </label>
                        <textarea
                          rows={10}
                          value={editedBody}
                          onChange={(e) => setEditedBody(e.target.value)}
                          className="w-full bg-[#090D14] border border-[#263345] rounded-lg p-3 text-xs text-[#EAF0F8] leading-relaxed focus:outline-none focus:border-[#3987F5] font-sans"
                        />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#263345]">
                        <p className="text-[11px] text-[#91A0B5] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#35B982]" />
                          <span>No autonomous messaging: Saves as an actionable task for human review.</span>
                        </p>

                        <button
                          onClick={handleCreateFollowupTask}
                          disabled={isCreatingTask || !editedBody.trim()}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#35B982] hover:bg-[#2EA472] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                          {isCreatingTask ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving Task...</span>
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

                  {/* Enhanced Segment Suggestions Visual Cards */}
                  {activeTab === "segment_suggestions" && structuredData?.segments && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {structuredData.segments.map((seg: any) => (
                          <div
                            key={seg.id}
                            className="p-3.5 rounded-xl bg-[#101722] border border-[#263345] hover:border-[#3987F5]/40 transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-bold text-xs text-[#EAF0F8]">{seg.name}</h5>
                                <span className="text-[10px] text-[#3987F5] font-medium">{seg.category}</span>
                              </div>
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#192435] text-[#EAF0F8] border border-[#263345]">
                                {seg.contactCount} contacts
                              </span>
                            </div>

                            <p className="text-[11px] text-[#91A0B5] leading-normal">{seg.rationale}</p>

                            <div className="pt-2 border-t border-[#263345]/60 text-[11px]">
                              <span className="text-[#35B982] font-semibold block mb-0.5">Recommended Playbook:</span>
                              <span className="text-[#EAF0F8]">{seg.recommendedAction}</span>
                            </div>

                            {seg.contacts && seg.contacts.length > 0 && (
                              <div className="pt-1.5 flex flex-wrap gap-1">
                                {seg.contacts.slice(0, 3).map((c: any) => (
                                  <span
                                    key={c.id}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#192435] text-[#91A0B5] border border-[#263345]"
                                  >
                                    {c.name} ({c.company})
                                  </span>
                                ))}
                                {seg.contacts.length > 3 && (
                                  <span className="text-[10px] px-1 py-0.5 text-[#91A0B5]">
                                    +{seg.contacts.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw / Formatted Output Text (shown for all except when in followup review mode) */}
                  {activeTab !== "followup_draft" && (
                    <div className="p-4 rounded-xl bg-[#101722] border border-[#263345] text-xs text-[#EAF0F8] leading-relaxed whitespace-pre-wrap font-sans">
                      {response}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-28 text-xs text-[#91A0B5] space-y-2">
                  <Sparkles className="w-8 h-8 text-[#91A0B5] mx-auto opacity-40" />
                  <p className="font-semibold text-[#EAF0F8]">Ready for Input</p>
                  <p className="max-w-xs mx-auto">
                    Select your parameters or enter your prompt on the left to generate structured AI output.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#263345] flex items-center justify-between text-[11px] text-[#91A0B5]">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#35B982]" />
              Enterprise AI Guardrails Active
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3987F5]" />
              No Fake Participant Data | Zero Autonomous Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* Pre-filled Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        initialData={eventDraftData}
        onSuccess={() => {
          setIsCreateEventModalOpen(false);
          setEventCreatedMessage(
            `Event "${eventDraftData?.title || "New Event"}" successfully created from AI Brief!`
          );
          fetch("/api/events")
            .then((r) => r.json())
            .then((d) => setEvents(Array.isArray(d) ? d : d.events || []))
            .catch(() => {});
        }}
      />
    </div>
  );
}
