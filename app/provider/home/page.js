"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Sliders,
  Plus,
  X,
  Sparkles,
  Zap,
  Calendar,
  PhoneCall,
  Navigation,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  FileText,
  MessageSquare,
  ThumbsUp,
  Briefcase,
  ChevronRight,
  Bell,
  Check,
} from "lucide-react";

export default function ProviderHomePage() {
  // Provider Info
  const [provider, setProvider] = useState({
    name: "Md. Rafiqul Islam",
    nameBn: "মো. রফিকুল ইসলাম",
    title: "Professional Technician",
    titleBn: "প্রফেশনাল টেকনিশিয়ান",
    avatar: "/images/rafiqul-avatar.svg",
    rating: 4.6,
    totalJobs: 24,
    verificationLevel: "BASIC",
    verificationPercent: 65,
  });

  // Availability Toggle
  const [isAvailable, setIsAvailable] = useState(true);

  // Work Radius Slider State (Screenshot shows 5 KM)
  const [radiusKm, setRadiusKm] = useState(5);

  // Skills State (Screenshot shows Electrician, AC Repair, Wiring)
  const [skills, setSkills] = useState([
    { id: "electrician", name: "Electrician", nameBn: "ইলেক্ট্রিশিয়ান" },
    { id: "ac_repair", name: "AC Repair", nameBn: "এসি মেরামত" },
    { id: "wiring", name: "Wiring", nameBn: "ওয়্যারিং" },
  ]);

  // Skill Add Modal State
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkillText, setNewSkillText] = useState("");

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRemoveSkill = (skillId) => {
    setSkills(skills.filter((s) => s.id !== skillId));
    showToast("Skill removed / দক্ষতা মুছে ফেলা হয়েছে");
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillText.trim()) return;
    const newSkill = {
      id: `skill_${Date.now()}`,
      name: newSkillText.trim(),
      nameBn: newSkillText.trim(),
    };
    setSkills([...skills, newSkill]);
    setNewSkillText("");
    setIsAddSkillOpen(false);
    showToast("New skill added / নতুন দক্ষতা যুক্ত হয়েছে");
  };

  // Recent jobs for the Web experience
  const recentJobs = [
    {
      id: "JOB-1029",
      customer: "Farhan Tanvir",
      service: "AC Deep Master Service & Gas Refill",
      location: "Dhanmondi Road 27, Dhaka",
      time: "Today • 2:30 PM",
      amount: "৳ 1,850",
      status: "In Progress",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "JOB-1028",
      customer: "Nasrin Akhter",
      service: "Main DB Circuit Breaker Tripping Fix",
      location: "Mirpur 10, Block C, Dhaka",
      time: "Scheduled • Today, 5:00 PM",
      amount: "৳ 850",
      status: "Confirmed",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "JOB-1027",
      customer: "Kabir Hossain",
      service: "Kitchen Power Outlet Rewiring",
      location: "Mohammadpur, Dhaka",
      time: "Yesterday",
      amount: "৳ 1,200",
      status: "Completed",
      statusColor: "bg-slate-100 text-slate-700 border-slate-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F5] pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HEADER & AVAILABILITY BAR (WEB RESPONSIVE)               */}
      {/* ============================================================== */}
      <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar & Technician Meta */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="h-full w-full rounded-2xl object-cover border-2 border-emerald-600/30 shadow-md bg-slate-100"
              />
              <div
                className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white shadow-sm ${
                  isAvailable ? "bg-[#00695C]" : "bg-slate-400"
                }`}
                title={isAvailable ? "Online & Ready" : "Offline"}
              >
                <Check size={13} strokeWidth={3} />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {provider.name}
                </h1>
                <span className="text-xs sm:text-sm font-semibold text-slate-500">
                  / {provider.nameBn}
                </span>
              </div>

              <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[#00695C]">
                {provider.title} • {provider.titleBn}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#00695C]" />
                  <span>Dhaka, Bangladesh</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>ID: NIR-84920</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Availability Toggle Card (From screenshot: "আমি কাজের জন্য প্রস্তুত / I am Available") */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 lg:self-center">
            <div className="pr-2">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isAvailable
                      ? "bg-emerald-500 animate-ping"
                      : "bg-slate-400"
                  }`}
                />
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {isAvailable ? "আমি কাজের জন্য প্রস্তুত" : "বর্তমানে অনুপলব্ধ"}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isAvailable
                  ? "I am Available (Receiving customer jobs)"
                  : "Paused (Not accepting new bookings)"}
              </p>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => {
                  setIsAvailable(e.target.checked);
                  showToast(
                    e.target.checked
                      ? "Availability set to: Online / আপনি এখন লাইভ আছেন"
                      : "Availability paused / কাজ সাময়িক বন্ধ করা হয়েছে"
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00695C]"></div>
            </label>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. VERIFICATION BANNER CARD (From screenshot)                  */}
      {/* ============================================================== */}
      <section className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#00695C] border border-emerald-200">
                <ShieldCheck size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-800">
                VERIFICATION LEVEL / যাচাই স্তর:{" "}
                <span className="text-[#00695C]">{provider.verificationLevel}</span>
              </h2>
            </div>

            {/* Progress Bar (partially filled matching screenshot) */}
            <div className="mt-3 max-w-xl">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Progress: Profile 65% Verified</span>
                <span>Next: NID Document Scan</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00695C] transition-all duration-700"
                  style={{ width: `${provider.verificationPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Upload NID Button (Matches screenshot button) */}
          <Link
            href="/provider/setup"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#00695C] bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#00695C] hover:bg-emerald-50 transition-all shadow-xs cursor-pointer text-center"
          >
            <span>Upload NID to get Verified / NID আপলোড করুন</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. CORE METRICS GRID (RATING, FEEDBACK SUMMARY, JOBS DONE)     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* CARD A: MY RATING (Solid Emerald Card from screenshot) */}
        <div className="rounded-2xl bg-[#00695C] p-6 text-white shadow-md shadow-[#00695C]/20 flex flex-col justify-between">
          <div>
            <p className="text-xs sm:text-sm font-bold text-emerald-100 tracking-wide">
              My Rating / আমার রেটিং
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight">
                4.6
              </span>
              <span className="text-2xl text-amber-300">★</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/15">
            <p className="text-xs text-emerald-100/90 font-medium">
              Based on 24 completed jobs / ২৪টি সম্পন্ন কাজের উপর ভিত্তি করে
            </p>
          </div>
        </div>

        {/* CARD B: CUSTOMER FEEDBACK SUMMARY (Dark Slate Card from screenshot) */}
        <div className="rounded-2xl bg-[#334155] p-6 text-white shadow-md shadow-slate-900/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-300 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-emerald-400">
                <ThumbsUp size={13} />
              </div>
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-200">
                CUSTOMER FEEDBACK SUMMARY / গ্রাহক মতামত সারসংক্ষেপ
              </h3>
            </div>

            <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-100 italic mt-2">
              “গ্রাহকরা এই সার্ভিস প্রোভাইডারের সময়নিষ্ঠ এবং পরিচ্ছন্ন কাজের প্রশংসা করছেন।”
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <span>98% Positive Feedback</span>
            <span className="text-emerald-400 font-semibold">Verified Reviews</span>
          </div>
        </div>

        {/* CARD C: JOBS DONE (Clean White Card from screenshot) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Activity
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#00695C]">
                +4 this week
              </span>
            </div>
            <p className="text-4xl sm:text-5xl font-black text-[#00695C] mt-1">
              24
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Jobs Done / সম্পন্ন কাজ
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              100% on-time completion record
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. WORK RADIUS & SKILLS (2-COLUMN GRID ON DESKTOP)             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CARD D: WORK RADIUS / কাজের এলাকা (From screenshot) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[#00695C]" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Work Radius / কাজের এলাকা
                </h2>
              </div>
              <span className="rounded-lg bg-[#00695C] px-3 py-1 text-xs font-extrabold text-white shadow-xs">
                {radiusKm} KM
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-5">
              Set the maximum distance you are willing to travel for service requests.
            </p>

            {/* Slider control */}
            <div className="px-1">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-[#00695C] cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                <span>1 KM</span>
                <span>10 KM</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span>Coverage Zone: <strong>Mirpur, Mohammadpur & Dhanmondi</strong></span>
            <span className="text-[#00695C] font-semibold">Active</span>
          </div>
        </div>

        {/* CARD E: MY SKILLS / আমার দক্ষতা (From screenshot) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-[#00695C]" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  MY SKILLS / আমার দক্ষতা
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {skills.length} skills listed
              </span>
            </div>

            {/* Skill tags matching screenshot */}
            <div className="flex flex-wrap gap-2.5">
              {skills.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-xl bg-[#00695C] px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  <span>{s.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.id)}
                    className="text-emerald-200 hover:text-white transition-colors cursor-pointer"
                    title="Remove Skill"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Add Skill Button (dashed border matching screenshot) */}
              <button
                type="button"
                onClick={() => setIsAddSkillOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-slate-400 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-[#00695C] hover:text-[#00695C] hover:bg-emerald-50/50 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Add Skill / দক্ষতা যোগ করুন</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Skills determine which customer inquiries appear in your feed.</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. RECENT BOOKINGS & INQUIRIES (WEB DESKTOP DASHBOARD EXTENSION) */}
      {/* ============================================================== */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Active Bookings & Live Leads / সক্রিয় কাজের তালিকা
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Incoming service requests within your {radiusKm} KM radius.
            </p>
          </div>

          <Link
            href="/provider/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00695C] hover:underline"
          >
            <span>View Full Profile & Reviews →</span>
          </Link>
        </div>

        {/* Jobs List / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3">Customer / গ্রাহক</th>
                <th className="pb-3">Service / সেবা</th>
                <th className="pb-3">Location / এলাকা</th>
                <th className="pb-3">Schedule / সময়</th>
                <th className="pb-3">Amount / পারিশ্রমিক</th>
                <th className="pb-3 text-right">Status / অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900">
                    {job.customer}
                  </td>
                  <td className="py-3.5 font-medium text-slate-700">
                    {job.service}
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {job.location}
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {job.time}
                  </td>
                  <td className="py-3.5 font-bold text-[#00695C]">
                    {job.amount}
                  </td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`inline-block rounded-lg border px-2.5 py-1 text-[11px] font-bold ${job.statusColor}`}
                    >
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* MODAL: ADD SKILL                                               */}
      {/* ============================================================== */}
      {isAddSkillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Add Skill / নতুন দক্ষতা যোগ করুন
              </h3>
              <button
                onClick={() => setIsAddSkillOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill Name / দক্ষতার নাম
                </label>
                <input
                  type="text"
                  required
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  placeholder="e.g. Geyser Repair / গিজার মেরামত"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSkillOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#00695C] px-5 py-2 text-xs font-bold text-white hover:bg-[#00574C]"
                >
                  Add / যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

