"use client";

import { useState } from "react";
import { MapPin, Navigation, Sliders, Check, Compass, ZoomIn, ZoomOut } from "lucide-react";

export default function ServiceAreaMap({
  initialRadius = 15,
  centerName = "Motijheel, Dhaka",
  onRadiusChange,
}) {
  const [radius, setRadius] = useState(initialRadius);
  const [isEditing, setIsEditing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const landmarks = [
    { name: "Motijheel (Center)", bn: "মতিঝিল (কেন্দ্র)", x: 50, y: 52, isCenter: true },
    { name: "Kawran Bazar", bn: "কাওরান বাজার", x: 42, y: 38 },
    { name: "Dhanmondi", bn: "ধানমন্ডি", x: 30, y: 46 },
    { name: "Gulshan 1", bn: "গুলশান ১", x: 56, y: 26 },
    { name: "Banani", bn: "বনানী", x: 54, y: 16 },
    { name: "Old Dhaka", bn: "পুরান ঢাকা", x: 48, y: 68 },
    { name: "Sadarghat", bn: "সদরঘাট", x: 52, y: 80 },
    { name: "Mirpur 10", bn: "মিরপুর ১০", x: 28, y: 22 },
    { name: "Khilgaon", bn: "খিলগাঁও", x: 68, y: 44 },
    { name: "Jatrabari", bn: "যাত্রাবাড়ী", x: 64, y: 72 },
  ];

  // Map radius (5 to 30km) to SVG circle pixel radius
  const svgRadius = Math.min(100, Math.max(25, (radius / 25) * 80 * zoomLevel));

  const handleSliderChange = (newVal) => {
    setRadius(newVal);
    if (onRadiusChange) onRadiusChange(newVal);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Map Display Viewport */}
      <div className="relative h-60 sm:h-64 w-full overflow-hidden rounded-xl border border-slate-700/60 bg-[#1E293B] shadow-inner select-none">
        {/* Subtle Map Grid lines */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #64748B 1px, transparent 1px),
              linear-gradient(to bottom, #64748B 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Buriganga River Curve illustration */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 10 92 Q 40 82 55 86 T 95 90"
            fill="none"
            stroke="#0284C7"
            strokeWidth="3.5"
            strokeOpacity="0.4"
          />
          <path
            d="M 25 35 Q 38 48 45 60 T 52 82"
            fill="none"
            stroke="#475569"
            strokeWidth="1.8"
            strokeDasharray="2,2"
            strokeOpacity="0.6"
          />
          <path
            d="M 50 10 Q 52 35 50 55 T 48 85"
            fill="none"
            stroke="#475569"
            strokeWidth="2.5"
            strokeOpacity="0.5"
          />
          <path
            d="M 15 50 Q 50 52 85 48"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeOpacity="0.4"
          />

          {/* Active Service Radar Circle centered on Motijheel (50, 52) */}
          <circle
            cx="50"
            cy="52"
            r={svgRadius}
            fill="#00695C"
            fillOpacity="0.18"
            stroke="#14B8A6"
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />

          {/* Pulse ring animation */}
          <circle
            cx="50"
            cy="52"
            r={svgRadius * 0.9}
            fill="none"
            stroke="#2DD4BF"
            strokeWidth="1"
            className="animate-ping"
            style={{ transformOrigin: "50% 52%", animationDuration: "3s" }}
          />

          {/* Inner tight core */}
          <circle
            cx="50"
            cy="52"
            r={svgRadius * 0.45}
            fill="#00695C"
            fillOpacity="0.12"
            stroke="#0D9488"
            strokeWidth="1"
          />
        </svg>

        {/* Landmarks Markers */}
        {landmarks.map((lm) => {
          if (lm.isCenter) {
            return (
              <div
                key={lm.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute h-8 w-8 rounded-full bg-emerald-400/30 animate-ping" />
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00695C] text-white shadow-lg ring-2 ring-white">
                    <MapPin size={13} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="mt-1 rounded bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow backdrop-blur-xs border border-emerald-500/40 whitespace-nowrap">
                  {lm.name}
                </div>
              </div>
            );
          }

          return (
            <div
              key={lm.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
              style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="text-[8px] font-medium text-slate-300 drop-shadow">
                {lm.name}
              </span>
            </div>
          );
        })}

        {/* Top Floating Info Tag */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-2 rounded-lg bg-slate-900/85 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm border border-slate-700/60 shadow">
          <Navigation size={12} className="text-emerald-400" />
          <span className="font-semibold text-emerald-400">{radius} km</span>
          <span className="text-slate-300">Coverage Radius</span>
        </div>

        {/* Map Controls */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
            className="flex h-6 w-6 items-center justify-center rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700 text-xs"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            className="flex h-6 w-6 items-center justify-center rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700 text-xs"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
        </div>

        {/* Center Coordinate Pin Label at bottom */}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/50">
          <Compass size={11} className="text-slate-400" />
          <span>Hub: {centerName} (23.7330° N, 90.4172° E)</span>
        </div>
      </div>

      {/* Range Adjuster Toggle / Drawer */}
      <div className="mt-3">
        {isEditing ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800">
                Adjust Coverage Radius / এলাকা ব্যাসার্ধ নির্ধারণ:
              </span>
              <span className="rounded-md bg-[#00695C] px-2 py-0.5 text-xs font-bold text-white">
                {radius} km
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={radius}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full accent-[#00695C] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-medium text-slate-500 mt-1">
              <span>3 km (Local)</span>
              <span>15 km (Default)</span>
              <span>30 km (Greater Dhaka)</span>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 rounded-lg bg-[#00695C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00574C]"
              >
                <Check size={13} />
                <span>Confirm & Save / নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Active within <strong className="text-slate-700">{radius}km</strong> of Motijheel Hub.
            </p>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#00695C] hover:text-[#004D40] hover:underline transition-colors"
            >
              <Sliders size={13} />
              <span>Change Range / এলাকা পরিবর্তন করুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

