import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Brand({
  compact = false,
  inverted = false,
  href = "/",
  className = "",
}) {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Shield Badge */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-105 ${
          inverted
            ? "border border-white/20 bg-white/10 text-white shadow-sm"
            : "bg-[#00695C] text-white shadow-md shadow-[#00695C]/20"
        }`}
      >
        <ShieldCheck size={22} strokeWidth={2.2} />
      </div>

      {!compact && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-base font-extrabold tracking-tight ${
                inverted ? "text-white" : "text-slate-900"
              }`}
            >
              Nirbhor
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                inverted
                  ? "bg-white/15 text-emerald-200"
                  : "bg-emerald-50 text-[#00695C]"
              }`}
            >
              নির্ভর
            </span>
          </div>
          <p
            className={`text-[11px] leading-tight font-medium ${
              inverted ? "text-emerald-100/80" : "text-slate-500"
            }`}
          >
            Verified Trust Portal
          </p>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
