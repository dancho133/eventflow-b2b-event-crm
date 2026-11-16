"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  Zap,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Download,
  Share2,
  Building,
  Mail,
  User,
  Briefcase,
  Phone,
  Loader2,
} from "lucide-react";
import { TicketType, Event } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function PublicRegistrationPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    companyName: "",
    industry: "Enterprise Software",
    ticketType: "General" as TicketType,
  });

  useEffect(() => {
    if (slug) fetchEventBySlug();
  }, [slug]);

  const fetchEventBySlug = async () => {
    try {
      setLoading(true);
      // Fetch event by slug from API
      const res = await fetch(`/api/events?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        const found = Array.isArray(data) ? data.find((e: any) => e.slug === slug) : data.event || data;
        setEvent(found || null);
      }
    } catch (err) {
      console.error("Failed to fetch event by slug:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ...formData,
          utmSource: "Direct Public Portal",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("This email is already registered for this event. Please check your inbox for confirmation.");
        }
        throw new Error(json.error || "Failed to process registration.");
      }

      setSuccessData(json);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D14] text-[#EAF0F8] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#3987F5] animate-spin" />
          <p className="text-xs text-[#91A0B5]">Loading event portal...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#090D14] text-[#EAF0F8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#131C29] border border-[#263345] rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#E36C75] mx-auto" />
          <h2 className="text-lg font-bold text-[#EAF0F8]">Event Not Available</h2>
          <p className="text-xs text-[#91A0B5]">
            The registration link for <strong>{slug}</strong> could not be located or registration has closed.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-[#192435] text-[#3987F5] border border-[#3987F5]/30 rounded-lg text-xs font-semibold"
          >
            Go to EVENTFLOW Portal
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity;
  const seatsRemaining = Math.max(0, event.capacity - event.registeredCount);
  const isNearCapacity = !isFull && seatsRemaining <= Math.round(event.capacity * 0.15);

  return (
    <div className="min-h-screen bg-[#090D14] text-[#EAF0F8] selection:bg-[#3987F5]/30 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="border-b border-[#263345] bg-[#101722]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3987F5] to-[#2563EB] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-sm tracking-wider text-[#EAF0F8]">EVENTFLOW</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#91A0B5]">
            <ShieldCheck className="w-4 h-4 text-[#35B982]" />
            <span>Secure Enterprise Registration</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-10 lg:py-14">
        {successData ? (
          /* Confirmation Screen */
          <div className="max-w-xl mx-auto bg-[#131C29] border border-[#263345] rounded-3xl p-8 shadow-elevated text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#35B982]/10 border border-[#35B982]/30 text-[#35B982] flex items-center justify-center mx-auto shadow-lg shadow-[#35B982]/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-[#35B982] uppercase tracking-wider">
                Registration Confirmed
              </span>
              <h2 className="text-2xl font-bold text-[#EAF0F8] mt-1">You're All Set!</h2>
              <p className="text-xs text-[#91A0B5] mt-1.5">
                A confirmation calendar invite and digital entry badge have been dispatched to{" "}
                <span className="text-[#EAF0F8] font-semibold">{formData.email}</span>.
              </p>
            </div>

            {/* Event Pass Card */}
            <div className="bg-[#101722] border border-[#263345] rounded-2xl p-5 text-left space-y-4">
              <div className="flex justify-between items-start border-b border-[#263345] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-[#EAF0F8]">{event.title}</h3>
                  <p className="text-[11px] text-[#91A0B5] mt-0.5">{event.location}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#3987F5]/20 text-[#3987F5] border border-[#3987F5]/40">
                  {formData.ticketType} PASS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#91A0B5] uppercase">Attendee</span>
                  <p className="font-semibold text-[#EAF0F8]">
                    {formData.firstName} {formData.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#91A0B5] uppercase">Organization</span>
                  <p className="font-semibold text-[#EAF0F8]">{formData.companyName || "Direct"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#91A0B5] uppercase">Date & Time</span>
                  <p className="font-semibold text-[#EAF0F8]">{formatDate(event.startDate)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#91A0B5] uppercase">Pass ID</span>
                  <p className="font-mono text-[11px] text-[#3987F5]">
                    EF-{Math.floor(100000 + Math.random() * 900000)}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#263345] flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-[#91A0B5]">
                  <QrCode className="w-5 h-5 text-[#3987F5]" />
                  <span>Show this digital badge at on-site check-in</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setSuccessData(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#192435] text-[#91A0B5] hover:text-[#EAF0F8] text-xs font-semibold transition-colors"
              >
                Register Another Guest
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#3987F5] hover:bg-[#2563EB] text-white text-xs font-semibold shadow-glow transition-all"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Split Hero & Registration Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Hero (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#3987F5]/10 text-[#3987F5] border border-[#3987F5]/30">
                  {event.eventType}
                </span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#EAF0F8] tracking-tight mt-3">
                  {event.title}
                </h1>
                <p className="text-xs text-[#91A0B5] mt-3 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Event Meta Information */}
              <div className="space-y-3 bg-[#131C29] border border-[#263345] rounded-2xl p-5">
                <div className="flex items-center gap-3 text-xs text-[#EAF0F8]">
                  <div className="p-2 rounded-lg bg-[#192435] text-[#3987F5] border border-[#263345]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#91A0B5] uppercase">Date & Schedule</span>
                    <p className="font-semibold">{formatDate(event.startDate)} - {formatDate(event.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#EAF0F8]">
                  <div className="p-2 rounded-lg bg-[#192435] text-[#35B982] border border-[#263345]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#91A0B5] uppercase">Venue Location</span>
                    <p className="font-semibold">{event.location || "San Francisco Convention Center"}</p>
                    {event.venueAddress && <p className="text-[11px] text-[#91A0B5]">{event.venueAddress}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#EAF0F8]">
                  <div className="p-2 rounded-lg bg-[#192435] text-[#E8B45E] border border-[#263345]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#91A0B5] uppercase">Capacity Limit</span>
                    <p className="font-semibold">{event.capacity} Exclusive Attendees</p>
                  </div>
                </div>
              </div>

              {/* Capacity Alerts */}
              {isFull ? (
                <div className="p-4 rounded-xl bg-[#E36C75]/10 border border-[#E36C75]/30 text-xs text-[#E36C75] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>This event has reached full capacity. Registration is currently waitlist-only.</span>
                </div>
              ) : isNearCapacity ? (
                <div className="p-4 rounded-xl bg-[#E8B45E]/10 border border-[#E8B45E]/30 text-xs text-[#E8B45E] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Hurry! Only {seatsRemaining} passes remaining for this session.</span>
                </div>
              ) : null}
            </div>

            {/* Right Registration Card (7 cols) */}
            <div className="lg:col-span-7 bg-[#131C29] border border-[#263345] rounded-3xl p-7 lg:p-9 shadow-card">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#EAF0F8]">Register for Your Pass</h2>
                <p className="text-xs text-[#91A0B5] mt-1">
                  Complete this brief form to reserve your seat and receive keynote access.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-[#E36C75]/10 border border-[#E36C75]/30 text-xs text-[#E36C75] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Ticket Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#91A0B5] mb-2">
                    Select Pass Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["General", "VIP", "Speaker"] as TicketType[]).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setFormData({ ...formData, ticketType: t })}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          formData.ticketType === t
                            ? "border-[#3987F5] bg-[#3987F5]/10 text-[#3987F5] shadow-sm"
                            : "border-[#263345] bg-[#101722] text-[#91A0B5] hover:text-[#EAF0F8]"
                        }`}
                      >
                        {t} Pass
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                      <input
                        type="text"
                        required
                        disabled={isFull}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="e.g. Marcus"
                        className="w-full bg-[#090D14] border border-[#263345] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5] disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                      <input
                        type="text"
                        required
                        disabled={isFull}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="e.g. Vance"
                        className="w-full bg-[#090D14] border border-[#263345] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                      Work Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                      <input
                        type="email"
                        required
                        disabled={isFull}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full bg-[#090D14] border border-[#263345] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                      <input
                        type="tel"
                        disabled={isFull}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-[#090D14] border border-[#263345] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Company & Title */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                      Job Title
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                      <input
                        type="text"
                        disabled={isFull}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. VP Engineering"
                        className="w-full bg-[#090D14] border border-[#263345] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#91A0B5] mb-1.5">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B5]" />
                      <input
                        type="text"
                        disabled={isFull}
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-[#090D14] border border-[#263345] rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAF0F8] focus:outline-none focus:border-[#3987F5] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting || isFull}
                    className="w-full py-3 rounded-xl bg-[#3987F5] hover:bg-[#2563EB] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Securing Reservation...</span>
                      </>
                    ) : isFull ? (
                      <span>Capacity Limit Reached</span>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
