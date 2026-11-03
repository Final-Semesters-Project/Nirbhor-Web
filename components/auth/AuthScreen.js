"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  Wrench,
  ChevronDown,
  Hammer,
  Truck,
  Sparkles,
  Layers,
  MapPin,
  Sliders,
  Smartphone,
  Map as MapIcon,
  Users,
  Award,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { saveAuthSession } from "@/lib/auth";
import {
  registerProviderAccount,
  loginUser,
  fetchCategories,
  fetchSkillsByCategory,
  FALLBACK_CATEGORIES,
  FALLBACK_SKILLS_BY_CATEGORY,
} from "@/lib/api";
import GoogleMapPickerModal from "@/components/GoogleMapPickerModal";

export default function AuthScreen({ defaultMode = "register" }) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isBn = language === "bn";

  // Tab mode: 'register' or 'login'
  const [mode, setMode] = useState(defaultMode);

  // 3-Step Wizard Navigation:
  // Step 1: Personal & Account Info
  // Step 2: Skills & Specialization
  // Step 3: Location & Working Radius
  const [registerStep, setRegisterStep] = useState(1);

  // Google Maps Picker Modal state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Form State matching backend ProviderRegisterSchema
  const [regData, setRegData] = useState({
    name_en: "",
    name_bn: "",
    phone: "",
    password: "",
    preferred_lang: language,
    skill_ids: [], // default: none selected (user manually selects)
    latitude: 23.8103, // default: Dhaka
    longitude: 90.4125,
    working_radius_km: 3,
    has_smartphone: true,
    base_address: "",
    agreeTerms: true,
  });

  // Keep preferred_lang in sync when global language changes
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
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]); // collapsed by default

  // Load categories and initial skills from backend API
  useEffect(() => {
    let isCancelled = false;

    async function loadCategoriesAndInitialSkills() {
      setLoadingCategories(true);
      try {
        const catList = await fetchCategories(language);
        if (!isCancelled && Array.isArray(catList) && catList.length > 0) {
          setCategories(catList);

          // Fetch skills for all returned categories
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

  // Load skills for a specific category
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
        if (!categorySkills[catId] || categorySkills[catId].length === 0) {
          loadSkillsForCategory(catId, language);
        }
        return [...prev, catId];
      }
    });
  };

  // Localized Name helper
  const getLocalizedName = (item) => {
    if (!item) return "";
    if (isBn) {
      return item.name_bn || item.name || "";
    }
    return item.name_en || item.name || "";
  };

  // Category Icon helper
  const getCategoryIcon = (catId, catName = "") => {
    const name = String(catName).toLowerCase();
    if (catId === 1 || name.includes("manual") || name.includes("শ্রম")) {
      return <Hammer size={18} />;
    }
    if (catId === 2 || name.includes("repair") || name.includes("মেরামত")) {
      return <Wrench size={18} />;
    }
    if (catId === 3 || name.includes("clean") || name.includes("পরিষ্কার")) {
      return <Sparkles size={18} />;
    }
    if (catId === 4 || name.includes("transport") || name.includes("পরিবহন")) {
      return <Truck size={18} />;
    }
    return <Layers size={18} />;
  };

  // Toggle skill selection
  const handleToggleSkill = (skillId) => {
    setRegData((prev) => {
      const exists = prev.skill_ids.includes(skillId);
      if (exists) {
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
    Object.values(FALLBACK_SKILLS_BY_CATEGORY).forEach((skills) => {
      skills.forEach((s) => {
        if (!map.has(s.id)) {
          map.set(s.id, {
            id: s.id,
            name: isBn ? s.name_bn : s.name,
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
    username: "",
    password: "",
    rememberMe: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200" };
    if (pwd.length < 8) {
      return {
        score: 1,
        label: t.register?.passwordStrengthWeak || (isBn ? "দুর্বল" : "Weak"),
        color: "bg-rose-500",
      };
    }
    if (pwd.length < 12) {
      return {
        score: 2,
        label: t.register?.passwordStrengthMedium || (isBn ? "মাঝারি" : "Medium"),
        color: "bg-amber-500",
      };
    }
    return {
      score: 3,
      label: t.register?.passwordStrengthStrong || (isBn ? "শক্তিশালী" : "Strong"),
      color: "bg-emerald-600",
    };
  };

  const strength = getPasswordStrength(regData.password);

  // ==========================================
  // STEP 1 VALIDATION -> GO TO STEP 2
  // ==========================================
  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!regData.name_en.trim()) {
      setStatusMessage({
        type: "error",
        text: t.register?.errors?.nameEnRequired || (isBn ? "অনুগ্রহ করে আপনার পুরো নাম ইংরেজিতে লিখুন।" : "Please enter your full name in English."),
      });
      return;
    }

    if (!regData.name_bn.trim()) {
      setStatusMessage({
        type: "error",
        text: t.register?.errors?.nameBnRequired || (isBn ? "অনুগ্রহ করে আপনার পুরো নাম বাংলায় লিখুন।" : "Please enter your full name in Bangla."),
      });
      return;
    }

    const phoneClean = regData.phone.trim().replace(/[\s-]/g, "");
    const phonePattern = /^01[3-9]\d{8}$/;
    if (!phonePattern.test(phoneClean)) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.phoneInvalid ||
          (isBn
            ? "অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (০১ দিয়ে শুরু)।"
            : "Please enter a valid 11-digit Bangladeshi mobile number (013-019)."),
      });
      return;
    }

    if (regData.password.length < 8) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.passwordTooShort ||
          (isBn
            ? "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"
            : "Password must be at least 8 characters long."),
      });
      return;
    }

    setRegisterStep(2);
  };

  // ==========================================
  // STEP 2 VALIDATION -> GO TO STEP 3
  // ==========================================
  const handleProceedToStep3 = (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!regData.skill_ids || regData.skill_ids.length === 0) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.skillRequired ||
          (isBn
            ? "অনুগ্রহ করে কমপক্ষে একটি কাজের দক্ষতা নির্বাচন করুন।"
            : "Please select at least one skill to continue."),
      });
      return;
    }

    setRegisterStep(3);
  };

  // Handler when location is picked from Google Maps
  const handleLocationConfirmed = ({ latitude, longitude, address }) => {
    setRegData((prev) => ({
      ...prev,
      latitude: Number(latitude),
      longitude: Number(longitude),
      base_address: address || prev.base_address,
    }));
  };

  // ==========================================
  // SUBMIT: FINAL PROVIDER REGISTRATION (STEP 3)
  // ==========================================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const addressClean = (regData.base_address || "").trim();
    if (addressClean.length < 5) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.addressMinLength ||
          (isBn
            ? "ঠিকানা কমপক্ষে ৫ অক্ষরের হতে হবে।"
            : "Please enter or pin a base address of at least 5 characters."),
      });
      return;
    }

    if (regData.working_radius_km < 1 || regData.working_radius_km > 5) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.radiusInvalid ||
          (isBn
            ? "কাজের পরিধি ১ থেকে ৫ কিমি-এর মধ্যে হতে হবে।"
            : "Working radius must be between 1 and 5 km."),
      });
      return;
    }

    if (!regData.agreeTerms) {
      setStatusMessage({
        type: "error",
        text:
          t.register?.errors?.termsRequired ||
          (isBn
            ? "অনুগ্রহ করে ব্যবহারের শর্তাবলীতে সম্মতি দিন।"
            : "Please accept the Terms of Service to continue."),
      });
      return;
    }

    setLoading(true);

    try {
      const phoneClean = regData.phone.trim().replace(/[\s-]/g, "");

      const response = await registerProviderAccount({
        name_en: regData.name_en.trim(),
        name_bn: regData.name_bn.trim(),
        phone: phoneClean,
        password: regData.password,
        preferred_lang: regData.preferred_lang || language,
        skill_ids: regData.skill_ids,
        latitude: Number(regData.latitude) || 23.8103,
        longitude: Number(regData.longitude) || 90.4125,
        working_radius_km: Number(regData.working_radius_km),
        has_smartphone: Boolean(regData.has_smartphone),
        base_address: addressClean,
      });

      saveAuthSession(response);

      setStatusMessage({
        type: "success",
        text:
          t.register?.successMessage ||
          (isBn
            ? "আপনার সেবাদাতা অ্যাকাউন্ট তৈরি হয়েছে। হোম পেজে নিয়ে যাওয়া হচ্ছে..."
            : "Provider registered successfully! Redirecting to workspace..."),
      });

      setTimeout(() => {
        router.push("/provider/home");
      }, 1000);
    } catch (error) {
      console.error("Provider registration error:", error);
      setStatusMessage({
        type: "error",
        text:
          error.message ||
          (isBn
            ? "নিবন্ধন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।"
            : "Registration failed. Please try again."),
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

    const usernameClean = loginData.username.trim().replace(/[\s-]/g, "");

    if (!usernameClean) {
      setStatusMessage({
        type: "error",
        text:
          t.login?.errors?.phoneRequired ||
          (isBn ? "অনুগ্রহ করে আপনার ফোন নম্বর লিখুন।" : "Please enter your mobile phone number."),
      });
      return;
    }

    if (!loginData.password) {
      setStatusMessage({
        type: "error",
        text:
          t.login?.errors?.passwordRequired ||
          (isBn ? "অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।" : "Please enter your password."),
      });
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        username: usernameClean,
        password: loginData.password,
      });

      saveAuthSession(response);

      setStatusMessage({
        type: "success",
        text:
          t.login?.successMessage ||
          (isBn
            ? "লগইন সফল হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে..."
            : "Login successful! Redirecting..."),
      });

      setTimeout(() => {
        router.push("/provider/home");
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      setStatusMessage({
        type: "error",
        text:
          error.message ||
          (isBn
            ? "ভুল ফোন নম্বর বা পাসওয়ার্ড।"
            : "Invalid phone number or password."),
      });
    } finally {
      setLoading(false);
    }
  };

  // Progress Bar percentage for Radius Slider (1 to 5 km -> 0% to 100%)
  const radiusProgressPct = Math.round(
    ((regData.working_radius_km - 1) / (5 - 1)) * 100
  );

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
      {/* Enterprise Shell Card */}
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* ============================================================== */}
        {/* LEFT BRAND HERO COLUMN                                          */}
        {/* ============================================================== */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00382E] via-[#004D40] to-[#00695C] p-6 sm:p-8 text-white lg:col-span-5">
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
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-emerald-100 shadow-xs">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>{t.hero?.badge || (isBn ? "নির্ভর ট্রাস্ট পোর্টাল • বিশ্বস্ত প্ল্যাটফর্ম" : "Nirbhor Trust Portal • Reliable Service Network")}</span>
            </div>

            <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {t.hero?.title || (isBn ? "বিশ্বস্ত দক্ষতার নেটওয়ার্কে যোগ দিন" : "Join the Trusted Skill Network")}
            </h1>

            <p className="mt-3.5 text-sm text-emerald-50/90 leading-relaxed font-normal">
              {t.hero?.desc ||
                (isBn
                  ? "হাজারো স্থানীয় কাজের সাথে যুক্ত হোন এবং আপনার এলাকায় নিজের ভেরিফাইড পরিচিতি ও সুনাম গড়ে তুলুন।"
                  : "Connect with thousands of local opportunities and build your verified reputation within our community.")}
            </p>

            <div className="mt-8 space-y-3.5 pt-6 border-t border-white/15 text-xs sm:text-sm">
              <div className="flex items-center gap-3 text-emerald-50">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={14} strokeWidth={2.5} />
                </div>
                <span className="font-medium">
                  {t.hero?.perk1 || (isBn ? "১০০% যাচাইকৃত পরিচয় ও ট্রাস্ট স্কোর" : "100% Verified Identity & Trust Score")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-emerald-50">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={14} strokeWidth={2.5} />
                </div>
                <span className="font-medium">
                  {t.hero?.perk2 || (isBn ? "আপনার নির্ধারিত পরিধির মধ্যে কাজের নিশ্চিত নোটিফিকেশন" : "Guaranteed local leads matched to your radius")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-emerald-50">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={14} strokeWidth={2.5} />
                </div>
                <span className="font-medium">
                  {t.hero?.perk3 || (isBn ? "বিকাশ, নগদ ও ব্যাংকের মাধ্যমে দ্রুত পেমেন্ট উত্তোলন" : "Fast payouts via bKash, Nagad & Bank")}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 sm:p-3 backdrop-blur-md transition-all hover:bg-white/15">
              <div className="flex items-center gap-1.5 text-emerald-200">
                <Users size={16} />
                <span className="text-sm sm:text-base font-extrabold text-white">
                  {t.hero?.stat1Number || (isBn ? "সরাসরি কাজ" : "Direct Work")}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-emerald-100/90 leading-tight">
                {t.hero?.stat1Label || (isBn ? "মধ্যস্বত্বভোগী ছাড়া" : "Zero Middlemen")}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 sm:p-3 backdrop-blur-md transition-all hover:bg-white/15">
              <div className="flex items-center gap-1.5 text-emerald-200">
                <ShieldCheck size={16} />
                <span className="text-sm sm:text-base font-extrabold text-white">
                  {t.hero?.stat2Number || (isBn ? "যাচাইকৃত" : "Verified")}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-emerald-100/90 leading-tight">
                {t.hero?.stat2Label || (isBn ? "ট্রাস্ট পোর্টাল" : "Trust Portal")}
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* RIGHT AUTH FORM COLUMN                                         */}
        {/* ============================================================== */}
        <section className="p-6 sm:p-8 lg:p-9 lg:col-span-7 bg-white">
          <div className="mx-auto w-full max-w-lg">
            {/* Mode Switcher Tabs */}
            <div className="mb-6 flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/90 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setStatusMessage(null);
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-[#00695C] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.auth?.tabRegister || (isBn ? "নিবন্ধন করুন" : "Create Account")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setStatusMessage(null);
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[#00695C] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.auth?.tabLogin || (isBn ? "লগইন করুন" : "Log In")}
              </button>
            </div>

            {/* Status Feedback Message */}
            {statusMessage && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-2xl p-4 text-xs sm:text-sm font-medium border transition-all animate-in fade-in slide-in-from-top-2 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                    : "bg-rose-50 text-rose-900 border-rose-300"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{statusMessage.text}</span>
              </div>
            )}

            {/* ========================================================== */}
            {/* REGISTER 3-STEP WIZARD                                     */}
            {/* ========================================================== */}
            {mode === "register" ? (
              <div>
                {/* 3-Step Clean Stepper Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {/* Step 1 Chip */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterStep(1);
                        setStatusMessage(null);
                      }}
                      className={`flex items-center gap-2 cursor-pointer transition-colors ${
                        registerStep === 1
                          ? "text-[#00695C] font-extrabold"
                          : registerStep > 1
                          ? "text-emerald-700 font-bold"
                          : "text-slate-400 font-semibold"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          registerStep === 1
                            ? "bg-[#00695C] text-white shadow-xs"
                            : registerStep > 1
                            ? "bg-emerald-100 text-[#00695C]"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {registerStep > 1 ? <Check size={14} strokeWidth={3} /> : "1"}
                      </span>
                      <span className="text-xs sm:text-sm hidden sm:inline">
                        {t.register?.step1Chip || (isBn ? "ব্যক্তিগত তথ্য" : "Personal Info")}
                      </span>
                    </button>

                    <div
                      className={`flex-1 h-0.5 mx-1 transition-colors ${
                        registerStep >= 2 ? "bg-emerald-300" : "bg-slate-200"
                      }`}
                    />

                    {/* Step 2 Chip */}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          regData.name_en &&
                          regData.name_bn &&
                          regData.phone &&
                          regData.password.length >= 8
                        ) {
                          setRegisterStep(2);
                          setStatusMessage(null);
                        }
                      }}
                      className={`flex items-center gap-2 transition-colors ${
                        registerStep === 2
                          ? "text-[#00695C] font-extrabold cursor-pointer"
                          : registerStep > 2
                          ? "text-emerald-700 font-bold cursor-pointer"
                          : "text-slate-400 font-semibold"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          registerStep === 2
                            ? "bg-[#00695C] text-white shadow-xs"
                            : registerStep > 2
                            ? "bg-emerald-100 text-[#00695C]"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {registerStep > 2 ? <Check size={14} strokeWidth={3} /> : "2"}
                      </span>
                      <span className="text-xs sm:text-sm hidden sm:inline">
                        {t.register?.step2Chip || (isBn ? "দক্ষতা ও ক্ষেত্র" : "Skills & Services")}
                      </span>
                    </button>

                    <div
                      className={`flex-1 h-0.5 mx-1 transition-colors ${
                        registerStep === 3 ? "bg-emerald-300" : "bg-slate-200"
                      }`}
                    />

                    {/* Step 3 Chip */}
                    <div
                      className={`flex items-center gap-2 ${
                        registerStep === 3
                          ? "text-[#00695C] font-extrabold"
                          : "text-slate-400 font-semibold"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          registerStep === 3
                            ? "bg-[#00695C] text-white shadow-xs"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        3
                      </span>
                      <span className="text-xs sm:text-sm hidden sm:inline">
                        {t.register?.step3Chip || (isBn ? "অবস্থান ও পরিধি" : "Location & Radius")}
                      </span>
                    </div>
                  </div>

                  {/* Step Heading & Subtitle */}
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {registerStep === 1
                      ? t.register?.step1Title || (isBn ? "ব্যক্তিগত তথ্য" : "Personal Information")
                      : registerStep === 2
                      ? t.register?.step2Title || (isBn ? "কাজের দক্ষতা ও ক্ষেত্র" : "Skills & Specialization")
                      : t.register?.step3Title || (isBn ? "অবস্থান ও কাজের পরিধি" : "Service Location & Radius")}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                    {registerStep === 1
                      ? t.register?.step1Subtitle || (isBn ? "আপনার সঠিক নাম ও যোগাযোগ নম্বর দিয়ে অ্যাকাউন্ট শুরু করুন।" : "Enter your full name and contact number to start.")
                      : registerStep === 2
                      ? t.register?.step2Subtitle || (isBn ? "ক্যাটাগরি নির্বাচন করে আপনার কাজের দক্ষতাসমূহ যুক্ত করুন।" : "Select categories and choose the service skills you provide.")
                      : t.register?.step3Subtitle || (isBn ? "ম্যাপে কর্মস্থল পিন করুন এবং সেবার দূরত্ব নির্ধারণ করুন।" : "Pin your base address on Google Maps and set your coverage radius.")}
                  </p>
                </div>

                {/* ────────────────────────────────────────────────────────── */}
                {/* STEP 1: PERSONAL & ACCOUNT INFO                           */}
                {/* ────────────────────────────────────────────────────────── */}
                {registerStep === 1 && (
                  <form onSubmit={handleProceedToStep2} autoComplete="off" className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5 space-y-4">
                      {/* Name EN & Name BN */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {t.register?.nameEnLabel || (isBn ? "পূর্ণ নাম (ইংরেজি বানান)" : "Full Name (English)")}
                            <span className="text-rose-500 ml-0.5">*</span>
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                              <User size={16} />
                            </div>
                            <input
                              type="text"
                              required
                              autoComplete="off"
                              value={regData.name_en}
                              onChange={(e) =>
                                setRegData({ ...regData, name_en: e.target.value })
                              }
                              placeholder={
                                t.register?.nameEnPlaceholder || "e.g. Abdur Rahim"
                              }
                              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {t.register?.nameBnLabel || (isBn ? "পূর্ণ নাম (বাংলা)" : "Full Name (Bangla)")}
                            <span className="text-rose-500 ml-0.5">*</span>
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                              <User size={16} />
                            </div>
                            <input
                              type="text"
                              required
                              autoComplete="off"
                              value={regData.name_bn}
                              onChange={(e) =>
                                setRegData({ ...regData, name_bn: e.target.value })
                              }
                              placeholder={
                                t.register?.nameBnPlaceholder || "যেমন: আব্দুর রহিম"
                              }
                              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Phone & Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {t.register?.phoneLabel || (isBn ? "মোবাইল ফোন নম্বর" : "Mobile Phone Number")}
                            <span className="text-rose-500 ml-0.5">*</span>
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                              <Phone size={16} />
                            </div>
                            <input
                              type="tel"
                              required
                              autoComplete="off"
                              value={regData.phone}
                              onChange={(e) =>
                                setRegData({ ...regData, phone: e.target.value })
                              }
                              placeholder={
                                t.register?.phonePlaceholder ||
                                (isBn ? "০১৭XXXXXXXX" : "017XXXXXXXX")
                              }
                              maxLength={11}
                              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-mono font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              {t.register?.passwordLabel || (isBn ? "পাসওয়ার্ড" : "Password")}
                              <span className="text-rose-500 ml-0.5">*</span>
                            </label>
                            {regData.password && (
                              <span className="text-[11px] font-bold text-slate-600">
                                {strength.label}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                              <Lock size={16} />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              autoComplete="new-password"
                              value={regData.password}
                              onChange={(e) =>
                                setRegData({ ...regData, password: e.target.value })
                              }
                              placeholder={
                                t.register?.passwordPlaceholder ||
                                (isBn ? "কমপক্ষে ৮টি অক্ষর" : "At least 8 characters")
                              }
                              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-mono font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Preferred Language & Smartphone Question */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {t.register?.preferredLangLabel || (isBn ? "যোগাযোগের পছন্দের ভাষা" : "Preferred Communication Language")}
                            <span className="text-rose-500 ml-0.5">*</span>
                          </label>
                          <select
                            value={regData.preferred_lang}
                            onChange={(e) =>
                              setRegData({ ...regData, preferred_lang: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all cursor-pointer font-medium"
                          >
                            <option value="bn">{isBn ? "বাংলা" : "Bangla"}</option>
                            <option value="en">{isBn ? "ইংরেজি" : "English"}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            {t.register?.smartphoneQuestion || (isBn ? "স্মার্টফোন আছে কি?" : "Do you have a smartphone?")}
                          </label>
                          <div className="flex rounded-xl bg-slate-200/80 p-1 border border-slate-300">
                            <button
                              type="button"
                              onClick={() => setRegData({ ...regData, has_smartphone: true })}
                              className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                regData.has_smartphone
                                  ? "bg-[#00695C] text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {t.register?.smartphoneYes || (isBn ? "হ্যাঁ" : "Yes")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRegData({ ...regData, has_smartphone: false })}
                              className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                !regData.has_smartphone
                                  ? "bg-[#00695C] text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {t.register?.smartphoneNo || (isBn ? "না" : "No")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 1 Continue Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00695C] hover:bg-[#00574C] py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#00695C]/25 transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <span>{t.register?.continueBtn || (isBn ? "পরবর্তী ধাপ" : "Continue")}</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* STEP 2: SKILLS & CATEGORY SELECTION                        */}
                {/* ────────────────────────────────────────────────────────── */}
                {registerStep === 2 && (
                  <form onSubmit={handleProceedToStep3} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5 space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-[#00695C]" />
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                            {t.register?.skillsSectionTitle || (isBn ? "কাজের দক্ষতা ও ক্ষেত্র" : "Skills & Specialization")}
                          </h3>
                          <span className="text-rose-500 font-bold">*</span>
                        </div>
                        {regData.skill_ids.length > 0 ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                            {regData.skill_ids.length} {t.register?.skillsSelectedCount || (isBn ? "টি নির্বাচিত" : "selected")}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 border border-slate-200">
                            {isBn ? "কোনোটি নির্বাচিত নয়" : "None selected"}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        {t.register?.categoriesSubtitle ||
                          (isBn
                            ? "ক্যাটাগরিতে ক্লিক করলে তার ভেতরের দক্ষতা নিচে খুলবে (প্রতি সারিতে ২টি):"
                            : "Click a category to select skills below (2 per row):")}
                      </p>

                      {/* CATEGORY GRID: 2 Categories per row */}
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => {
                          const isExpanded = expandedCategoryIds.includes(cat.id);
                          const catSkills = categorySkills[cat.id] || [];
                          const selectedCountInCat = catSkills.filter((s) =>
                            regData.skill_ids.includes(s.id)
                          ).length;
                          const displayName = getLocalizedName(cat);

                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => toggleCategory(cat.id)}
                              className={`group relative flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                isExpanded
                                  ? "border-[#00695C] bg-white ring-2 ring-[#00695C]/20 shadow-sm"
                                  : selectedCountInCat > 0
                                  ? "border-emerald-300 bg-white hover:border-emerald-500 shadow-xs"
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                    isExpanded
                                      ? "bg-[#00695C] text-white shadow-xs"
                                      : selectedCountInCat > 0
                                      ? "bg-emerald-100 text-[#00695C]"
                                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                  }`}
                                >
                                  {getCategoryIcon(cat.id, displayName)}
                                </div>

                                <div className="min-w-0">
                                  <p
                                    className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                                      isExpanded ? "text-[#00695C]" : "text-slate-800"
                                    }`}
                                  >
                                    {displayName}
                                  </p>
                                  {selectedCountInCat > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
                                      <Check size={11} strokeWidth={3} />
                                      <span>
                                        {selectedCountInCat}{" "}
                                        {isBn ? "টি নির্বাচিত" : "selected"}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-transform ${
                                  isExpanded ? "rotate-180 text-[#00695C]" : ""
                                }`}
                              >
                                <ChevronDown size={16} />
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* EXPANDED SKILLS BOXES */}
                      {expandedCategoryIds.length > 0 && (
                        <div className="space-y-3 pt-1">
                          {expandedCategoryIds.map((catId) => {
                            const catObj = categories.find((c) => c.id === catId);
                            const catName = getLocalizedName(catObj) || `Category ${catId}`;
                            const skills = categorySkills[catId] || [];
                            const isLoadingThisCat = loadingSkillsMap[catId];

                            return (
                              <div
                                key={catId}
                                className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-4 space-y-3 transition-all shadow-xs animate-in fade-in slide-in-from-top-1"
                              >
                                <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00695C] text-white">
                                      {getCategoryIcon(catId, catName)}
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                                      {catName}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                      ({skills.length} {isBn ? "টি দক্ষতা" : "skills"})
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => toggleCategory(catId)}
                                    className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                                  >
                                    {t.register?.skillsClose || (isBn ? "বন্ধ করুন" : "Close")}
                                  </button>
                                </div>

                                {isLoadingThisCat ? (
                                  <div className="flex items-center justify-center py-4 gap-2 text-xs font-semibold text-emerald-800">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#00695C] border-t-transparent" />
                                    <span>{t.common?.loading || (isBn ? "লোড হচ্ছে..." : "Loading...")}</span>
                                  </div>
                                ) : skills.length === 0 ? (
                                  <p className="text-xs text-slate-500 py-2 text-center font-medium">
                                    {t.register?.skillsEmpty ||
                                      (isBn
                                        ? "এই ক্যাটাগরিতে কোনো দক্ষতা পাওয়া যায়নি।"
                                        : "No skills found under this category.")}
                                  </p>
                                ) : (
                                  <div className="flex flex-wrap gap-2.5">
                                    {skills.map((skill) => {
                                      const isSelected = regData.skill_ids.includes(skill.id);
                                      const skillName = getLocalizedName(skill);
                                      return (
                                        <button
                                          key={skill.id}
                                          type="button"
                                          onClick={() => handleToggleSkill(skill.id)}
                                          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                                            isSelected
                                              ? "bg-[#00695C] text-white border-[#005448] shadow-sm"
                                              : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
                                          }`}
                                        >
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
                                          <span>{skillName}</span>
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

                      {/* Selected Skills Summary Strip */}
                      {regData.skill_ids.length > 0 && (
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                            <span>
                              {t.register?.selectedSkillsSummary || (isBn ? "নির্বাচিত দক্ষতাসমূহ" : "Selected Skills")}:
                            </span>
                            <span className="text-emerald-700">
                              {regData.skill_ids.length}{" "}
                              {isBn ? "টি" : "selected"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 p-2.5 rounded-2xl bg-white border border-slate-200 max-h-28 overflow-y-auto">
                            {regData.skill_ids.map((id) => {
                              const skillItem = allSkillsList.find((s) => s.id === id);
                              const name = skillItem ? getLocalizedName(skillItem) : `Skill #${id}`;
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00695C] px-3 py-1 text-xs font-bold text-white shadow-xs"
                                >
                                  <span>{name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSkill(id)}
                                    className="text-emerald-200 hover:text-white cursor-pointer ml-1"
                                    title="Remove"
                                  >
                                    <X size={13} strokeWidth={2.5} />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step 2 Buttons: Consistent design, Back is smaller */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRegisterStep(1);
                          setStatusMessage(null);
                        }}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#00695C] hover:bg-[#00574C] py-3.5 px-6 text-sm font-bold text-white shadow-md shadow-[#00695C]/20 transition-all active:scale-[0.99] cursor-pointer shrink-0"
                      >
                        <ArrowLeft size={16} />
                        <span>{t.register?.backBtn || (isBn ? "পূর্ববর্তী" : "Back")}</span>
                      </button>

                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#00695C] hover:bg-[#00574C] py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#00695C]/25 transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <span>{t.register?.continueBtn || (isBn ? "পরবর্তী ধাপ" : "Continue")}</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                )}

                {/* ────────────────────────────────────────────────────────── */}
                {/* STEP 3: LOCATION SEARCH, GOOGLE MAP PIN & RADIUS           */}
                {/* ────────────────────────────────────────────────────────── */}
                {registerStep === 3 && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5 space-y-4">
                      {/* Section Title */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-[#00695C]" />
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                            {t.register?.locationSectionTitle || (isBn ? "কাজের এলাকা ও পরিধি" : "Service Area & Location")}
                          </h3>
                          <span className="text-rose-500 font-bold">*</span>
                        </div>

                        {/* Location Synced Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#00695C] text-xs font-bold border border-emerald-200">
                          <Check size={12} strokeWidth={3} />
                          <span>{t.register?.gpsSynced || (isBn ? "জিপিএস যুক্ত" : "GPS Synced")}</span>
                        </span>
                      </div>

                      {/* Location Search Box + Map Icon Button */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {t.register?.baseAddressLabel || (isBn ? "কর্মস্থলের ঠিকানা বা এলাকা" : "Base Address or Area")}
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
                              value={regData.base_address}
                              onChange={(e) =>
                                setRegData({ ...regData, base_address: e.target.value })
                              }
                              placeholder={
                                t.register?.baseAddressPlaceholder ||
                                (isBn
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
                            title={isBn ? "গুগল ম্যাপে লোকেশন পিন করুন" : "Pin location on Google Maps"}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00695C] hover:bg-[#00574C] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#00695C]/20 transition-all cursor-pointer shrink-0"
                          >
                            <MapIcon size={18} />
                            <span className="hidden sm:inline">
                              {t.register?.pickOnMapBtn || (isBn ? "ম্যাপে পিন করুন" : "Pick on Map")}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Selected Location Confirmation Card */}
                      {regData.base_address && (
                        <div className="p-3.5 rounded-xl bg-white border border-emerald-200 flex items-start gap-3 shadow-2xs">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#00695C] flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              {t.register?.confirmedLocation || (isBn ? "নির্ধারিত অবস্থান" : "Confirmed Location")}
                            </p>
                            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug break-words">
                              {regData.base_address}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Working Radius Progress Bar Slider (Max 5 km, Green for Selected portion) */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Sliders size={14} className="text-[#00695C]" />
                            <span>{t.register?.radiusLabel || (isBn ? "কাজের পরিধি" : "Working Radius")}:</span>
                          </label>
                          <span className="rounded-lg bg-[#00695C] px-3 py-1 text-xs font-black text-white shadow-2xs">
                            {regData.working_radius_km} {t.common?.km || (isBn ? "কিমি" : "KM")}
                          </span>
                        </div>

                        {/* Slider with dynamic green track before thumb */}
                        <div className="relative pt-1 pb-2">
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
                            style={{
                              background: `linear-gradient(to right, #00695C 0%, #00695C ${radiusProgressPct}%, #e2e8f0 ${radiusProgressPct}%, #e2e8f0 100%)`,
                            }}
                            className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-[#00695C] focus:outline-none"
                          />

                          {/* Distance Indicators */}
                          <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold">
                            <span className={regData.working_radius_km === 1 ? "text-[#00695C]" : ""}>
                              {isBn ? "১ কিমি" : "1 KM"}
                            </span>
                            <span className={regData.working_radius_km === 2 ? "text-[#00695C]" : ""}>
                              {isBn ? "২ কিমি" : "2 KM"}
                            </span>
                            <span className={regData.working_radius_km === 3 ? "text-[#00695C]" : ""}>
                              {isBn ? "৩ কিমি" : "3 KM"}
                            </span>
                            <span className={regData.working_radius_km === 4 ? "text-[#00695C]" : ""}>
                              {isBn ? "৪ কিমি" : "4 KM"}
                            </span>
                            <span className={regData.working_radius_km === 5 ? "text-[#00695C]" : ""}>
                              {isBn ? "৫ কিমি (সর্বোচ্চ)" : "5 KM (Max)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Terms Checkbox with THEME GREEN TICK BOX */}
                    <div className="pt-1 space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-slate-700 font-medium select-none group">
                        {/* Custom Green Checkbox Button */}
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={regData.agreeTerms}
                          onClick={() =>
                            setRegData({ ...regData, agreeTerms: !regData.agreeTerms })
                          }
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                            regData.agreeTerms
                              ? "bg-[#00695C] border-[#00695C] text-white shadow-xs"
                              : "bg-white border-slate-300 hover:border-[#00695C]"
                          }`}
                        >
                          {regData.agreeTerms && <Check size={13} strokeWidth={3.5} />}
                        </button>

                        <span className="leading-snug pt-0.5">
                          {isBn ? (
                            <>
                              আমি নির্ভর প্ল্যাটফর্মের{" "}
                              <Link
                                href="/terms"
                                className="font-bold text-[#00695C] hover:underline"
                              >
                                ব্যবহারের শর্তাবলী
                              </Link>{" "}
                              এবং{" "}
                              <Link
                                href="/privacy"
                                className="font-bold text-[#00695C] hover:underline"
                              >
                                গোপনীয়তা নীতি
                              </Link>{" "}
                              মেনে নিচ্ছি।
                            </>
                          ) : (
                            <>
                              I agree to the Nirbhor{" "}
                              <Link
                                href="/terms"
                                className="font-bold text-[#00695C] hover:underline"
                              >
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link
                                href="/privacy"
                                className="font-bold text-[#00695C] hover:underline"
                              >
                                Privacy Policy
                              </Link>
                              .
                            </>
                          )}
                        </span>
                      </label>

                      {/* Step 3 Buttons: Consistent design, Back is smaller */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setRegisterStep(2);
                            setStatusMessage(null);
                          }}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-[#00695C] hover:bg-[#00574C] py-3.5 px-6 text-sm font-bold text-white shadow-md shadow-[#00695C]/20 transition-all active:scale-[0.99] cursor-pointer shrink-0"
                        >
                          <ArrowLeft size={16} />
                          <span>{t.register?.backBtn || (isBn ? "পূর্ববর্তী" : "Back")}</span>
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#00695C] hover:bg-[#00574C] py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#00695C]/25 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>{t.register?.submittingBtn || (isBn ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "Creating Account...")}</span>
                            </span>
                          ) : (
                            <>
                              <span>{t.register?.submitBtn || (isBn ? "নিবন্ধন সম্পন্ন করুন" : "Register as Provider")}</span>
                              <CheckCircle2 size={18} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Google Map Picker Modal */}
                <GoogleMapPickerModal
                  isOpen={isMapModalOpen}
                  onClose={() => setIsMapModalOpen(false)}
                  initialLat={regData.latitude}
                  initialLng={regData.longitude}
                  initialAddress={regData.base_address}
                  onConfirmLocation={handleLocationConfirmed}
                  language={language}
                />
              </div>
            ) : (
              /* ========================================================== */
              /* LOGIN FORM                                                 */
              /* ========================================================== */
              <div>
                <div className="mb-7">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                    {t.auth?.loginTitle || (isBn ? "পুনরায় স্বাগতম" : "Welcome Back")}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500 font-medium">
                    {t.auth?.loginSubtitle ||
                      (isBn
                        ? "আপনার নির্ভর অ্যাকাউন্ট ও কাজের তালিকায় প্রবেশ করতে লগইন করুন।"
                        : "Log in to access your Nirbhor account and verified tasks.")}
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t.login?.phoneLabel || (isBn ? "মোবাইল ফোন নম্বর" : "Mobile Phone Number")}
                      <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        required
                        autoComplete="off"
                        value={loginData.username}
                        onChange={(e) =>
                          setLoginData({ ...loginData, username: e.target.value })
                        }
                        placeholder={
                          t.login?.phonePlaceholder ||
                          (isBn ? "০১৭XXXXXXXX" : "01712345678")
                        }
                        maxLength={11}
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-mono font-medium"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {t.login?.passwordLabel || (isBn ? "পাসওয়ার্ড" : "Password")}
                        <span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-[#00695C] hover:underline"
                      >
                        {t.login?.forgotPassword || (isBn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?")}
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                        placeholder={t.login?.passwordPlaceholder || "••••••••"}
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all font-mono font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700 font-medium select-none">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={loginData.rememberMe}
                        onClick={() =>
                          setLoginData({
                            ...loginData,
                            rememberMe: !loginData.rememberMe,
                          })
                        }
                        className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer border ${
                          loginData.rememberMe
                            ? "bg-[#00695C] border-[#00695C] text-white"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {loginData.rememberMe && <Check size={11} strokeWidth={3.5} />}
                      </button>
                      <span>{t.login?.rememberMe || (isBn ? "আমাকে মনে রাখুন" : "Remember Me")}</span>
                    </label>
                  </div>

                  {/* Submit Login Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00695C] hover:bg-[#00574C] py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#00695C]/25 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>{t.login?.submittingBtn || (isBn ? "লগইন হচ্ছে..." : "Logging in...")}</span>
                        </span>
                      ) : (
                        <>
                          <span>{t.login?.submitBtn || (isBn ? "লগইন করুন" : "Log In")}</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
