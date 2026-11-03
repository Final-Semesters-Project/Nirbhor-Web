"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Camera,
} from "lucide-react";
import {
  fetchUserProfileMe,
  fetchProviderDashboard,
  updateProviderProfile,
  uploadProfilePhotoToCloudinary,
  getAccessToken,
  clearAuthSession,
} from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
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

  // Profile Photo Upload State (Direct Cloudinary Upload)
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState("");
  const [uploadedPhotoPublicId, setUploadedPhotoPublicId] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [savingStatusText, setSavingStatusText] = useState("");
  const fileInputRef = useRef(null);

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

  // Track initial snapshot and dirty states to only send changed fields in PATCH
  const [initialData, setInitialData] = useState(null);
  const [isLocationDirty, setIsLocationDirty] = useState(false);

  // Modals
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isNidModalOpen, setIsNidModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Global Toast Feedback
  const { showToast } = useToast();

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
        const initialProfile = {
          name: me.name || "",
          phone: me.phone || "",
          base_address: me.base_address || "",
          latitude: me.latitude || 23.8103,
          longitude: me.longitude || 90.4125,
          has_smartphone: Boolean(me.has_smartphone),
          is_available: Boolean(me.is_available),
          working_radius_km: Number(me.working_radius_km) || 3,
        };
        setFormData(initialProfile);
        setInitialData(initialProfile);
        setIsLocationDirty(false);

        if (me.photo_url) {
          setPhotoPreview(me.photo_url);
        }
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

  // Sync localized name to formData only on initial load or if user hasn't edited name
  useEffect(() => {
    const locName = getLocalizedName();
    setFormData((prev) => {
      // Don't overwrite if user has actively modified the name
      if (initialData && prev.name !== initialData.name) {
        return prev;
      }
      return {
        ...prev,
        name: locName,
      };
    });
    setInitialData((prev) => (prev ? { ...prev, name: locName } : null));
  }, [getLocalizedName]);

  // Handle Location from Google Maps
  const handleLocationConfirmed = ({ lat, lng, address }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      base_address: address || prev.base_address,
    }));
    setIsLocationDirty(true);
    setIsMapModalOpen(false);
    showToast(
      language === "bn"
        ? "ম্যাপ থেকে অবস্থান সফলভাবে শনাক্ত হয়েছে!"
        : "Location updated from map!"
    );
  };

  // Handle Profile Photo Selection & Instant Cloudinary Upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(
        language === "bn"
          ? "অনুগ্রহ করে শুধু ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।"
          : "Please select a valid image file (JPG, PNG, WebP).",
        "error"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(
        language === "bn"
          ? "ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।"
          : "Image size must be less than 5MB.",
        "error"
      );
      return;
    }

    // Set immediate preview
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    setIsUploadingPhoto(true);
    setSavingStatusText(
      language === "bn"
        ? "ছবি ক্লাউডিনারিতে আপলোড হচ্ছে..."
        : "Uploading profile photo to Cloudinary..."
    );

    try {
      const uploadRes = await uploadProfilePhotoToCloudinary(file, token);
      if (uploadRes?.secure_url) {
        setUploadedPhotoUrl(uploadRes.secure_url);
        setUploadedPhotoPublicId(uploadRes.public_id || "");
        showToast(
          p.photoUploadedSuccess ||
            (language === "bn"
              ? "প্রোফাইল ছবি সফলভাবে আপলোড হয়েছে! পরিবর্তন প্রয়োগ করতে 'সংরক্ষণ করুন' বাটনে চাপ দিন।"
              : "Profile photo uploaded! Click 'Save Changes' to update your profile."),
          "success"
        );
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      showToast(
        err.message ||
          (language === "bn"
            ? "ক্লাউডিনারিতে ছবি আপলোড ব্যর্থ হয়েছে।"
            : "Failed to upload photo to Cloudinary."),
        "error"
      );
      // Revert preview back to existing photo
      setPhotoPreview(userData?.photo_url || null);
      setUploadedPhotoUrl("");
      setUploadedPhotoPublicId("");
    } finally {
      setIsUploadingPhoto(false);
      setSavingStatusText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle Form Submission -> PATCH /api/v1/provider/me/update_profile
  // ONLY sends changed (dirty) fields so location 7-day limit errors are avoided
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (isUploadingPhoto) {
      showToast(
        p.photoUploadingWait ||
          (language === "bn"
            ? "অনুগ্রহ করে অপেক্ষা করুন, ছবি এখনও ক্লাউডিনারিতে আপলোড হচ্ছে..."
            : "Please wait, photo is still uploading to Cloudinary..."),
        "warning"
      );
      return;
    }

    const payload = {};

    // 1. Profile Photo (ONLY if newly uploaded to Cloudinary)
    if (uploadedPhotoUrl) {
      payload.photo_url = uploadedPhotoUrl;
    }
    if (uploadedPhotoPublicId) {
      payload.photo_public_id = uploadedPhotoPublicId;
    }

    // 2. Name (ONLY if edited)
    const trimmedName = (formData.name || "").trim();
    const initialName = (initialData?.name || "").trim();
    if (trimmedName && trimmedName !== initialName) {
      const isBengali = /[\u0980-\u09FF]/.test(trimmedName) || language === "bn";
      if (isBengali) {
        payload.name_bn = trimmedName;
      } else {
        payload.name_en = trimmedName;
      }
      payload.name = trimmedName;
    }

    // 3. Location fields (ONLY if user explicitly picked or edited location)
    if (isLocationDirty) {
      if (!formData.base_address || formData.base_address.trim().length < 5) {
        showToast(
          language === "bn"
            ? "ঠিকানা কমপক্ষে ৫ অক্ষরের হতে হবে।"
            : "Base address must be at least 5 characters.",
          "error"
        );
        return;
      }
      payload.base_address = formData.base_address.trim();
      if (
        formData.latitude != null &&
        formData.longitude != null &&
        formData.latitude !== 0 &&
        formData.longitude !== 0
      ) {
        payload.latitude = Number(formData.latitude);
        payload.longitude = Number(formData.longitude);
      }
    }

    // 4. Working radius (ONLY if changed)
    if (
      initialData &&
      Number(formData.working_radius_km) !== Number(initialData.working_radius_km)
    ) {
      payload.working_radius_km = Number(formData.working_radius_km);
    }

    // 5. Smartphone (ONLY if changed)
    if (
      initialData &&
      Boolean(formData.has_smartphone) !== Boolean(initialData.has_smartphone)
    ) {
      payload.has_smartphone = Boolean(formData.has_smartphone);
    }

    // 6. Availability (ONLY if changed)
    if (
      initialData &&
      Boolean(formData.is_available) !== Boolean(initialData.is_available)
    ) {
      payload.is_available = Boolean(formData.is_available);
    }

    // If no changes made, do not hit backend
    if (Object.keys(payload).length === 0) {
      showToast(
        language === "bn"
          ? "সংরক্ষণ করার মতো কোনো পরিবর্তন পাওয়া যায়নি।"
          : "No changes detected to save.",
        "info"
      );
      return;
    }

    setIsSaving(true);

    try {
      console.log("PATCH /provider/me/update_profile delta payload:", payload);
      const res = await updateProviderProfile(payload, token, language);
      const successMsg =
        res?.message ||
        p?.successSaved ||
        (language === "bn"
          ? "প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!"
          : "Profile details updated successfully!");
      showToast(successMsg, "success");

      // Update name in local storage if updated
      if (payload.name) {
        if (payload.name_bn) localStorage.setItem("user_name_bn", payload.name_bn);
        if (payload.name_en) localStorage.setItem("user_name_en", payload.name_en);
        localStorage.setItem("user_name", payload.name);
      }

      setUploadedPhotoUrl("");
      setUploadedPhotoPublicId("");
      setIsLocationDirty(false);

      await loadProfileData();
    } catch (err) {
      console.warn("Update profile response:", err);
      const errorMsg =
        err?.message ||
        (language === "bn"
          ? "প্রোফাইল আপডেট ব্যর্থ হয়েছে।"
          : "Failed to update profile.");
      showToast(errorMsg, "error");
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
            {/* Hidden Input for Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />

            {/* Clickable Profile Avatar with Upload Hover & Status */}
            <div className="relative group shrink-0">
              <div
                onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
                title={
                  language === "bn"
                    ? "প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন"
                    : "Click to change profile photo"
                }
                className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border-2 ${
                  uploadedPhotoUrl
                    ? "border-amber-400 ring-4 ring-amber-100"
                    : "border-emerald-600/30 shadow-md"
                } bg-slate-100 cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-sm`}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={getLocalizedName()}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-[#00695C] to-emerald-400 flex items-center justify-center text-white text-2xl font-black shadow-md">
                    {getLocalizedName() ? getLocalizedName().charAt(0) : "P"}
                  </div>
                )}

                {/* Uploading Spinner Overlay */}
                {isUploadingPhoto ? (
                  <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                    <Loader2 size={22} className="animate-spin text-white mb-1" />
                    <span className="text-[10px] font-bold text-center px-1 leading-tight">
                      {savingStatusText ||
                        (language === "bn" ? "আপলোড হচ্ছে..." : "Uploading...")}
                    </span>
                  </div>
                ) : (
                  /* Hover overlay on desktop */
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white z-10">
                    <Camera size={20} className="mb-0.5" />
                    <span className="text-[10px] font-bold">
                      {language === "bn" ? "পরিবর্তন" : "Change"}
                    </span>
                  </div>
                )}
              </div>

              {/* Camera Trigger Action Pill (Bottom Left Badge) */}
              <button
                type="button"
                disabled={isUploadingPhoto}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title={language === "bn" ? "ছবি নির্বাচন করুন" : "Pick new photo"}
                className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 hover:text-[#00695C] transition-all cursor-pointer z-20"
              >
                <Camera size={14} className="text-[#00695C]" />
              </button>

              {/* Availability Indicator (Bottom Right Badge) */}
              <div
                className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white shadow-sm z-20 ${
                  formData.is_available ? "bg-[#00695C]" : "bg-slate-400"
                }`}
                title={formData.is_available ? "Available" : "Busy"}
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

              {/* Unsaved uploaded photo status message */}
              {uploadedPhotoUrl && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>
                    {language === "bn"
                      ? "নতুন ছবি ক্লাউডিনারিতে আপলোড হয়েছে। প্রোফাইল আপডেট করতে নিচে 'পরিবর্তন সংরক্ষণ করুন' বাটনে চাপ দিন।"
                      : "Photo uploaded to Cloudinary! Click 'Save Changes' below to update profile."}
                  </span>
                </div>
              )}

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

              {/* Text button to change photo for direct accessibility */}
              <button
                type="button"
                disabled={isUploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#00695C] hover:text-[#005247] hover:underline cursor-pointer disabled:opacity-50"
              >
                <Camera size={13} />
                <span>
                  {userData?.photo_url || photoPreview
                    ? language === "bn"
                      ? "প্রোফাইল ছবি পরিবর্তন করুন"
                      : "Change Profile Photo"
                    : language === "bn"
                    ? "প্রোফাইল ছবি আপলোড করুন"
                    : "Upload Profile Photo"}
                </span>
              </button>
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
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={p.fullName}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
              />
              <span className="mt-1 block text-[11px] text-slate-400">
                {language === "bn"
                  ? "নাম পরিবর্তন করতে পারেন (সংরক্ষণ বাটনে চাপলে কার্যকর হবে)।"
                  : "Edit your displayed provider name."}
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
                  value={formData.base_address}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      base_address: e.target.value,
                    }));
                    setIsLocationDirty(true);
                  }}
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
              <div
                className={`p-3.5 rounded-xl bg-white border ${
                  isLocationDirty
                    ? "border-amber-300 ring-2 ring-amber-100"
                    : "border-emerald-200"
                } flex items-start gap-3 shadow-2xs mt-2.5`}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${
                    isLocationDirty
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-[#00695C]"
                  } flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === "bn" ? "নির্ধারিত অবস্থান" : "Confirmed Location"}
                    </p>
                    {isLocationDirty && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                        {language === "bn" ? "পরিবর্তিত অবস্থান" : "Modified"}
                      </span>
                    )}
                  </div>
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
