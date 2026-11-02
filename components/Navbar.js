"use client";

import Link from "next/link";
import { User, ShieldCheck } from "lucide-react";
import Brand from "@/components/Brand";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: Brand */}
        <Brand href="/" />

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#00695C] border border-emerald-200/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Nirbhor Trust Portal</span>
            <span className="sm:hidden">Nirbhor</span>
          </div>

          <Link
            href="/provider/profile"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-900"
            title="View Public Profile Demo"
          >
            <User size={13} className="text-[#00695C]" />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
