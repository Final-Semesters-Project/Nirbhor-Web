"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Award,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Check,
  AlertCircle,
  MapPin,
  Navigation,
  Globe,
  Sliders,
  Smartphone,
  Wrench,
  Compass,
  ChevronDown,
  ChevronUp,
  Hammer,
  Truck,
  Layers,
  X,
} from "lucide-react";
import Brand from "@/components/Brand";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/LanguageContext";
import {
  loginUser,
  registerProviderAccount,
  fetchCategories,
  fetchSkillsByCategory,
  FALLBACK_CATEGORIES,
  FALLBACK_SKILLS_BY_CATEGORY,
} from "@/lib/api";
import { saveAuthSession } from "@/lib/auth";

export default function AuthScreen({ initialMode = "register" }) {
  const router = useRouter();
  const { language, setLanguage, t, isMounted } = useLanguage();
  const [mode, setMode] = useState(initialMode); // 'register' or 'login'

  // ==========================================
  // PROVIDER REGISTRATION STATE
  // ==========================================
  const [regData, setRegData] = useState({
    name_en: "",
    name_bn: "",
    phone: "",
    password: "",
    preferred_lang: "bn",
    skill_ids: [4], // default Electrician (category 2)
    latitude: 23.8103, // default Dhaka center
    longitude: 90.4125,
    working_radius_km: 3,
    has_smartphone: true,
    base_address: "",
    agreeTerms: true,
  });

  // Sync preferred_lang with global language on change
  useEffect(() => {
    setRegData((prev) => ({
      ...prev,
      preferred_lang: language,
    }));
  }, [language]);

  // ==========================================
  // CATEGORIES & SKILLS STATE
  // ==========================================
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySkills, setCategorySkills] = useState(FALLBACK_SKILLS_BY_CATEGORY);
  const [loadingSkillsMap, setLoadingSkillsMap] = useState({});
  // Expanded category IDs (multi-open supported, defaults to category 2: Home Repairs)
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([2]);

  // Load categories and initial skills from backend API
  useEffect(() => {
    let isCancelled = false;

    async function loadCategoriesAndInitialSkills() {
      setLoadingCategories(true);
      try {
        const catList = await fetchCategories(language);
        if (!isCancelled && Array.isArray(catList) && catList.length > 0) {
          setCategories(catList);

          // Fetch skills for categories
          for (const cat of catList) {
            loadSkillsForCategory(cat.id, language);
          }
        }
      } catch (err) {
        console.warn("Failed to load categories:", err);
      } finally {
        if (!isCancelled) setLoadingCategories(false);
      }
    }

    loadCategoriesAndInitialSkills();
    return () => {
      isCancelled = true;
    };
  }, [language]);

  // Helper to load skills for a specific category
  const loadSkillsForCategory = async (catId, currentLang = language) => {
    setLoadingSkillsMap((prev) => ({ ...prev, [catId]: true }));
    try {
      const skills = await fetchSkillsByCategory(catId, currentLang);
      setCategorySkills((prev) => ({
        ...prev,
        [catId]: skills,
      }));
    } catch (err) {
      console.warn(`Failed loading skills for category ${catId}:`, err);
    } finally {
      setLoadingSkillsMap((prev) => ({ ...prev, [catId]: false }));
    }
  };

  // Toggle category open/collapse
  const toggleCategory = (catId) => {
    setExpandedCategoryIds((prev) => {
      if (prev.includes(catId)) {
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });

    if (!categorySkills[catId] || categorySkills[catId].length === 0) {
      loadSkillsForCategory(catId);
    }
  };

  // Category Icon helper
  const getCategoryIcon = (catId, catName = "") => {
    const name = String(catName).toLowerCase();
    if (catId === 1 || name.includes("manual") || name.includes("শ্রম")) {
      return <Hammer size={16} />;
    }
    if (catId === 2 || name.includes("repair") || name.includes("মেরামত")) {
      return <Wrench size={16} />;
    }
    if (catId === 3 || name.includes("clean") || name.includes("পরিষ্কার")) {
      return <Sparkles size={16} />;
    }
    if (catId === 4 || name.includes("transport") || name.includes("পরিবহন")) {
      return <Truck size={16} />;
    }
    return <Layers size={16} />;
  };

  // Toggle skill selection (multi-select across categories)
  const handleToggleSkill = (skillId) => {
    setRegData((prev) => {
      const exists = prev.skill_ids.includes(skillId);
      if (exists) {
        if (prev.skill_ids.length === 1) {
          // Keep at least one skill selected
          return prev;
        }
        return {
          ...prev,
          skill_ids: prev.skill_ids.filter((id) => id !== skillId),
        };
      } else {
        return {
          ...prev,
          skill_ids: [...prev.skill_ids, skillId],
        };
      }
    });
  };

  // Helper to get all loaded skills for summary chips
  const getAllLoadedSkills = () => {
    const map = new Map();
    Object.values(categorySkills).forEach((skills) => {
      if (Array.isArray(skills)) {
        skills.forEach((s) => map.set(s.id, s));
      }
    });
    // Add fallbacks if any missing
    Object.values(FALLBACK_SKILLS_BY_CATEGORY).forEach((skills) => {
      skills.forEach((s) => {
        if (!map.has(s.id)) {
          map.set(s.id, {
            id: s.id,
            name: language === "bn" ? s.name_bn : s.name,
            category_id: s.category_id,
          });
        }
      });
    });
    return Array.from(map.values());
  };

  const allSkillsList = getAllLoadedSkills();

  // ==========================================
  // LOGIN STATE
  // ==========================================
  const [loginData, setLoginData] = useState({
    username: "01800000001",
    password: "password123",
    rememberMe: true,
  });

  // Common UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Location detection state
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-slate-200" };
    if (pwd.length < 8) {
      return {
        score: 1,
        label: t.register?.passwordStrengthWeak || "Weak",
        color: "bg-rose-500",
      };
    }
    if (pwd.length < 12) {
      return {
        score: 2,
        label: t.register?.passwordStrengthMedium || "Medium",
        color: "bg-amber-500",
      };
    }
    return {
      score: 3,
      label: t.register?.passwordStrengthStrong || "Strong",
      color: "bg-emerald-600",
    };
  };

  const strength = getPasswordStrength(regData.password);

  // Browser Geolocation Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice(
        language === "bn"
          ? "আপনার ব্রাউজার জিপিএস সমর্থন করে না।"
          : "Geolocation is not supported by your browser."
      );
      return;
    }

    setDetectingLocation(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lon = Number(position.coords.longitude.toFixed(6));
        setRegData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
        }));
        setDetectingLocation(false);
        setLocationNotice(
          language === "bn"
            ? `অবস্থান শনাক্ত হয়েছে: ${lat}, ${lon}`
            : `Location detected: ${lat}, ${lon}`
        );
      },
      (error) => {
        setDetectingLocation(false);
        console.warn("GPS detection error:", error);
        setLocationNotice(
          language === "bn"
            ? "জিপিএস অবস্থান নেওয়া যায়নি। ডিফল্ট মান ব্যবহার করা হয়েছে।"
            : "Could not retrieve GPS location. Default coordinates applied."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ==========================================
  // SUBMIT: PROVIDER REGISTRATION
  // ==========================================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!regData.name_en.trim()) {
      setStatusMessage({
        type: "error",
        text: t.register?.errors?.nameEnRequired || "Please enter your name in English.",
      });
      return;
    }

    if (!regData.name_bn.trim()) {
      setStatusMessage({
        type: "error",
        text: t.register?.errors?.nameBnRequired || "Please enter your name in Bangla.",
      });
      return;
    }

    const phonePattern = /^01[3-9]\d{8}$/;
    if (!phonePattern.test(regData.phone.trim())) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.phoneInvalid ||
          "Please enter a valid 11-digit Bangladeshi mobile number (013-019).",
      });
      return;
    }

    if (regData.password.length < 8) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.passwordTooShort ||
          "Password must be at least 8 characters long.",
      });
      return;
    }

    if (!regData.skill_ids || regData.skill_ids.length === 0) {
      setStatusMessage({
        type: "error",
        text: t.register?.errors?.skillRequired || "Please select at least one skill.",
      });
      return;
    }

    if (regData.working_radius_km < 1 || regData.working_radius_km > 5) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.radiusInvalid ||
          "Working radius must be between 1 and 5 km.",
      });
      return;
    }

    if (regData.base_address && regData.base_address.trim().length < 5) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.addressMinLength ||
          "Base address must be at least 5 characters.",
      });
      return;
    }

    if (!regData.agreeTerms) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.termsRequired ||
          "Please agree to the Terms of Service.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await registerProviderAccount({
        name_en: regData.name_en,
        name_bn: regData.name_bn,
        phone: regData.phone,
        password: regData.password,
        preferred_lang: regData.preferred_lang || language,
        skill_ids: regData.skill_ids,
        latitude: regData.latitude,
        longitude: regData.longitude,
        working_radius_km: regData.working_radius_km,
        has_smartphone: regData.has_smartphone,
        base_address: regData.base_address || null,
      });

      saveAuthSession(response);

      setStatusMessage({
        type: "success",
        text:
          t.register?.successMessage ||
          "Provider registered successfully! Redirecting...",
      });

      setTimeout(() => {
        router.push("/provider/home");
      }, 1000);
    } catch (error) {
      console.error("Provider registration error:", error);
      setStatusMessage({
        type: "error",
        text: error.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SUBMIT: LOGIN
  // ==========================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!loginData.username.trim()) {
      setStatusMessage({
        type: "error",
        text: t.login?.errors?.phoneRequired || "Please enter your phone number.",
      });
      return;
    }

    if (!loginData.password) {
      setStatusMessage({
        type: "error",
        text: t.login?.errors?.passwordRequired || "Please enter your password.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        username: loginData.username,
        password: loginData.password,
      });

      saveAuthSession(response);

      setStatusMessage({
        type: "success",
        text: t.login?.successMessage || "Login successful! Redirecting...",
      });

      setTimeout(() => {
        router.push("/provider/home");
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      setStatusMessage({
        type: "error",
        text: error.message || "Invalid login credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fill Seed Demo Account
  const fillDemoAccount = () => {
    setLoginData({
      username: "01800000001",
      password: "password123",
      rememberMe: true,
    });
    setStatusMessage(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Outer Shell Card */}
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* ============================================================== */}
        {/* LEFT COLUMN: HERO & TRUST BRANDING                             */}
        {/* ============================================================== */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00382E] via-[#005448] to-[#00695C] p-6 sm:p-9 text-white lg:col-span-5">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl pointer-events-none" />

          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-emerald-100 shadow-sm">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>{t.hero?.badge || "Nirbhor Trust Portal"}</span>
            </div>

            <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {t.hero?.title || "Join the Trusted Skill Network."}
            </h1>

            <p className="mt-3.5 text-xs sm:text-sm text-emerald-50/90 leading-relaxed font-normal">
              {t.hero?.desc ||
                "Connect with thousands of local opportunities and build your verified reputation within our community."}
            </p>

            <div className="mt-6 space-y-2.5 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-100">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={12} strokeWidth={2.5} />
                </div>
                <span>{t.hero?.perk1 || "100% Verified Identity & Trust Score"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-emerald-100">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={12} strokeWidth={2.5} />
                </div>
                <span>{t.hero?.perk2 || "Guaranteed local leads matched to your radius"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-emerald-100">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={12} strokeWidth={2.5} />
                </div>
                <span>{t.hero?.perk3 || "Fast payouts via bKash, Nagad & Bank"}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15">
              <div className="flex items-center gap-2 text-emerald-200">
                <Users size={18} />
                <span className="text-xl font-black text-white">
                  {t.hero?.stat1Number || "50k+"}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-emerald-100 leading-tight">
                {t.hero?.stat1Label || "Active Providers"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15">
              <div className="flex items-center gap-2 text-emerald-200">
                <Award size={18} />
                <span className="text-xl font-black text-white">
                  {t.hero?.stat2Number || "Verified"}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-emerald-100 leading-tight">
                {t.hero?.stat2Label || "Trust Portal"}
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: AUTH FORM                                        */}
        {/* ============================================================== */}
        <section className="flex flex-col justify-between p-5 sm:p-8 lg:p-9 lg:col-span-7 bg-white max-h-[92vh] overflow-y-auto">
          <div className="mx-auto w-full max-w-lg">
            {/* Top Language Toggle Prompt */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-slate-50 p-2.5 sm:p-3 border border-emerald-100/90 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00695C]/10 text-[#00695C]">
                  <Globe size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-none">
                    {t.auth?.langChangePrompt || "Language / ভাষা:"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {language === "bn" ? "বাংলা সক্রিয় (Bangla Active)" : "English Active"}
                  </p>
                </div>
              </div>

              <LanguageToggle />
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mb-6 flex rounded-2xl bg-slate-100/90 p-1 border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setStatusMessage(null);
                }}
                className={`flex-1 rounded-xl py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-[#00695C] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.auth?.tabRegister || "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setStatusMessage(null);
                }}
                className={`flex-1 rounded-xl py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[#00695C] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.auth?.tabLogin || "Log In"}
              </button>
            </div>

            {/* Status Feedback Message */}
            {statusMessage && (
              <div
                className={`mb-5 flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-semibold border transition-all animate-in fade-in slide-in-from-top-2 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-rose-50 text-rose-800 border-rose-300"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{statusMessage.text}</span>
              </div>
            )}

            {/* ========================================================== */}
            {/* REGISTER MODE FORM                                         */}
            {/* ========================================================== */}
            {mode === "register" ? (
              <div>
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      POST /api/v1/auth/register/provider
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                    {t.auth?.registerTitle || "Provider Registration"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    {t.auth?.registerSubtitle ||
                      "Join as a verified service provider in your area."}
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Row 1: English & Bangla Full Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.register?.nameEnLabel || "Full Name (English)"}
                        <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <User size={15} />
                        </div>
                        <input
                          type="text"
                          required
                          value={regData.name_en}
                          onChange={(e) =>
                            setRegData({ ...regData, name_en: e.target.value })
                          }
                          placeholder={t.register?.nameEnPlaceholder || "e.g. Rahim Ahmed"}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t.register?.nameEnHint || "English letters"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.register?.nameBnLabel || "Full Name (Bangla)"}
                        <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <User size={15} />
                        </div>
                        <input
                          type="text"
                          required
                          value={regData.name_bn}
                          onChange={(e) =>
                            setRegData({ ...regData, name_bn: e.target.value })
                          }
                          placeholder={t.register?.nameBnPlaceholder || "যেমন: রহিম আহমেদ"}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t.register?.nameBnHint || "বাংলা বানান"}
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Phone & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.register?.phoneLabel || "Mobile Number"}
                        <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Phone size={15} />
                        </div>
                        <input
                          type="tel"
                          required
                          value={regData.phone}
                          onChange={(e) =>
                            setRegData({ ...regData, phone: e.target.value })
                          }
                          placeholder={t.register?.phonePlaceholder || "01712345678"}
                          maxLength={11}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t.register?.phoneHint || "11 digits starting with 01"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          {t.register?.passwordLabel || "Password"}
                          <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        {regData.password && (
                          <span className="text-[10px] font-bold text-slate-500">
                            {strength.label}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Lock size={15} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={regData.password}
                          onChange={(e) =>
                            setRegData({ ...regData, password: e.target.value })
                          }
                          placeholder={t.register?.passwordPlaceholder || "Min 8 characters"}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-10 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {regData.password && (
                        <div className="mt-1 flex gap-1">
                          <div
                            className={`h-1 flex-1 rounded-full ${
                              strength.score >= 1 ? strength.color : "bg-slate-200"
                            }`}
                          />
                          <div
                            className={`h-1 flex-1 rounded-full ${
                              strength.score >= 2 ? strength.color : "bg-slate-200"
                            }`}
                          />
                          <div
                            className={`h-1 flex-1 rounded-full ${
                              strength.score >= 3 ? strength.color : "bg-slate-200"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Preferred Language & Smartphone Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.register?.preferredLangLabel || "Preferred Language"}
                        <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <select
                        value={regData.preferred_lang}
                        onChange={(e) =>
                          setRegData({ ...regData, preferred_lang: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all cursor-pointer font-medium"
                      >
                        <option value="bn">বাংলা (Bangla)</option>
                        <option value="en">English (ইংরেজি)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Smartphone size={14} className="text-[#00695C]" />
                        <span>{t.register?.smartphoneQuestion || "Has Smartphone?"}</span>
                      </label>
                      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setRegData({ ...regData, has_smartphone: true })}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            regData.has_smartphone
                              ? "bg-[#00695C] text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {t.register?.smartphoneYes || "Yes / আছে"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegData({ ...regData, has_smartphone: false })}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            !regData.has_smartphone
                              ? "bg-slate-700 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {t.register?.smartphoneNo || "No / নেই"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* HIERARCHICAL CATEGORY & SKILLS SECTION                    */}
                  {/* Category List (2 per row) -> Click to open skills below  */}
                  {/* ======================================================== */}
                  <div className="pt-2 border-t border-slate-200 space-y-2.5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Wrench size={14} className="text-[#00695C]" />
                        <span>{t.register?.skillsSectionTitle || "Skills & Specialization"}</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                        {regData.skill_ids.length} {t.register?.skillsSelectedCount || "selected"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {t.register?.categoriesSubtitle ||
                        "Click a category to open its skills below (2 per row)"}
                    </p>

                    {/* CATEGORY GRID: 2 Categories per row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {categories.map((cat) => {
                        const isExpanded = expandedCategoryIds.includes(cat.id);
                        const catSkills = categorySkills[cat.id] || [];
                        const selectedCountInCat = catSkills.filter((s) =>
                          regData.skill_ids.includes(s.id)
                        ).length;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`group relative flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              isExpanded
                                ? "border-[#00695C] bg-emerald-50/80 shadow-xs ring-2 ring-[#00695C]/20"
                                : selectedCountInCat > 0
                                ? "border-emerald-300 bg-white hover:border-emerald-500 shadow-xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                  isExpanded
                                    ? "bg-[#00695C] text-white shadow-xs"
                                    : selectedCountInCat > 0
                                    ? "bg-emerald-100 text-[#00695C]"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                }`}
                              >
                                {getCategoryIcon(cat.id, cat.name)}
                              </div>

                              <div className="min-w-0">
                                <p
                                  className={`text-xs font-bold truncate leading-tight ${
                                    isExpanded ? "text-[#00695C]" : "text-slate-800"
                                  }`}
                                >
                                  {cat.name}
                                </p>
                                {selectedCountInCat > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 mt-0.5">
                                    <Check size={10} strokeWidth={3} />
                                    <span>
                                      {selectedCountInCat}{" "}
                                      {language === "bn" ? "টি" : "selected"}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition-transform ${
                                isExpanded ? "rotate-180 text-[#00695C]" : ""
                              }`}
                            >
                              <ChevronDown size={14} />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* EXPANDED SKILLS BOXES: Opened underneath categories */}
                    {expandedCategoryIds.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-3 text-center text-xs text-slate-500 font-medium">
                        {t.register?.categoryHint ||
                          "Click a category above to reveal and select specific skills"}
                      </div>
                    ) : (
                      <div className="space-y-2.5 pt-1">
                        {expandedCategoryIds.map((catId) => {
                          const catObj = categories.find((c) => c.id === catId);
                          const catName = catObj ? catObj.name : `Category ${catId}`;
                          const skills = categorySkills[catId] || [];
                          const isLoadingThisCat = loadingSkillsMap[catId];

                          return (
                            <div
                              key={catId}
                              className="rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-3 sm:p-3.5 space-y-2.5 transition-all shadow-xs animate-in fade-in slide-in-from-top-1"
                            >
                              {/* Category Header within skills box */}
                              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#00695C] text-white">
                                    {getCategoryIcon(catId, catName)}
                                  </div>
                                  <span className="text-xs font-bold text-slate-800">
                                    {catName}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    ({skills.length} {language === "bn" ? "টি দক্ষতা" : "skills"})
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleCategory(catId)}
                                  className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  {language === "bn" ? "বন্ধ করুন" : "Close"}
                                </button>
                              </div>

                              {/* Skills List as Pills matching screenshot */}
                              {isLoadingThisCat ? (
                                <div className="flex items-center justify-center py-4 gap-2 text-xs font-semibold text-emerald-800">
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#00695C] border-t-transparent" />
                                  <span>{t.common?.loading || "Loading skills..."}</span>
                                </div>
                              ) : skills.length === 0 ? (
                                <p className="text-xs text-slate-500 py-2 text-center">
                                  {language === "bn"
                                    ? "এই ক্যাটাগরিতে কোনো দক্ষতা পাওয়া যায়নি।"
                                    : "No skills found under this category."}
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {skills.map((skill) => {
                                    const isSelected = regData.skill_ids.includes(skill.id);
                                    return (
                                      <button
                                        key={skill.id}
                                        type="button"
                                        onClick={() => handleToggleSkill(skill.id)}
                                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer border ${
                                          isSelected
                                            ? "bg-[#00695C] text-white border-[#005448] shadow-sm scale-[1.01]"
                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 shadow-xs"
                                        }`}
                                      >
                                        {/* Checkbox square matching screenshot */}
                                        <span
                                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                            isSelected
                                              ? "bg-white text-[#00695C] border-white shadow-xs"
                                              : "border-slate-300 bg-white"
                                          }`}
                                        >
                                          {isSelected && (
                                            <Check size={12} strokeWidth={3.5} />
                                          )}
                                        </span>
                                        <span>{skill.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* All Selected Skills Summary Strip */}
                    {regData.skill_ids.length > 0 && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>
                            {t.register?.selectedSkillsSummary || "All Selected Skills"}:
                          </span>
                          <span className="text-emerald-700">
                            {regData.skill_ids.length}{" "}
                            {language === "bn" ? "টি" : "chosen"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 max-h-24 overflow-y-auto">
                          {regData.skill_ids.map((id) => {
                            const skillItem = allSkillsList.find((s) => s.id === id);
                            const name = skillItem ? skillItem.name : `Skill #${id}`;
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#00695C] px-2 py-1 text-[11px] font-bold text-white shadow-xs"
                              >
                                <span>{name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSkill(id)}
                                  className="text-emerald-200 hover:text-white cursor-pointer ml-0.5"
                                  title="Remove"
                                >
                                  <X size={12} strokeWidth={2.5} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location Section */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#00695C]" />
                        <span>{t.register?.locationSectionTitle || "Location & Coverage"}</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-[#00695C] border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Navigation
                          size={12}
                          className={detectingLocation ? "animate-spin text-[#00695C]" : ""}
                        />
                        <span>
                          {detectingLocation
                            ? t.register?.detectingLocation || "Locating..."
                            : t.register?.detectLocationBtn || "Detect My GPS"}
                        </span>
                      </button>
                    </div>

                    {locationNotice && (
                      <p className="text-[11px] text-emerald-700 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-200">
                        {locationNotice}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          {t.register?.latitudeLabel || "Latitude"}
                          <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={regData.latitude}
                          onChange={(e) =>
                            setRegData({ ...regData, latitude: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:border-[#00695C] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          {t.register?.longitudeLabel || "Longitude"}
                          <span className="text-rose-500 ml-0.5">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={regData.longitude}
                          onChange={(e) =>
                            setRegData({ ...regData, longitude: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:border-[#00695C] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Sliders size={13} className="text-[#00695C]" />
                          <span>{t.register?.radiusLabel || "Working Radius"}:</span>
                        </label>
                        <span className="rounded-md bg-[#00695C] px-2 py-0.5 text-xs font-extrabold text-white">
                          {regData.working_radius_km} {t.common?.km || "KM"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={regData.working_radius_km}
                        onChange={(e) =>
                          setRegData({
                            ...regData,
                            working_radius_km: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00695C]"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-semibold">
                        <span>1 KM (Local)</span>
                        <span>3 KM</span>
                        <span>5 KM (Max Coverage)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.register?.baseAddressLabel || "Base Address"}
                      </label>
                      <input
                        type="text"
                        value={regData.base_address}
                        onChange={(e) =>
                          setRegData({ ...regData, base_address: e.target.value })
                        }
                        placeholder={
                          t.register?.baseAddressPlaceholder ||
                          "e.g. House 14, Road 5, Block C, Mirpur, Dhaka"
                        }
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t.register?.baseAddressHint || "At least 5 characters (Area, Road, City)"}
                      </p>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={regData.agreeTerms}
                      onChange={(e) =>
                        setRegData({ ...regData, agreeTerms: e.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00695C] focus:ring-[#00695C] cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs leading-tight text-slate-600 cursor-pointer">
                      {t.register?.agreeTerms || "I agree to the"}{" "}
                      <span className="font-semibold text-[#00695C] underline">
                        {t.register?.termsOfService || "Terms of Service"}
                      </span>{" "}
                      {t.register?.and || "and"}{" "}
                      <span className="font-semibold text-[#00695C] underline">
                        {t.register?.privacyPolicy || "Privacy Policy"}
                      </span>
                      .
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00695C] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#00695C]/25 transition-all hover:bg-[#00574C] hover:shadow-xl active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>{t.register?.submittingBtn || "Creating Account..."}</span>
                      </span>
                    ) : (
                      <>
                        <span>{t.register?.submitBtn || "Complete Registration"}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* ========================================================== */
              /* LOGIN MODE FORM                                            */
              /* ========================================================== */
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      POST /api/v1/auth/login
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                    {t.auth?.loginTitle || "Welcome Back"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    {t.auth?.loginSubtitle ||
                      "Log in to access your Nirbhor account and verified tasks."}
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.login?.phoneLabel || "Phone Number"}
                      <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Phone size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={loginData.username}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            username: e.target.value,
                          })
                        }
                        placeholder={t.login?.phonePlaceholder || "01800000001"}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {t.login?.phoneHint || "Registered mobile number"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {t.login?.passwordLabel || "Password"}
                        <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            language === "bn"
                              ? "পাসওয়ার্ড রিসেট লিংক আপনার মোবাইলে এসএমএস এর মাধ্যমে পাঠানো হবে।"
                              : "Password reset instructions will be sent via SMS."
                          )
                        }
                        className="text-[11px] font-medium text-[#00695C] hover:underline cursor-pointer"
                      >
                        {t.login?.forgotPassword || "Forgot?"}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Lock size={15} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        placeholder={t.login?.passwordPlaceholder || "••••••••"}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={loginData.rememberMe}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            rememberMe: e.target.checked,
                          })
                        }
                        className="h-3.5 w-3.5 rounded border-slate-300 text-[#00695C] focus:ring-[#00695C] cursor-pointer"
                      />
                      <span>{t.login?.rememberMe || "Remember Me"}</span>
                    </label>

                    <button
                      type="button"
                      onClick={fillDemoAccount}
                      className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles size={12} className="text-emerald-600" />
                      <span>{t.login?.demoButton || "Fill Demo Provider"}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00695C] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#00695C]/25 transition-all hover:bg-[#00574C] hover:shadow-xl active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>{t.login?.submittingBtn || "Logging in..."}</span>
                      </span>
                    ) : (
                      <>
                        <span>{t.login?.submitBtn || "Log In"}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            <p className="mt-8 text-center text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
              {t.auth?.footerCopyright || "VERIFIED TRUST PORTAL • © 2026 NIRBHOR"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
