"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, UserCheck, LayoutDashboard, Menu, X, ArrowRight } from "lucide-react";
import Brand from "@/components/Brand";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/login",
      activeMatch: (p) => p === "/" || p === "/login" || p === "/register",
      number: "01",
      titleEn: "Auth & Registration",
      titleBn: "লগইন ও নিবন্ধন",
      icon: ShieldCheck,
      badge: "Premium Design",
    },
    {
      href: "/provider/setup",
      activeMatch: (p) => p.startsWith("/provider/setup"),
      number: "02",
      titleEn: "Profile Setup",
      titleBn: "ভেরিফিকেশন সেটআপ",
      icon: UserCheck,
      badge: "85% Done",
    },
    {
      href: "/provider/profile",
      activeMatch: (p) => p.startsWith("/provider/profile"),
      number: "03",
      titleEn: "Provider Dashboard",
      titleBn: "আরিফ আহমেদ প্রোফাইল",
      icon: LayoutDashboard,
      badge: "Verified",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: Brand */}
        <Brand href="/" />

        {/* Center: 3 Screens Switcher for Desktop */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/90 p-1 shadow-inner">
          {navItems.map((item) => {
            const isActive = item.activeMatch(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#00695C] text-white shadow-sm shadow-[#00695C]/25"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700 group-hover:bg-slate-300"
                  }`}
                >
                  {item.number}
                </span>
                <span className="font-semibold">{item.titleEn}</span>
                <span
                  className={`text-[10px] ${
                    isActive ? "text-emerald-100" : "text-slate-400"
                  }`}
                >
                  / {item.titleBn}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action */}
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#00695C] border border-emerald-200/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Nirbhor Trust Portal</span>
          </div>

          <Link
            href="/provider/profile"
            className="flex items-center gap-1.5 rounded-lg bg-[#00695C] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#00574C] hover:shadow"
          >
            <span>Live Profile</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Select Screen / স্ক্রিন নির্বাচন করুন
          </p>
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = item.activeMatch(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-[#00695C] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>
                      {item.number}. {item.titleEn}
                    </span>
                    <span
                      className={`text-xs ${
                        isActive ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      ({item.titleBn})
                    </span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

