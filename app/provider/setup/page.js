"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Wrench,
  Settings,
  FileCheck2,
  Camera,
  Check,
  HelpCircle,
  ArrowRight,
  Info,
  Upload,
  CheckCircle2,
  Save,
  Trash2,
} from "lucide-react";

export default function ProviderSetupPage() {
  const router = useRouter();

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Rahim Ahmed",
    nidNumber: "19942692019000123",
    address: "House #14, Road #05, Block C, Mirpur, Dhaka 1216",
  });

  // Skills State (Choose up to 5)
  const availableSkills = [
    { id: "electrician", en: "Electrician", bn: "ইলেক্ট্রিশিয়ান" },
    { id: "plumber", en: "Plumber", bn: "প্লাম্বার" },
    { id: "carpenter", en: "Carpenter", bn: "কাঠমিস্ত্রি" },
    { id: "ac_repair", en: "AC Repair", bn: "এসি মেরামত" },
    { id: "painter", en: "Painter", bn: "পেইন্টার" },
    { id: "mason", en: "Mason", bn: "রাজমিস্ত্রি" },
    { id: "cleaner", en: "Cleaner", bn: "ক্লিনার" },
    { id: "appliance", en: "Appliance Repair", bn: "অ্যাপ্লায়েন্স মেরামত" },
  ];

  // Default selected matches screenshot: Plumber and Painter
  const [selectedSkills, setSelectedSkills] = useState(["plumber", "painter"]);

  // Work Preferences State
  const [radiusKm, setRadiusKm] = useState(5);
  const [instantAvailability, setInstantAvailability] = useState(true);

  // Verification Uploads State
  const [nidFront, setNidFront] = useState(null);
  const [nidBack, setNidBack] = useState(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Toggle Skill
  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skillId));
    } else {
      if (selectedSkills.length >= 5) {
        showToast("Maximum 5 skills allowed / সর্বোচ্চ ৫টি দক্ষতা নির্বাচন করা যাবে");
        return;
      }
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  // Handle Mock File Upload
  const handleFileUpload = (side, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (side === "front") setNidFront(url);
      else setNidBack(url);
      showToast(`NID ${side === "front" ? "Front" : "Back"} uploaded successfully!`);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveDraft = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Draft saved successfully! / খসড়া সফলভাবে সংরক্ষিত হয়েছে।");
    }, 600);
  };

  const handleSaveAndContinue = () => {
    setSaving(true);
    showToast("Profile setup verified! Redirecting to Provider Home Dashboard... / প্রোফাইল সেটআপ সম্পন্ন! হোম স্ক্রিনে নিয়ে যাওয়া হচ্ছে...");
    setTimeout(() => {
      router.push("/provider/home");
    }, 1000);
  };

  // Calculate dynamic progress
  let progress = 40;
  if (personalInfo.fullName && personalInfo.nidNumber && personalInfo.address) progress += 25;
  if (selectedSkills.length > 0) progress += 20;
  if (nidFront || nidBack) progress += 15;

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#00695C]">
          Provider Profile Setup
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
          প্রোভাইডার প্রোফাইল সেটআপ — Please complete the following steps to verify your trust status.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================================== */}
        {/* LEFT COLUMN: 8 COLS                                            */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. PERSONAL INFORMATION */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <User size={18} className="text-[#00695C]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Personal Information / ব্যক্তিগত তথ্য
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / পূর্ণ নাম
                </label>
                <input
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, fullName: e.target.value })
                  }
                  placeholder="e.g. Rahim Ahmed"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                />
              </div>

              {/* NID Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NID Number / জাতীয় পরিচয়পত্র নম্বর
                </label>
                <input
                  type="text"
                  value={personalInfo.nidNumber}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, nidNumber: e.target.value })
                  }
                  placeholder="13-digit or 17-digit number"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                />
              </div>

              {/* Permanent Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Permanent Address / স্থায়ী ঠিকানা
                </label>
                <textarea
                  rows={2}
                  value={personalInfo.address}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, address: e.target.value })
                  }
                  placeholder="House, Road, Area, District"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* 2. SERVICE SELECTION */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
              <Wrench size={18} className="text-[#00695C]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Service Selection / দক্ষতা নির্বাচন
              </h2>
            </div>

            <div className="flex items-center justify-between mt-3 mb-4">
              <p className="text-xs text-slate-500 font-medium">
                Select your primary skills (Choose up to 5) / আপনার প্রাথমিক দক্ষতাগুলো নির্বাচন করুন (সর্বোচ্চ ৫টি)
              </p>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-[#00695C] border border-emerald-200">
                {selectedSkills.length} of 5 selected
              </span>
            </div>

            {/* Skill Pills */}
            <div className="flex flex-wrap gap-2.5">
              {availableSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#00695C] text-white shadow-sm ring-1 ring-[#00695C]"
                        : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <span>
                      {skill.en} / {skill.bn}
                    </span>
                    {isSelected && <Check size={14} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. WORK PREFERENCES */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Settings size={18} className="text-[#00695C]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Work Preferences / কাজের পছন্দসমূহ
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Service Radius Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Service Radius / কাজের ব্যাসার্ধ
                  </label>
                  <span className="rounded-md bg-[#00695C] px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                    {radiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full accent-[#00695C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
                  <span>1km</span>
                  <span>10km</span>
                </div>
              </div>

              {/* Instant Availability Toggle Card */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Instant Availability
                  </p>
                  <p className="text-[11px] text-slate-500">
                    তাৎক্ষণিক প্রাপ্যতা
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instantAvailability}
                    onChange={(e) => setInstantAvailability(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00695C]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: 4 COLS                                           */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* VERIFICATION CARD */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <FileCheck2 size={18} className="text-[#00695C]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Verification / যাচাইকরণ
              </h2>
            </div>

            {/* NID Front Side */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-700 mb-1.5">
                NID Front Side / এনআইডি সামনের দিক
              </p>
              <label className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-5 text-center hover:bg-slate-100/70 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("front", e)}
                  className="hidden"
                />
                {nidFront ? (
                  <div className="w-full flex flex-col items-center">
                    <img
                      src={nidFront}
                      alt="NID Front"
                      className="h-24 w-full object-cover rounded-lg border border-slate-200 shadow-sm mb-2"
                    />
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 size={13} />
                      <span>Front Uploaded ✓</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 group-hover:text-[#00695C] shadow-xs border border-slate-200 mb-2">
                      <Camera size={18} />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, PDF up to 5MB
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* NID Back Side */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1.5">
                NID Back Side / এনআইডি পেছনের দিক
              </p>
              <label className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-5 text-center hover:bg-slate-100/70 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("back", e)}
                  className="hidden"
                />
                {nidBack ? (
                  <div className="w-full flex flex-col items-center">
                    <img
                      src={nidBack}
                      alt="NID Back"
                      className="h-24 w-full object-cover rounded-lg border border-slate-200 shadow-sm mb-2"
                    />
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 size={13} />
                      <span>Back Uploaded ✓</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 group-hover:text-[#00695C] shadow-xs border border-slate-200 mb-2">
                      <Camera size={18} />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, PDF up to 5MB
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* NEED HELP CARD */}
          <div className="rounded-2xl border border-[#99DED3] bg-[#E6F7F4] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00695C] text-white">
                <Info size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#004D40]">
                  Need Help? / সাহায্য প্রয়োজন?
                </h3>
                <p className="mt-1 text-xs text-[#004D40]/90 leading-relaxed">
                  Our verification team is available 24/7 to assist with NID
                  scanning. Contact support if you face any issues.
                </p>
                <p className="mt-2 text-[11px] font-semibold text-[#00695C] hover:underline cursor-pointer">
                  Hotline: 16222 • help@nirbhor.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STICKY BOTTOM ACTION BAR                                       */}
      {/* ============================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-8 shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600"></span>
            </span>
            <span>
              Progress: <strong className="text-emerald-700">{progress}% Complete</strong> — All mandatory fields filled.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex-1 sm:flex-initial rounded-xl border border-[#00695C] bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#00695C] hover:bg-emerald-50 transition-all cursor-pointer"
            >
              Save Draft / খসড়া হিসেবে সংরক্ষণ
            </button>

            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-[#00695C] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#00695C]/20 hover:bg-[#00574C] transition-all cursor-pointer"
            >
              <span>Save & Continue / সংরক্ষণ এবং এগিয়ে যান</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

