"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  Map,
  Clock,
  CheckCircle2,
  Plus,
  X,
  Wrench,
  Check,
  AlertCircle,
  AlertTriangle,
  Star,
  Briefcase,
  Smartphone,
  Sliders,
  LogOut,
  Save,
  Loader2,
  ArrowLeft,
  Upload,
  User,
  ExternalLink,
  Sparkles,
  Lock,
  FileCheck2,
  Shield,
} from "lucide-react";
import {
  fetchUserProfileMe,
  fetchProviderDashboard,
  updateProviderProfile,
  getAccessToken,
  clearAuthSession,
} from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import GoogleMapPickerModal from "@/components/GoogleMapPickerModal";
import NidVerificationModal from "@/components/provider/NidVerificationModal";
import AddSkillsModal from "@/components/provider/AddSkillsModal";

export default function ProviderProfilePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const p = t.profile;
  const c = t.common;
  const d = t.dashboard;

  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // User Profile & Dashboard Data
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Editable Form Fields
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    base_address: "",
    latitude: 23.8103,
    longitude: 90.4125,
    has_smartphone: true,
    is_available: true,
    working_radius_km: 3,
  });

  // Modals
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isNidModalOpen, setIsNidModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Initial Auth Token Retrieval
  useEffect(() => {
    const savedToken = getAccessToken();
    setToken(savedToken);
  }, []);

  // 2. Fetch Profile from /api/v1/users/me & /api/v1/provider/dashboard
  const loadProfileData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      // Fetch /users/me
      const me = await fetchUserProfileMe(token, language);
      setUserData(me);

      if (me) {
        setFormData({
          name: me.name || "",
          phone: me.phone || "",
          base_address: me.base_address || "",
          latitude: me.latitude || 23.8103,
          longitude: me.longitude || 90.4125,
          has_smartphone: Boolean(me.has_smartphone),
          is_available: Boolean(me.is_available),
          working_radius_km: Number(me.working_radius_km) || 3,
        });
      }

      // Fetch /provider/dashboard
      const dash = await fetchProviderDashboard(token, language);
      setDashboardData(dash);
    } catch (err) {
      console.error("Failed to load profile data:", err);
      showToast(err.message || "Failed to load profile data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [token, language]);

  useEffect(() => {
    if (token) {
      loadProfileData();
    }
  }, [token, loadProfileData]);

  // Determine localized name dynamically matching the active language
  const getLocalizedName = useCallback(() => {
    if (language === "bn") {
      const storedBn =
        typeof window !== "undefined"
          ? localStorage.getItem("user_name_bn")
          : null;
      if (storedBn) return storedBn;
      if (userData?.name && /[\u0980-\u09FF]/.test(userData.name)) {
        return userData.name;
      }
      return userData?.name || "সেবাদাতা";
    } else {
      const storedEn =
        typeof window !== "undefined"
          ? localStorage.getItem("user_name_en")
          : null;
      if (storedEn) return storedEn;
      if (userData?.name && !/[\u0980-\u09FF]/.test(userData.name)) {
        return userData.name;
      }
      return userData?.name || "Service Provider";
    }
  }, [language, userData]);

  // Sync localized name to formData
  useEffect(() => {
    const locName = getLocalizedName();
    setFormData((prev) => ({
      ...prev,
      name: locName,
    }));
  }, [getLocalizedName]);

  // Handle Location from Google Maps
  const handleLocationConfirmed = ({ lat, lng, address }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      base_address: address || prev.base_address,
    }));
    setIsMapModalOpen(false);
    showToast(
      language === "bn"
        ? "ম্যাপ থেকে অবস্থান সফলভাবে শনাক্ত হয়েছে!"
        : "Location updated from map!"
    );
  };

  // Handle Form Submission -> PATCH /api/v1/provider/me/update_profile
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.base_address || formData.base_address.trim().length < 5) {
      showToast(
        language === "bn"
          ? "ঠিকানা কমপক্ষে ৫ অক্ষরের হতে হবে।"
          : "Base address must be at least 5 characters.",
        "error"
      );
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        base_address: formData.base_address.trim(),
        has_smartphone: Boolean(formData.has_smartphone),
        is_available: Boolean(formData.is_available),
        working_radius_km: Number(formData.working_radius_km),
      };

      // If location coordinates exist, pass them
      if (formData.latitude && formData.longitude) {
        payload.latitude = Number(formData.latitude);
        payload.longitude = Number(formData.longitude);
      }

      await updateProviderProfile(payload, token, language);
      showToast(p.successSaved);
      loadProfileData();
    } catch (err) {
      console.warn("Update profile response:", err);
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Share Profile
  const handleShareProfile = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(p.linkCopied);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    clearAuthSession();
    showToast(
      language === "bn"
        ? "সফলভাবে লগআউট সম্পন্ন হয়েছে।"
        : "Logged out successfully."
    );
    setTimeout(() => {
      window.location.href = "/login";
    }, 300);
  };

  // If not logged in, prompt to log in
  if (!isLoading && !token) {
    return (
      <div className="min-h-screen bg-[#F1F5F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#00695C] mb-4">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {language === "bn"
              ? "প্রোফাইলে প্রবেশের জন্য লগইন করুন"
              : "Provider Login Required"}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {language === "bn"
              ? "আপনার সেবাদাতা প্রোফাইল দেখতে এবং তথ্য পরিবর্তন করতে লগইন করুন।"
              : "Please sign in to view and update your service provider profile."}
          </p>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#00695C] py-3 text-sm font-bold text-white shadow-md shadow-[#00695C]/25 hover:bg-[#005247] transition-all"
          >
            {t.auth?.tabLogin || (language === "bn" ? "লগইন করুন" : "Log In")}
          </Link>
        </div>
      </div>
    );
  }

  const verificationStatus = userData?.verification_status || "not_initiated";
  const verificationLevel = userData?.verification_level || "basic";

  return (
    <div className="min-h-screen bg-[#F1F5F5] pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-semibold shadow-2xl border animate-in fade-in slide-in-from-top-4 ${
            toastType === "error"
              ? "bg-red-900 text-white border-red-700"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          {toastType === "error" ? (
            <AlertCircle size={16} className="text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back to Dashboard Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/provider/home"
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
        >
          <ArrowLeft size={14} className="text-[#00695C]" />
          <span>{p.backToDashboard}</span>
        </Link>

        {/* Top Logout Button */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100/80 transition-all cursor-pointer shadow-xs"
        >
          <LogOut size={14} />
          <span>{p.logoutBtn}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. TOP HERO PROFILE HEADER CARD                                 */}
      {/* ============================================================== */}
      <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Left: Avatar & Meta */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0">
              {userData?.photo_url ? (
                <img
                  src={userData.photo_url}
                  alt={getLocalizedName()}
                  className="h-full w-full rounded-2xl object-cover border-2 border-emerald-600/30 shadow-md bg-slate-100"
                />
              ) : (
                <div className="h-full w-full rounded-2xl bg-gradient-to-tr from-[#00695C] to-emerald-400 flex items-center justify-center text-white text-2xl font-black shadow-md">
                  {getLocalizedName() ? getLocalizedName().charAt(0) : "P"}
                </div>
              )}
              <div
                className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white shadow-sm ${
                  formData.is_available ? "bg-[#00695C]" : "bg-slate-400"
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {getLocalizedName()}
                </h1>

                {/* Verification Status Badge */}
                {verificationStatus === "approved" || verificationLevel === "verified" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#00695C] border border-emerald-200">
                    <ShieldCheck size={13} />
                    <span>{p.verifiedProvider}</span>
                  </span>
                ) : verificationStatus === "pending" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                    <Clock size={13} />
                    <span>{p.pendingProvider}</span>
                  </span>
                ) : verificationStatus === "rejected" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200">
                    <AlertTriangle size={13} />
                    <span>{p.rejectedProvider}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                    <span>{p.basicProvider}</span>
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                {userData?.base_address && (
                  <span className="flex items-center gap-1 text-slate-700">
                    <MapPin size={13} className="text-[#00695C]" />
                    <span>{userData.base_address}</span>
                  </span>
                )}
                {userData?.phone && (
                  <span className="font-mono text-slate-600">
                    {userData.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. STATS & SUMMARY OVERVIEW                                    */}
      {/* ============================================================== */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Rating */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Star size={20} fill="currentColor" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {p.ratingLabel}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black text-slate-900">
                {userData?.average_rating != null
                  ? Number(userData.average_rating).toFixed(1)
                  : "5.0"}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Jobs Completed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#00695C]">
            <Briefcase size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {p.jobsDoneLabel}
            </span>
            <span className="text-xl font-black text-slate-900">
              {language === "bn"
                ? (dashboardData?.total_jobs_done ?? 0).toLocaleString("bn-BD")
                : (dashboardData?.total_jobs_done ?? 0)}
            </span>
          </div>
        </div>

        {/* Working Radius */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Sliders size={20} />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {p.workRadius}
            </span>
            <span className="text-xl font-black text-slate-900">
              {language === "bn"
                ? `${(formData.working_radius_km || 3).toLocaleString("bn-BD")} কিমি`
                : `${formData.working_radius_km || 3} KM`}
            </span>
          </div>
        </div>
      </div>

      {/* AI Performance Summary if available */}
      {userData?.ai_review_summary && (
        <section className="mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 to-white p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00695C] text-white shrink-0 shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#00695C] uppercase tracking-wider">
              {d.aiSummary}
            </h3>
            <p className="mt-0.5 text-xs text-slate-700 leading-relaxed">
              {userData.ai_review_summary}
            </p>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 3. PROFILE SETTINGS FORM                                       */}
      {/* (PATCH /api/v1/provider/me/update_profile)                      */}
      {/* ============================================================== */}
      <form onSubmit={handleProfileSave} className="space-y-6">
        {/* Personal & Account Info */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="h-5 w-1 rounded-full bg-[#00695C]" />
            <h2 className="text-base font-bold text-slate-900">
              {p.personalInfoTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {p.fullName}
              </label>
              <input
                type="text"
                disabled
                value={formData.name}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs sm:text-sm text-slate-600 font-semibold cursor-not-allowed"
              />
              <span className="mt-1 block text-[11px] text-slate-400">
                {language === "bn"
                  ? "নাম জাতীয় পরিচয়পত্র অনুযায়ী নির্ধারিত থাকে।"
                  : "Name is authenticated against your official National ID."}
              </span>
            </div>

            {/* Mobile Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {p.phone}
              </label>
              <input
                type="text"
                disabled
                value={formData.phone}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs sm:text-sm text-slate-600 font-mono font-semibold cursor-not-allowed"
              />
              <span className="mt-1 block text-[11px] text-slate-400">
                {language === "bn"
                  ? "আপনার একাউন্টের অফিসিয়াল যোগাযোগের নম্বর।"
                  : "Your official primary contact and login number."}
              </span>
            </div>
          </div>
        </section>

        {/* Work & Location Preferences */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="h-5 w-1 rounded-full bg-[#00695C]" />
            <h2 className="text-base font-bold text-slate-900">
              {p.workSettingsTitle}
            </h2>
          </div>

          {/* Base Address with Map Pin Picker (Registration Style) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {p.baseAddress || (language === "bn" ? "কর্মস্থলের ঠিকানা বা এলাকা" : "Base Address or Area")}
              <span className="text-rose-500 ml-0.5">*</span>
            </label>

            <div className="flex items-center gap-2">
              {/* Search Input Box */}
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <MapPin size={18} className="text-[#00695C]" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.base_address}
                  onChange={(e) =>
                    setFormData({ ...formData, base_address: e.target.value })
                  }
                  placeholder={
                    p.baseAddressPlaceholder ||
                    (language === "bn"
                      ? "ঠিকানা লিখুন অথবা পাশের ম্যাপ আইকনে ক্লিক করে পিন করুন..."
                      : "Enter address or click map icon to pin location...")
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-medium"
                />
              </div>

              {/* Map Icon Button to Open Google Maps */}
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                title={language === "bn" ? "গুগল ম্যাপে লোকেশন পিন করুন" : "Pin location on Google Maps"}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00695C] hover:bg-[#00574C] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#00695C]/20 transition-all cursor-pointer shrink-0"
              >
                <Map size={18} />
                <span className="hidden sm:inline">
                  {language === "bn" ? "ম্যাপে পিন করুন" : "Pick on Map"}
                </span>
              </button>
            </div>

            {/* Selected Location Confirmation Card */}
            {formData.base_address && (
              <div className="p-3.5 rounded-xl bg-white border border-emerald-200 flex items-start gap-3 shadow-2xs mt-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#00695C] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === "bn" ? "নির্ধারিত অবস্থান" : "Confirmed Location"}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug break-words">
                    {formData.base_address}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Availability Toggle */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-800">
                  {p.availability}
                </span>
                <span className="text-[11px] text-slate-500">
                  {formData.is_available ? p.availableForJobs : p.currentlyBusy}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, is_available: !formData.is_available })
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.is_available ? "bg-[#00695C]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    formData.is_available ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Smartphone Radio */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-800">
                  {p.hasSmartphone}
                </span>
                <span className="text-[11px] text-slate-500">
                  {formData.has_smartphone ? c.yes : c.no}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, has_smartphone: true })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    formData.has_smartphone
                      ? "bg-[#00695C] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  {c.yes}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, has_smartphone: false })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    !formData.has_smartphone
                      ? "bg-[#00695C] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  {c.no}
                </button>
              </div>
            </div>
          </div>

          {/* Working Radius Slider (1 to 5 KM) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders size={14} className="text-[#00695C]" />
                {p.workRadius}
              </span>
              <span className="font-black text-[#00695C] bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                {language === "bn"
                  ? `${(formData.working_radius_km || 3).toLocaleString("bn-BD")} কিমি`
                  : `${formData.working_radius_km || 3} KM`}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={formData.working_radius_km}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  working_radius_km: Number(e.target.value),
                })
              }
              className="w-full accent-[#00695C] cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>{language === "bn" ? "১ কিমি" : "1 KM"}</span>
              <span>{language === "bn" ? "৩ কিমি" : "3 KM"}</span>
              <span>{language === "bn" ? "৫ কিমি" : "5 KM"}</span>
            </div>
          </div>
        </section>

        {/* NID Verification Status Box & Uploaded Images Display */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {p.nidStatusTitle}
              </span>
              <div className="flex items-center gap-2">
                {verificationStatus === "approved" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#00695C] border border-emerald-200">
                    <ShieldCheck size={14} />
                    <span>{p.nidVerified}</span>
                  </span>
                ) : verificationStatus === "pending" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                    <Clock size={14} />
                    <span>{p.nidPending}</span>
                  </span>
                ) : verificationStatus === "rejected" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                    <AlertTriangle size={14} />
                    <span>{p.nidRejected}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    <span>{p.nidNotUploaded}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action: Lock badge for 1 (pending) & 2 (approved), or Upload/Change for 0 (not_initiated) & 3 (rejected) */}
            <div>
              {verificationStatus === "pending" || verificationStatus === "approved" ? (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-500 shadow-2xs select-none">
                  <Lock size={14} className="text-slate-400" />
                  <span>{language === "bn" ? "লক করা আছে" : "Locked"}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsNidModalOpen(true)}
                  className="rounded-xl bg-[#00695C] hover:bg-[#005247] text-white px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} />
                  <span>
                    {userData?.nid_url_front || userData?.nid_url_back
                      ? (language === "bn" ? "এনআইডি পরিবর্তন করুন" : "Change NID")
                      : p.manageNid}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Rejection notice if rejected */}
          {verificationStatus === "rejected" && userData?.verification_rejection_reason && (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-800 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">{d.rejectionReasonLabel} </strong>
                <span>{userData.verification_rejection_reason}</span>
              </div>
            </div>
          )}

          {/* Uploaded NID Photos Preview */}
          {userData?.nid_url_front || userData?.nid_url_back ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Front Side Photo */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileCheck2 size={14} className="text-[#00695C]" />
                    <span>{language === "bn" ? "এনআইডি সামনের পিঠ" : "NID Front Side"}</span>
                  </span>
                  {(verificationStatus === "pending" || verificationStatus === "approved") && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                      <Lock size={10} />
                      {language === "bn" ? "লক" : "Locked"}
                    </span>
                  )}
                </div>
                <div className="h-44 sm:h-48 w-full rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
                  {userData.nid_url_front ? (
                    <img
                      src={userData.nid_url_front}
                      alt="NID Front"
                      className="h-full w-full object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      {language === "bn" ? "ছবি নেই" : "No image"}
                    </span>
                  )}
                </div>
              </div>

              {/* Back Side Photo */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileCheck2 size={14} className="text-[#00695C]" />
                    <span>{language === "bn" ? "এনআইডি পেছনের পিঠ" : "NID Back Side"}</span>
                  </span>
                  {(verificationStatus === "pending" || verificationStatus === "approved") && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                      <Lock size={10} />
                      {language === "bn" ? "লক" : "Locked"}
                    </span>
                  )}
                </div>
                <div className="h-44 sm:h-48 w-full rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
                  {userData.nid_url_back ? (
                    <img
                      src={userData.nid_url_back}
                      alt="NID Back"
                      className="h-full w-full object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      {language === "bn" ? "ছবি নেই" : "No image"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#00695C] shrink-0">
                  <Shield size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {language === "bn" ? "কোনো এনআইডি আপলোড করা হয়নি" : "No National ID Uploaded Yet"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === "bn"
                      ? "ভেরিফায়েড ব্যাজ ও গ্রাহকদের কাছ থেকে কাজের রিকোয়েস্ট পেতে জাতীয় পরিচয়পত্রের উভয় পিঠ জমা দিন।"
                      : "Upload both sides of your National ID (NID) to verify your account and receive bookings."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNidModalOpen(true)}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00695C] hover:bg-[#005247] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
              >
                <Upload size={14} />
                <span>{language === "bn" ? "এনআইডি জমা দিন" : "Upload NID"}</span>
              </button>
            </div>
          )}
        </section>

        {/* Active Skills Overview */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                {d.skillsList}
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {language === "bn"
                  ? (dashboardData?.skills?.length ?? 0).toLocaleString("bn-BD")
                  : (dashboardData?.skills?.length ?? 0)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsSkillsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-[#00695C] border border-emerald-200 hover:bg-[#00695C] hover:text-white transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>{d.addSkill}</span>
            </button>
          </div>

          {dashboardData?.skills && dashboardData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dashboardData.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <Wrench size={13} className="text-[#00695C]" />
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">{d.noSkillsYet}</p>
          )}
        </section>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00695C] px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#00695C]/25 hover:bg-[#005247] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{p.saving}</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{p.saveChanges}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ============================================================== */}
      {/* 4. MODALS & CONFIRM DIALOGS                                    */}
      {/* ============================================================== */}

      {/* Google Map Picker Modal */}
      <GoogleMapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialLat={formData.latitude}
        initialLng={formData.longitude}
        initialAddress={formData.base_address}
        onConfirmLocation={handleLocationConfirmed}
        language={language}
      />

      {/* NID Verification Modal */}
      <NidVerificationModal
        isOpen={isNidModalOpen}
        onClose={() => setIsNidModalOpen(false)}
        onSuccess={() => {
          showToast(d.nidSubmittedSuccess);
          loadProfileData();
        }}
        userMeData={userData}
        token={token}
      />

      {/* Add Skills Modal */}
      <AddSkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        onSuccess={() => {
          showToast(
            language === "bn"
              ? "নতুন দক্ষতা সফলভাবে যুক্ত হয়েছে!"
              : "Skills added successfully!"
          );
          loadProfileData();
        }}
        existingSkills={dashboardData?.skills || []}
        token={token}
      />

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <LogOut size={26} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {p.logoutBtn}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {p.logoutConfirm}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-1/2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                {c.cancel}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-1/2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
              >
                {p.logoutBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
