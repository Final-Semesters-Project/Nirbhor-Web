"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const pathname = usePathname();

  // Function to remove a toast by ID
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Function to clear all active toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // When landing on provider home dashboard, clear all toasts so dashboard stays completely clean
  useEffect(() => {
    if (pathname === "/provider/home") {
      clearAllToasts();
    }
  }, [pathname, clearAllToasts]);

  // Function to show a toast with default 2000ms duration and deduplication
  const showToast = useCallback(
    (message, type = "success", duration = 2000) => {
      if (!message) return;

      // Do not show toasts on the dashboard page
      if (typeof window !== "undefined" && window.location.pathname === "/provider/home") {
        return;
      }

      setToasts((prev) => {
        // Prevent duplicate toast if an identical message is already visible
        if (prev.some((t) => t.message === message)) {
          return prev;
        }

        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newToast = {
          id,
          message,
          type,
          duration,
          createdAt: Date.now(),
        };

        if (duration > 0) {
          setTimeout(() => {
            removeToast(id);
          }, duration);
        }

        return [...prev, newToast];
      });
    },
    [removeToast]
  );

  const toastHelpers = {
    showToast,
    removeToast,
    clearAllToasts,
    success: (msg, duration = 2000) => showToast(msg, "success", duration),
    error: (msg, duration = 2000) => showToast(msg, "error", duration),
    info: (msg, duration = 2000) => showToast(msg, "info", duration),
    warning: (msg, duration = 2000) => showToast(msg, "warning", duration),
  };

  const isDashboard = pathname === "/provider/home";

  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}

      {/* Floating Toast Container - Hidden completely on dashboard */}
      {!isDashboard && (
        <div
          role="region"
          aria-label="Notifications"
          className="fixed top-5 right-4 sm:right-6 z-[9999] flex flex-col gap-2 max-w-sm sm:max-w-md w-full pointer-events-none px-2 sm:px-0"
        >
          {toasts.map((toast) => {
            const isError = toast.type === "error";
            const isWarning = toast.type === "warning";
            const isInfo = toast.type === "info";

            return (
              <div
                key={toast.id}
                className={`toast-slide-in pointer-events-auto relative overflow-hidden rounded-2xl p-3.5 shadow-xl border backdrop-blur-md flex items-center gap-3 transition-all ${
                  isError
                    ? "bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/30"
                    : isWarning
                    ? "bg-slate-900/95 text-white border-amber-500/50 shadow-amber-950/30"
                    : isInfo
                    ? "bg-slate-900/95 text-white border-teal-500/50 shadow-teal-950/30"
                    : "bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/30"
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`shrink-0 rounded-xl p-1.5 flex items-center justify-center ${
                    isError
                      ? "bg-rose-500/20 text-rose-400"
                      : isWarning
                      ? "bg-amber-500/20 text-amber-400"
                      : isInfo
                      ? "bg-teal-500/20 text-teal-300"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {isError ? (
                    <AlertCircle size={17} strokeWidth={2.5} />
                  ) : isWarning ? (
                    <AlertTriangle size={17} strokeWidth={2.5} />
                  ) : isInfo ? (
                    <Info size={17} strokeWidth={2.5} />
                  ) : (
                    <CheckCircle2 size={17} strokeWidth={2.5} />
                  )}
                </div>

                {/* Message Text */}
                <div className="flex-1 pr-1">
                  <p className="text-xs sm:text-sm font-semibold leading-tight text-slate-100">
                    {toast.message}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>

                {/* Auto-dismiss progress bar */}
                {toast.duration > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${
                        isError
                          ? "bg-rose-500"
                          : isWarning
                          ? "bg-amber-500"
                          : isInfo
                          ? "bg-teal-400"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        animation: `toastProgress ${toast.duration}ms linear forwards`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
