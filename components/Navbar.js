"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import Brand from "@/components/Brand";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/LanguageContext";
import { getAccessToken } from "@/lib/auth";

export default function Navbar() {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getAccessToken()));
  }, [pathname]);

  const brandHref = isLoggedIn || pathname.startsWith("/provider") ? "/provider/home" : "/";
  const isProfileActive = pathname.startsWith("/provider/profile");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: Brand - always leads to provider home when logged in */}
        <Brand href={brandHref} />

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Language Toggle */}
          <LanguageToggle />

          {/* Profile link: only visible when authenticated in provider dashboard */}
          {isLoggedIn && pathname.startsWith("/provider") && (
            <Link
              href="/provider/profile"
              aria-current={isProfileActive ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                isProfileActive
                  ? "border-[#00695C] bg-[#00695C] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900"
              }`}
              title="Profile"
            >
              <User
                size={13}
                className={isProfileActive ? "text-white" : "text-[#00695C]"}
              />
              <span>{t.nav?.profile || "Profile"}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
