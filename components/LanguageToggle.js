"use client";

import React from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function LanguageToggle({ className = "", size = "md", showLabel = false }) {
  const { language, setLanguage, isMounted } = useLanguage();

  const isBn = isMounted ? language === "bn" : true;
  const isEn = isMounted ? language === "en" : false;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <Globe size={14} className="text-[#00695C]" />
          <span>ভাষা / Lang:</span>
        </span>
      )}

      <div
        role="group"
        aria-label="Language selector"
        className="relative inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-inner"
      >
        {/* Bangla Option */}
        <button
          type="button"
          onClick={() => setLanguage("bn")}
          aria-pressed={isBn}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
            isBn
              ? "bg-[#00695C] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          {isBn && <Check size={12} strokeWidth={3} className="text-emerald-300" />}
          <span>বাংলা</span>
        </button>

        {/* English Option */}
        <button
          type="button"
          onClick={() => setLanguage("en")}
          aria-pressed={isEn}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
            isEn
              ? "bg-[#00695C] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          {isEn && <Check size={12} strokeWidth={3} className="text-emerald-300" />}
          <span>English</span>
        </button>
      </div>
    </div>
  );
}

