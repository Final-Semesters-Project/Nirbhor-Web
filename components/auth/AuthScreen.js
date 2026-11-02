"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Award,
  Lock,
  Mail,
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
} from "lucide-react";
import Brand from "@/components/Brand";

export default function AuthScreen({ initialMode = "register" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode); // 'register' or 'login'

  // Register Form State
  const [regData, setRegData] = useState({
    fullName: "",
    emailOrUsername: "",
    phone: "",
    password: "",
    agreeTerms: true,
  });

  // Login Form State
  const [loginData, setLoginData] = useState({
    usernameOrPhone: "01712345678",
    password: "••••••••",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Password strength calculation for register
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-slate-200" };
    if (pwd.length < 6) return { score: 1, label: "Weak / দুর্বল", color: "bg-rose-500" };
    if (pwd.length < 10) return { score: 2, label: "Medium / মাঝারি", color: "bg-amber-500" };
    return { score: 3, label: "Strong / শক্তিশালী", color: "bg-emerald-600" };
  };

  const strength = getPasswordStrength(regData.password);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regData.agreeTerms) {
      setStatusMessage({
        type: "error",
        text: "Please agree to the Terms of Service. / অনুগ্রহ করে শর্তাবলীতে সম্মতি দিন।",
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    // Simulate clean registration transition
    setTimeout(() => {
      setLoading(false);
      setStatusMessage({
        type: "success",
        text: "Account created successfully! Redirecting to Provider Profile Setup... / অ্যাকাউন্ট তৈরি সফল হয়েছে! সেটআপ পেইজে নিয়ে যাওয়া হচ্ছে...",
      });
      setTimeout(() => {
        router.push("/provider/setup");
      }, 1200);
    }, 900);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      setLoading(false);
      setStatusMessage({
        type: "success",
        text: "Login successful! Redirecting to Provider Profile Setup... / লগইন সফল হয়েছে! প্রোফাইল সেটআপে নিয়ে যাওয়া হচ্ছে...",
      });
      setTimeout(() => {
        router.push("/provider/setup");
      }, 1000);
    }, 800);
  };

  const fillDemoAccount = () => {
    setLoginData({
      usernameOrPhone: "01712345678",
      password: "password123",
      rememberMe: true,
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Outer Shell Card with subtle border and layered shadows */}
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* ============================================================== */}
        {/* LEFT COLUMN: HERO & TRUST BRANDING (5 Cols on LG)              */}
        {/* ============================================================== */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00382E] via-[#005448] to-[#00695C] p-7 text-white sm:p-10 lg:col-span-5">
          {/* Subtle geometric glowing background elements */}
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl pointer-events-none" />
          
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-emerald-100 shadow-sm">
              <ShieldCheck size={16} className="text-emerald-300" />
              <span>Nirbhor Trust Portal • নির্ভরযোগ্য প্ল্যাটফর্ম</span>
            </div>

            <h1 className="mt-7 text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight leading-tight">
              Join the Trusted Skill Network.
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-emerald-50/90 leading-relaxed font-normal">
              Connect with thousands of local opportunities and build your verified
              reputation within our community.
            </p>

            <p className="mt-3 text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-medium">
              বিশ্বস্ত দক্ষতার নেটওয়ার্কে যোগ দিন এবং আপনার পেশাদার পরিচিতি গড়ে তুলুন।
            </p>

            {/* Key Trust Perks */}
            <div className="mt-6 space-y-2.5 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2 text-emerald-100">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={12} strokeWidth={2.5} />
                </div>
                <span>100% Verified Identity & Trust Score / নিশ্চিত পরিচিতি</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={12} strokeWidth={2.5} />
                </div>
                <span>Guaranteed local leads matched to your radius / এলাকার কাজ</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <Check size={12} strokeWidth={2.5} />
                </div>
                <span>Fast payouts via bKash, Nagad & Bank / সহজ উত্তোলন</span>
              </div>
            </div>
          </div>

          {/* Bottom Stats Grid */}
          <div className="relative z-10 mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15">
              <div className="flex items-center gap-2 text-emerald-200">
                <Users size={18} />
                <span className="text-xl font-black text-white">50k+</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-emerald-100 leading-tight">
                Active Providers
              </p>
              <p className="text-[10px] text-emerald-200/70">
                সক্রিয় সেবাদাতা
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition-all hover:bg-white/15">
              <div className="flex items-center gap-2 text-emerald-200">
                <Award size={18} />
                <span className="text-xl font-black text-white">Verified</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-emerald-100 leading-tight">
                Trust Portal
              </p>
              <p className="text-[10px] text-emerald-200/70">
                ট্রাস্ট পোর্টাল
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: MODERN AUTH FORM (7 Cols on LG)                  */}
        {/* ============================================================== */}
        <section className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7 bg-white">
          <div className="mx-auto w-full max-w-md">
            {/* Mode Switcher Tabs */}
            <div className="mb-6 flex rounded-2xl bg-slate-100/90 p-1 border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setStatusMessage(null);
                }}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  mode === "register"
                    ? "bg-[#00695C] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Create Account / নিবন্ধন
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setStatusMessage(null);
                }}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  mode === "login"
                    ? "bg-[#00695C] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Log In / লগইন
              </button>
            </div>

            {/* Status Feedback Message */}
            {statusMessage && (
              <div
                className={`mb-5 flex items-start gap-2.5 rounded-xl p-3 text-xs font-medium border ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* ============================================== */}
            {/* REGISTER MODE FORM                             */}
            {/* ============================================== */}
            {mode === "register" ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Create Account
                  </h2>
                  <p className="text-xs font-semibold text-[#00695C] mt-0.5">
                    অ্যাকাউন্ট তৈরি করুন
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Fill in your details to get started with the verification process.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name / সম্পূর্ণ নাম
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={regData.fullName}
                        onChange={(e) =>
                          setRegData({ ...regData, fullName: e.target.value })
                        }
                        placeholder="e.g. Rahul Hasan / রাহুল হাসান"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email or Username */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email or Username / ইমেল বা ইউজারনেম
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Mail size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={regData.emailOrUsername}
                        onChange={(e) =>
                          setRegData({ ...regData, emailOrUsername: e.target.value })
                        }
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number / ফোন নম্বর
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
                        placeholder="01712 345678"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password / পাসওয়ার্ড
                      </label>
                      {regData.password && (
                        <span className="text-[10px] font-semibold text-slate-500">
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
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Dynamic Password Strength Bar */}
                    {regData.password && (
                      <div className="mt-1.5 flex gap-1">
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

                  {/* Terms and Conditions Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={regData.agreeTerms}
                      onChange={(e) =>
                        setRegData({ ...regData, agreeTerms: e.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00695C] focus:ring-[#00695C]"
                    />
                    <label htmlFor="terms" className="text-[11px] leading-tight text-slate-600 cursor-pointer">
                      I agree to the{" "}
                      <span className="font-semibold text-[#00695C] underline">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="font-semibold text-[#00695C] underline">
                        Privacy Policy
                      </span>
                      .
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        আমি শর্তাবলী এবং গোপনীয়তা নীতি এর সাথে সম্মত।
                      </span>
                    </label>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00695C] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#00695C]/25 transition-all hover:bg-[#00574C] hover:shadow-xl active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Creating Account...</span>
                      </span>
                    ) : (
                      <>
                        <span>Register / নিবন্ধন করুন</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* ============================================== */
              /* LOGIN MODE FORM                                */
              /* ============================================== */
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Welcome Back
                  </h2>
                  <p className="text-xs font-semibold text-[#00695C] mt-0.5">
                    পুনরায় স্বাগতম
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Log in to access your Nirbhor account and verified tasks.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Phone or Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number or Email / ফোন বা ইমেল
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={loginData.usernameOrPhone}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            usernameOrPhone: e.target.value,
                          })
                        }
                        placeholder="e.g. 01712345678 or user@mail.com"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password / পাসওয়ার্ড
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          alert("Demo: Password reset instructions will be sent via SMS.")
                        }
                        className="text-[11px] font-medium text-[#00695C] hover:underline"
                      >
                        Forgot? / ভুলে গেছেন?
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
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#00695C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
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
                        className="h-3.5 w-3.5 rounded border-slate-300 text-[#00695C] focus:ring-[#00695C]"
                      />
                      <span>Remember Me / মনে রাখুন</span>
                    </label>

                    <button
                      type="button"
                      onClick={fillDemoAccount}
                      className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      Fill Demo Arif / ডেমো পূরণ
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00695C] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#00695C]/25 transition-all hover:bg-[#00574C] hover:shadow-xl active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Logging in...</span>
                      </span>
                    ) : (
                      <>
                        <span>Log In / লগইন করুন</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}



            {/* Copyright */}
            <p className="mt-6 text-center text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
              VERIFIED TRUST PORTAL • © 2026 NIRBHOR
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

