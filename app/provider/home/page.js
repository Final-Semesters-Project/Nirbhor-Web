"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Loader2,
  AlertTriangle,
  Upload,
  User,
  ExternalLink,
} from "lucide-react";
import {
  fetchProviderDashboard,
  fetchUserProfileMe,
  updateProviderAvailability,
  updateProviderWorkingRadius,
  removeProviderSkill,
  fetchProviderIncomingBookings,
  fetchProviderCompletedBookings,
  getAccessToken,
  clearAuthSession,
} from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import NidVerificationModal from "@/components/provider/NidVerificationModal";
import AddSkillsModal from "@/components/provider/AddSkillsModal";
import BookingDetailModal from "@/components/provider/BookingDetailModal";

export default function ProviderHomePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const d = t.dashboard;
  const c = t.common;

  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Dashboard & User Me Data
  const [dashboardData, setDashboardData] = useState(null);
  const [userMeData, setUserMeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Interactive controls
  const [isAvailable, setIsAvailable] = useState(true);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  const [workRadius, setWorkRadius] = useState(5);
  const [lastConfirmedRadius, setLastConfirmedRadius] = useState(5);
  const [isUpdatingRadius, setIsUpdatingRadius] = useState(false);

  // Bookings tabs: 'active' | 'completed'
  const [activeTab, setActiveTab] = useState("active");

  const [activeBookings, setActiveBookings] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [activeHasNext, setActiveHasNext] = useState(false);
  const [activeTotal, setActiveTotal] = useState(0);
  const [isLoadingActive, setIsLoadingActive] = useState(false);
  const [isLoadingMoreActive, setIsLoadingMoreActive] = useState(false);

  const [completedBookings, setCompletedBookings] = useState([]);
  const [completedTotal, setCompletedTotal] = useState(0);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false);

  // Modals
  const [isNidModalOpen, setIsNidModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Global Toast
  const { showToast } = useToast();

  // 1. Initial Auth Check
  useEffect(() => {
    const savedToken = getAccessToken();
    setToken(savedToken);
    setIsInitializing(false);
  }, []);

  // 2. Fetch Dashboard & User Data
  const loadDashboardData = useCallback(
    async (showLoading = true) => {
      if (!token) return;
      if (showLoading) setIsLoading(true);

      try {
        // Fetch dashboard data
        const dash = await fetchProviderDashboard(token, language);
        setDashboardData(dash);
        if (dash) {
          setIsAvailable(Boolean(dash.is_available));
          if (dash.working_radius_km) {
            const clamped = Math.min(Math.max(Number(dash.working_radius_km), 1), 5);
            setWorkRadius(clamped);
            setLastConfirmedRadius(clamped);
          }
        }

        // Fetch /users/me for verification status & rejection reason
        const me = await fetchUserProfileMe(token, language);
        setUserMeData(me);
      } catch (err) {
        console.error("Error fetching provider data:", err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [token, language]
  );

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, loadDashboardData]);

  // 3. Fetch Active Bookings
  const loadActiveBookings = useCallback(
    async (page = 1, append = false) => {
      if (!token) return;
      if (append) {
        setIsLoadingMoreActive(true);
      } else {
        setIsLoadingActive(true);
      }

      try {
        const response = await fetchProviderIncomingBookings(
          { page, pageSize: 20 },
          token,
          language
        );

        let items = [];
        let total = 0;
        let hasNext = false;

        if (response && Array.isArray(response.items)) {
          items = response.items;
          total = response.total ?? items.length;
          hasNext = Boolean(response.has_next);
        } else if (Array.isArray(response)) {
          items = response;
          total = items.length;
          hasNext = false;
        }

        if (append) {
          setActiveBookings((prev) => [...prev, ...items]);
        } else {
          setActiveBookings(items);
        }

        setActiveTotal(total);
        setActiveHasNext(hasNext);
        setActivePage(page);
      } catch (err) {
        console.error("Error loading active bookings:", err);
      } finally {
        setIsLoadingActive(false);
        setIsLoadingMoreActive(false);
      }
    },
    [token, language]
  );

  // 4. Fetch Completed Bookings
  const loadCompletedBookings = useCallback(async () => {
    if (!token) return;
    setIsLoadingCompleted(true);
    try {
      const response = await fetchProviderCompletedBookings(token, language);
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && Array.isArray(response.items)) {
        items = response.items;
      }
      setCompletedBookings(items);
      setCompletedTotal(items.length);
    } catch (err) {
      console.error("Error loading completed bookings:", err);
    } finally {
      setIsLoadingCompleted(false);
    }
  }, [token, language]);

  useEffect(() => {
    if (token) {
      if (activeTab === "active") {
        loadActiveBookings(1, false);
      } else {
        loadCompletedBookings();
      }
    }
  }, [token, activeTab, loadActiveBookings, loadCompletedBookings]);

  // Handlers for controls
  const handleToggleAvailability = async () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    setIsUpdatingAvailability(true);

    try {
      await updateProviderAvailability(nextVal, token, language);
      showToast(
        nextVal
          ? language === "bn"
            ? "আপনার প্রোফাইল এখন কাজের জন্য সক্রিয়!"
            : "You are now available for jobs!"
          : language === "bn"
          ? "আপনার প্রোফাইল বর্তমানে ব্যস্ত হিসেবে নির্ধারিত হয়েছে।"
          : "You are currently set to busy."
      );
    } catch (err) {
      console.error("Failed to update availability:", err);
      setIsAvailable(!nextVal); // revert
      showToast(err.message || "Failed to update availability", "error");
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleRadiusChange = async (newVal) => {
    const previous = lastConfirmedRadius;
    const clamped = Math.min(Math.max(Number(newVal), 1), 5);
    setWorkRadius(clamped);
    setIsUpdatingRadius(true);

    try {
      await updateProviderWorkingRadius(clamped, token, language);
      setLastConfirmedRadius(clamped);
      showToast(
        language === "bn"
          ? `কাজের পরিধি ${clamped.toLocaleString("bn-BD")} কিমিতে আপডেট করা হয়েছে`
          : `Working radius updated to ${clamped} KM`
      );
    } catch (err) {
      console.warn("Radius update response:", err?.message || err);
      // Automatically revert back to what it was before
      setWorkRadius(previous);
      showToast(err.message || "Radius update limit reached", "error");
    } finally {
      setIsUpdatingRadius(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await removeProviderSkill(skillId, token, language);
      showToast(d.skillRemoved);
      loadDashboardData(false);
    } catch (err) {
      console.error("Failed to remove skill:", err);
      showToast(err.message || "Failed to remove skill", "error");
    }
  };

  const openBookingDetail = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsDetailModalOpen(true);
  };

  const verificationStatus =
    userMeData?.verification_status ||
    (dashboardData?.verification_level === "verified" ? "approved" : "not_initiated");

  const verificationLevel =
    userMeData?.verification_level || dashboardData?.verification_level || "basic";

  const rejectionReason = userMeData?.verification_rejection_reason || "";

  // If user is not authenticated, prompt nicely
  if (!isInitializing && !token) {
    return (
      <div className="min-h-screen bg-[#F1F5F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#00695C] mb-4">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {language === "bn"
              ? "সেবাদাতা অ্যাকাউন্টে লগইন করুন"
              : "Provider Login Required"}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {language === "bn"
              ? "আপনার সেবাদাতা ড্যাশবোর্ড এবং কাজের তথ্য দেখতে অনুগ্রহ করে লগইন করুন।"
              : "Please log in to view your provider dashboard and manage your bookings."}
          </p>
          <Link
            href="/auth"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#00695C] py-3 text-sm font-bold text-white shadow-md shadow-[#00695C]/25 hover:bg-[#005247] transition-all"
          >
            {t.auth.tabLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F5] pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & TECHNICIAN STATUS BAR                         */}
      {/* ============================================================== */}
      <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar & Technician Meta */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0">
              {dashboardData?.photo_url ? (
                <img
                  src={dashboardData.photo_url}
                  alt={dashboardData?.name || "Provider"}
                  className="h-full w-full rounded-2xl object-cover border-2 border-emerald-600/30 shadow-md bg-slate-100"
                />
              ) : (
                <div className="h-full w-full rounded-2xl bg-gradient-to-tr from-[#00695C] to-emerald-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {dashboardData?.name ? dashboardData.name.charAt(0) : "P"}
                </div>
              )}
              <div
                className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white shadow-sm ${
                  isAvailable ? "bg-[#00695C]" : "bg-slate-400"
                }`}
              >
                {isAvailable ? <Zap size={12} fill="currentColor" /> : <Clock size={12} />}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {dashboardData?.name || userMeData?.name || (language === "bn" ? "সেবাদাতা" : "Technician")}
                </h1>

                {/* Verification Badge */}
                {verificationStatus === "approved" || verificationLevel === "verified" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#00695C] border border-emerald-200">
                    <ShieldCheck size={13} className="text-[#00695C]" />
                    <span>{d.verifiedBadge}</span>
                  </span>
                ) : verificationStatus === "pending" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                    <Clock size={13} className="text-amber-600" />
                    <span>{d.pendingBadge}</span>
                  </span>
                ) : verificationStatus === "rejected" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200">
                    <AlertTriangle size={13} className="text-red-600" />
                    <span>{d.rejectedBadge}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                    <span>{verificationLevel.toUpperCase()}</span>
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {userMeData?.base_address && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[#00695C]" />
                    {userMeData.base_address}
                  </span>
                )}
                {userMeData?.phone && (
                  <span className="font-mono text-slate-600">
                    {userMeData.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Availability Toggle & Quick Actions */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Availability Toggle */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 shadow-sm">
              <div className="text-left">
                <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  {language === "bn" ? "কাজের অবস্থা" : "Work Status"}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isAvailable ? "text-[#00695C]" : "text-slate-500"
                  }`}
                >
                  {isAvailable ? d.statusAvailable : d.statusBusy}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={isUpdatingAvailability}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? "bg-[#00695C]" : "bg-slate-300"
                } disabled:opacity-50`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* NID VERIFICATION NOTICE / BANNER                            */}
        {/* ============================================================ */}
        {verificationStatus === "rejected" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-xs text-red-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-900 block text-sm">
                  {d.rejectedBadge}
                </span>
                <p className="mt-0.5 text-red-700">
                  <strong className="font-semibold">{d.rejectionReasonLabel} </strong>
                  {rejectionReason || d.rejectedDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNidModalOpen(true)}
              className="shrink-0 self-start sm:self-auto rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors flex items-center gap-1.5"
            >
              <Upload size={14} />
              <span>{d.reuploadNidBtn}</span>
            </button>
          </div>
        ) : verificationStatus === "pending" ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3 animate-in fade-in">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950 block text-sm">
                {d.pendingBadge}
              </span>
              <p className="mt-0.5 text-amber-800">{d.pendingDesc}</p>
            </div>
          </div>
        ) : verificationStatus === "not_initiated" ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-[#00695C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#00695C] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {d.notInitiatedBadge}
                </span>
                <p className="mt-0.5 text-slate-600">{d.notInitiatedDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNidModalOpen(true)}
              className="shrink-0 self-start sm:self-auto rounded-xl bg-[#00695C] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#00695C]/20 hover:bg-[#005247] transition-all flex items-center gap-1.5"
            >
              <Upload size={14} />
              <span>{d.uploadNidBtn}</span>
            </button>
          </div>
        ) : null}
      </section>

      {/* ============================================================== */}
      {/* 2. STATS & WORKING RADIUS GRID                                */}
      {/* ============================================================== */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Jobs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00695C] shadow-sm">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400">
              {d.totalJobs}
            </span>
            <span className="text-2xl font-black text-slate-900">
              {language === "bn"
                ? (dashboardData?.total_jobs_done ?? 0).toLocaleString("bn-BD")
                : (dashboardData?.total_jobs_done ?? 0)}
            </span>
          </div>
        </div>

        {/* Metric 2: Customer Rating */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-sm">
            <Star size={22} fill="currentColor" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400">
              {d.rating}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {dashboardData?.average_rating != null
                  ? Number(dashboardData.average_rating).toFixed(1)
                  : "5.0"}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Working Radius Slider */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1.5">
              <Sliders size={14} className="text-[#00695C]" />
              {d.workRadius}
            </span>
            <span className="font-black text-[#00695C] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {language === "bn"
                ? `${workRadius.toLocaleString("bn-BD")} কিমি`
                : `${workRadius} KM`}
            </span>
          </div>

          {/* Slider with custom green accent */}
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={workRadius}
            disabled={isUpdatingRadius}
            onChange={(e) => handleRadiusChange(e.target.value)}
            className="w-full accent-[#00695C] cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>{language === "bn" ? "১ কিমি" : "1 KM"}</span>
            <span>{language === "bn" ? "৩ কিমি" : "3 KM"}</span>
            <span>{language === "bn" ? "৫ কিমি" : "5 KM"}</span>
          </div>
        </div>
      </div>

      {/* AI Performance Summary if available */}
      {dashboardData?.ai_review_summary && (
        <section className="mb-6 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white p-5 shadow-sm flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00695C] text-white shrink-0 shadow-md shadow-[#00695C]/20">
            <Sparkles size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[#00695C] uppercase tracking-wider">
              {d.aiSummary}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {dashboardData.ai_review_summary}
            </p>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 3. ACTIVE SKILLS MANAGEMENT                                    */}
      {/* ============================================================== */}
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-[#00695C] border border-emerald-200 hover:bg-[#00695C] hover:text-white transition-all shadow-sm"
          >
            <Plus size={14} />
            <span>{d.addSkill}</span>
          </button>
        </div>

        {/* Skills Chips */}
        {dashboardData?.skills && dashboardData.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dashboardData.skills.map((skill) => (
              <div
                key={skill.id}
                className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-semibold text-slate-800 transition-all hover:border-emerald-300 hover:bg-emerald-50/30"
              >
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  title={c.cancel}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">{d.noSkillsYet}</p>
        )}
      </section>

      {/* ============================================================== */}
      {/* 4. BOOKINGS SECTION (ACTIVE & COMPLETED TABS)                  */}
      {/* ============================================================== */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        {/* Tab Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "active"
                  ? "bg-[#00695C] text-white shadow-md shadow-[#00695C]/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {d.activeBookingsTab} ({language === "bn" ? activeTotal.toLocaleString("bn-BD") : activeTotal})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "completed"
                  ? "bg-[#00695C] text-white shadow-md shadow-[#00695C]/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {d.completedBookingsTab} ({language === "bn" ? completedTotal.toLocaleString("bn-BD") : completedTotal})
            </button>
          </div>
        </div>

        {/* Tab 1: Active Bookings */}
        {activeTab === "active" && (
          <div>
            {isLoadingActive ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={28} className="animate-spin text-[#00695C]" />
                <span className="text-xs">{c.loading}</span>
              </div>
            ) : activeBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Briefcase size={36} className="mx-auto mb-2 text-slate-300" />
                <p>{d.noActiveBookings}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((b) => (
                  <div
                    key={b.booking_id}
                    onClick={() => openBookingDetail(b.booking_id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-emerald-300 hover:bg-white transition-all cursor-pointer shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {b.other_party_name || d.customer}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                          {d.statusInProgress}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {b.skill_name}
                        </span>
                        {b.other_party_phone && (
                          <span className="font-mono">{b.other_party_phone}</span>
                        )}
                        {b.work_schedule && (
                          <span className="flex items-center gap-1 text-amber-700">
                            <Clock size={12} />
                            {new Date(b.work_schedule).toLocaleDateString(
                              language === "bn" ? "bn-BD" : "en-US",
                              { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingDetail(b.booking_id);
                      }}
                      className="self-start sm:self-auto rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                    >
                      <span>{d.viewDetails}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}

                {/* Load More Button */}
                {activeHasNext && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => loadActiveBookings(activePage + 1, true)}
                      disabled={isLoadingMoreActive}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-[#00695C] hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                      {isLoadingMoreActive ? c.loading : d.loadMoreBtn}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Completed Bookings */}
        {activeTab === "completed" && (
          <div>
            {isLoadingCompleted ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={28} className="animate-spin text-[#00695C]" />
                <span className="text-xs">{c.loading}</span>
              </div>
            ) : completedBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 size={36} className="mx-auto mb-2 text-slate-300" />
                <p>{d.noCompletedBookings}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedBookings.map((b) => (
                  <div
                    key={b.booking_id}
                    onClick={() => openBookingDetail(b.booking_id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-emerald-300 hover:bg-white transition-all cursor-pointer shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {b.other_party_name || d.customer}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#00695C] border border-emerald-200">
                          {d.statusCompleted}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">
                          {b.skill_name}
                        </span>
                        {b.created_at && (
                          <span>
                            {new Date(b.created_at).toLocaleDateString(
                              language === "bn" ? "bn-BD" : "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingDetail(b.booking_id);
                      }}
                      className="self-start sm:self-auto rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                    >
                      <span>{d.viewDetails}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 5. MODALS INTEGRATION                                          */}
      {/* ============================================================== */}

      {/* NID Verification & Rejection Modal */}
      <NidVerificationModal
        isOpen={isNidModalOpen}
        onClose={() => setIsNidModalOpen(false)}
        onSuccess={() => {
          showToast(d.nidSubmittedSuccess);
          loadDashboardData(false);
        }}
        userMeData={userMeData}
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
          loadDashboardData(false);
        }}
        existingSkills={dashboardData?.skills || []}
        token={token}
      />

      {/* Booking Details Modal */}
      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBookingId(null);
        }}
        bookingId={selectedBookingId}
        token={token}
      />
    </div>
  );
}
