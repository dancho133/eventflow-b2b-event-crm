"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { AITaskType, Event, Contact } from "@/types";

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<AITaskType>("event_brief");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [model, setModel] = useState<string>("gemini-1.5-pro");
  const [copied, setCopied] = useState(false);

  // Selector context
  const [events, setEvents] = useState<Event[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [tone, setTone] = useState("Executive & Consultative");

  useEffect(() => {
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
        if (data.model) setModel(data.model);
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
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools = [
    {
      type: "event_brief" as AITaskType,
      title: "Event Brief Assistant",
      desc: "Generate comprehensive B2B conference scopes, agendas, and target personas.",
      icon: FileText,
      placeholder: "Specify event theme, goals, budget, or target audience (e.g. Next-Gen Enterprise AI Architecture Summit for 200 CTOs)...",
    },
    {
      type: "meeting_notes" as AITaskType,
      title: "Meeting Notes Assistant",
      desc: "Synthesize unstructured notes into executive summaries and action items.",
      icon: NotebookText,
      placeholder: "Paste unstructured notes, discussion bullets, or audio transcript excerpts from your meeting...",
    },
    {
      type: "followup_draft" as AITaskType,
      title: "Follow-up Drafter",
      desc: "Produce personalized, high-converting post-event outreach emails.",
      icon: Mail,
      placeholder: "Add any specific talking points, deal stage context, or requested deliverables...",
    },
    {
      type: "lead_classification" as AITaskType,
      title: "Lead Classifier & Qualifier",
      desc: "Score attendee intent, purchase readiness, and sales routing.",
      icon: UserCheck,
      placeholder: "Provide context on attendee engagement, company tier, or specific questions asked during the session...",
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EAF0F8]">EVENTFLOW AI Copilot Suite</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              {model}
            </span>
          </div>
          <p className="text-xs text-[#91A0B5] mt-1">
            Autonomous event intelligence, hyper-personalized communications, and predictive lead qualification.
          </p>
        </div>
      </div>

      {/* Assistant Tool Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tools.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.type;

          return (
            <button
              key={t.type}
              onClick={() => {
                setActiveTab(t.type);
                setResponse(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                active
                  ? "bg-[#192435] border-[#3987F5] shadow-glow"
                  : "bg-[#131C29] border-[#263345] hover:border-[#3987F5]/40"
              }`}
            >
              <div
                className={`p-2 rounded-lg w-fit mb-2.5 ${
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
            <h3 className="font-bold text-sm text-[#EAF0F8]">{currentTool.title}</h3>
            <p className="text-xs text-[#91A0B5] mt-0.5">{currentTool.desc}</p>
          </div>

          {/* Context Selectors */}
          <div className="space-y-3 pt-2 border-t border-[#263345]">
            <div>
              <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                Related Event (Optional)
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
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

            {(activeTab === "followup_draft" || activeTab === "lead_classification") && (
              <div>
                <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                  Target Contact
                </label>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full bg-[#090D14] border border-[#263345] rounded-lg px-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5]"
                >
                  <option value="">Select Target Contact</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.company?.name || "Direct"})
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
                Instruction / Details
              </label>
              <textarea
                rows={5}
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
        <div className="lg:col-span-7 bg-[#131C29] border border-[#263345] rounded-xl p-5 shadow-card min-h-[460px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#263345]">
              <span className="text-xs font-bold text-[#91A0B5] uppercase tracking-wider">
                Copilot Output
              </span>

              {response && (
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
                      <span>Copy Result</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                  <Loader2 className="w-8 h-8 text-[#3987F5] animate-spin" />
                  <p className="text-xs text-[#91A0B5]">
                    Analyzing event context and executing reasoning pipeline...
                  </p>
                </div>
              ) : response ? (
                <div className="p-4 rounded-xl bg-[#101722] border border-[#263345] text-xs text-[#EAF0F8] leading-relaxed whitespace-pre-wrap font-sans">
                  {response}
                </div>
              ) : (
                <div className="text-center py-24 text-xs text-[#91A0B5] space-y-2">
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
            <span>Zero Data Leakage Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
