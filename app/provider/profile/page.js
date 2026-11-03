"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Share2,
  ExternalLink,
  Edit3,
  Clock,
  CheckCircle2,
  Plus,
  X,
  Wallet,
  Wrench,
  Droplet,
  Home,
  Check,
  AlertCircle,
  Copy,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import ServiceAreaMap from "@/components/ServiceAreaMap";
import { getAccessToken, fetchUserProfileMe, fetchProviderDashboard } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

export default function ProviderProfilePage() {
  const { language, t } = useLanguage();

  // Provider Personal Info State
  const [profile, setProfile] = useState({
    nameEn: "Arif Ahmed",
    nameBn: "আরিফ আহমেদ",
    email: "arif.ahmed@example.com",
    phone: "+880 1712 345678",
    bio: "Expert technician with extensive experience in residential and commercial maintenance.",
  });

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchUserProfileMe(token, language)
        .then((user) => {
          if (user) {
            setProfile((prev) => ({
              ...prev,
              nameEn: user.name || prev.nameEn,
              nameBn: user.name || prev.nameBn,
              phone: user.phone || prev.phone,
            }));
          }
        })
        .catch((e) => console.warn(e));

      fetchProviderDashboard(token, language)
        .then((dash) => {
          if (dash?.skills && Array.isArray(dash.skills)) {
            setSkills(
              dash.skills.map((s) => ({
                id: s.id,
                en: s.name,
                bn: s.name,
                isPrimary: false,
                icon: "wrench",
              }))
            );
          }
        })
        .catch((e) => console.warn(e));
    }
  }, [language]);

  // Skills List State
  const [skills, setSkills] = useState([
    {
      id: "plumbing",
      en: "Plumbing",
      bn: "প্লাম্বিং",
      isPrimary: true,
      icon: "wrench",
    },
    {
      id: "leak_repair",
      en: "Leak Repair",
      bn: "লিক মেরামত",
      isPrimary: false,
      icon: "wrench",
    },
    {
      id: "bathroom_fitting",
      en: "Bathroom Fitting",
      bn: "বাথরুম ফিটিং",
      isPrimary: false,
      icon: "droplet",
    },
    {
      id: "pipe_installation",
      en: "Pipe Installation",
      bn: "পাইপ স্থাপন",
      isPrimary: false,
      icon: "home",
    },
  ]);

  // Modal States
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [newSkillEn, setNewSkillEn] = useState("");
  const [newSkillBn, setNewSkillBn] = useState("");

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("5000");
  const [withdrawMethod, setWithdrawMethod] = useState("bKash");

  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast("Profile details updated successfully! / ব্যক্তিগত তথ্য সংরক্ষিত হয়েছে।");
    }, 600);
  };

  const handleShareProfile = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Profile link copied to clipboard! / প্রোফাইল লিংক কপি করা হয়েছে।");
    } else {
      showToast("Profile link ready to share!");
    }
  };

  const handleRemoveSkill = (skillId) => {
    setSkills(skills.filter((s) => s.id !== skillId));
    showToast("Skill removed / দক্ষতা সরানো হয়েছে");
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillEn.trim()) return;

    const newSkill = {
      id: `skill_${Date.now()}`,
      en: newSkillEn.trim(),
      bn: newSkillBn.trim() || newSkillEn.trim(),
      isPrimary: false,
      icon: "wrench",
    };

    setSkills([...skills, newSkill]);
    setNewSkillEn("");
    setNewSkillBn("");
    setIsAddSkillModalOpen(false);
    showToast("New skill added successfully! / নতুন দক্ষতা যুক্ত হয়েছে।");
  };

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    setIsWithdrawModalOpen(false);
    showToast(
      `Withdrawal request for ৳${withdrawAmount} via ${withdrawMethod} submitted! / উত্তোলন অনুরোধ গৃহীত হয়েছে।`
    );
  };

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HERO PROFILE HEADER BAR                                 */}
      {/* ============================================================== */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Left: Avatar & Meta */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0">
              <img
                src="/images/arif-avatar.svg"
                alt="Arif Ahmed"
                className="h-full w-full rounded-2xl object-cover border-2 border-emerald-600/30 shadow-md bg-slate-100"
              />
              <div
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#00695C] text-white ring-2 ring-white shadow-sm"
                title="Identity & Police Verified"
              >
                <Check size={13} strokeWidth={3} />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {profile.nameEn} / {profile.nameBn}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#00695C] border border-emerald-200">
                  <ShieldCheck size={13} />
                  <span>VERIFIED PROVIDER / যাচাইকৃত প্রদানকারী</span>
                </span>
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin size={14} className="text-[#00695C]" />
                <span>Dhaka, Bangladesh • Motijheel Service Hub</span>
              </div>
            </div>
          </div>

          {/* Right: Profile Actions */}
          <div className="flex items-center gap-2.5 sm:self-center">
            <button
              type="button"
              onClick={handleShareProfile}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer shadow-xs"
            >
              <Share2 size={15} />
              <span>Share Profile / শেয়ার করুন</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPublicModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#00695C] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#00574C] transition-all cursor-pointer shadow-sm shadow-[#00695C]/20"
            >
              <span>View Public Profile / প্রোফাইল দেখুন</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. MAIN GRID (Personal Info vs Trust Score & Verification Log) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column (8 cols): Personal Information Form */}
        <section className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[#00695C]" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Personal Information / ব্যক্তিগত তথ্য
                </h2>
              </div>
              <button
                type="button"
                onClick={() => showToast("Edit mode active for all fields.")}
                className="text-xs font-semibold text-[#00695C] hover:underline"
              >
                Edit All / সব পরিবর্তন করুন
              </button>
            </div>

            <form onSubmit={handleProfileSave} id="profileForm" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name English */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (English) / পূর্ণ নাম (ইংরেজি)
                  </label>
                  <input
                    type="text"
                    value={profile.nameEn}
                    onChange={(e) =>
                      setProfile({ ...profile, nameEn: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                  />
                </div>

                {/* Full Name Bangla */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (Bangla) / পূর্ণ নাম (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={profile.nameBn}
                    onChange={(e) =>
                      setProfile({ ...profile, nameBn: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address / ইমেল ঠিকানা
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number / ফোন নম্বর
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Bio / পেশাদার তথ্য (Bilingual)
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all resize-none"
                />
              </div>
            </form>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              form="profileForm"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#00695C] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#00574C] transition-all cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes / সংরক্ষণ করুন"}
            </button>
          </div>
        </section>

        {/* Right Column (4 cols): Trust Score & Verification Log */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Trust Score */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-[#00695C]" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Trust Score / ট্রাস্ট স্কোর
              </h2>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
                <span className="text-slate-600">
                  Profile Completion / সম্পূর্ণতা
                </span>
                <span className="font-extrabold text-[#00695C]">95%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00695C] transition-all duration-700"
                  style={{ width: "95%" }}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500 leading-relaxed font-medium">
              Your identity and skills are fully verified. / আপনার পরিচয় এবং দক্ষতা
              সম্পূর্ণরূপে যাচাই করা হয়েছে।
            </p>
          </div>

          {/* Card 2: Verification Log */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Clock size={16} className="text-slate-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Verification Log / লগ
              </h2>
            </div>

            <div className="space-y-3.5">
              {/* Item 1 */}
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[#00695C] mt-0.5">
                  <Check size={12} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    NID Verified
                  </p>
                  <p className="text-[11px] text-slate-400">Jan 12, 2024</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[#00695C] mt-0.5">
                  <Check size={12} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Trade License Uploaded
                  </p>
                  <p className="text-[11px] text-slate-400">Dec 20, 2023</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    New Skill Certification
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium">
                    Review in progress...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. SKILLS & SERVICES (FULL WIDTH CARD)                         */}
      {/* ============================================================== */}
      <section className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#00695C]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Skills & Services / দক্ষতা ও সেবা
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Manage the tags that appear on your profile. / আপনার প্রোফাইলে প্রদর্শিত
              ট্যাগগুলি পরিচালনা করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddSkillModalOpen(true)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-[#00695C] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00574C] transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add New Skill / নতুন দক্ষতা যুক্ত করুন</span>
          </button>
        </div>

        {/* Skill Tags Container */}
        <div className="flex flex-wrap gap-2.5">
          {skills.map((skill) => {
            if (skill.isPrimary) {
              return (
                <div
                  key={skill.id}
                  className="flex items-center gap-2.5 rounded-xl bg-[#00695C] px-3.5 py-2 text-white shadow-xs"
                >
                  <Wrench size={14} />
                  <div>
                    <span className="text-xs font-bold">
                      {skill.en} / {skill.bn}
                    </span>
                    <span className="ml-1.5 rounded bg-emerald-900/60 px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase text-emerald-200">
                      PRIMARY SKILL
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="ml-1 text-emerald-200 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={skill.id}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-700 shadow-xs hover:border-slate-400 transition-all"
              >
                {skill.icon === "droplet" ? (
                  <Droplet size={14} className="text-sky-600" />
                ) : skill.icon === "home" ? (
                  <Home size={14} className="text-slate-600" />
                ) : (
                  <Wrench size={14} className="text-[#00695C]" />
                )}
                <span className="text-xs font-bold">
                  {skill.en} / {skill.bn}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. BOTTOM ROW: PAYOUTS & SERVICE AREA (2 COLS)                 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 5: Payouts */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Wallet size={18} className="text-[#00695C]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Payouts / পে-আউট
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Current Balance */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Current Balance / বর্তমান ব্যালেন্স
                </p>
                <p className="mt-1 text-2xl font-black text-[#00695C]">
                  ৳ 12,450
                </p>
              </div>

              {/* Last Payout */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Last Payout / সর্বশেষ পেমেন্ট
                </p>
                <p className="mt-1 text-2xl font-black text-slate-800">
                  ৳ 8,200
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#00695C] bg-white py-2.5 text-xs sm:text-sm font-bold text-[#00695C] hover:bg-emerald-50 transition-all cursor-pointer shadow-xs"
            >
              <span>Request Withdrawal / উত্তোলন অনুরোধ</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </section>

        {/* Card 6: Service Area */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-[#00695C]" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Service Area / সেবা এলাকা
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Radius: 15km around Motijheel • ঢাকা মহানগরী ও তৎসংলগ্ন এলাকা
            </p>

            {/* Interactive Map Visual */}
            <ServiceAreaMap
              initialRadius={15}
              centerName="Motijheel, Dhaka"
              onRadiusChange={(r) =>
                showToast(`Coverage radius updated to ${r}km!`)
              }
            />
          </div>
        </section>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: ADD NEW SKILL                                         */}
      {/* ============================================================== */}
      {isAddSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Add New Skill / নতুন দক্ষতা যুক্ত করুন
              </h3>
              <button
                onClick={() => setIsAddSkillModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill Name in English (e.g. Geyser Installation)
                </label>
                <input
                  type="text"
                  required
                  value={newSkillEn}
                  onChange={(e) => setNewSkillEn(e.target.value)}
                  placeholder="e.g. Gas Stove Repair"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill Name in Bangla (e.g. গিজার মেরামত)
                </label>
                <input
                  type="text"
                  value={newSkillBn}
                  onChange={(e) => setNewSkillBn(e.target.value)}
                  placeholder="যেমন: গ্যাস চুলা মেরামত"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSkillModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#00695C] px-5 py-2 text-xs font-bold text-white hover:bg-[#00574C]"
                >
                  Add Skill / যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: WITHDRAWAL REQUEST                                    */}
      {/* ============================================================== */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Request Withdrawal / উত্তোলন অনুরোধ
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs text-[#00695C]">
                Available Balance: <strong>৳ 12,450</strong> (Withdrawal fee: ৳0)
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Withdrawal Amount (BDT) / উত্তোলনের পরিমাণ
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    max="12450"
                    min="500"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2.5 text-sm font-bold text-slate-900 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Payout Method / পেমেন্ট মাধ্যম
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["bKash", "Nagad", "Bank"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setWithdrawMethod(m)}
                      className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                        withdrawMethod === m
                          ? "bg-[#00695C] text-white border-[#00695C]"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#00695C] px-5 py-2 text-xs font-bold text-white hover:bg-[#00574C]"
                >
                  Confirm Request / নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: PUBLIC PROFILE PREVIEW MODAL                          */}
      {/* ============================================================== */}
      {isPublicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#00695C]" />
                <h3 className="text-base font-bold text-slate-900">
                  Public Profile View / গ্রাহক ভিউ
                </h3>
              </div>
              <button
                onClick={() => setIsPublicModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/arif-avatar.svg"
                  alt="Arif Ahmed"
                  className="h-16 w-16 rounded-xl border border-slate-200"
                />
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {profile.nameEn}
                  </h4>
                  <p className="text-xs font-semibold text-[#00695C]">
                    {profile.nameBn} • Verified Master Plumber
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ⭐ 4.9 (148 verified jobs completed)
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/80">
                <p className="font-semibold text-slate-700 mb-1">About Specialist:</p>
                <p>{profile.bio}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5">
                  Verified Skills:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-[#00695C]"
                    >
                      {s.en} / {s.bn}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPublicModalOpen(false)}
                  className="rounded-xl bg-[#00695C] px-5 py-2 text-xs font-bold text-white hover:bg-[#00574C]"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

