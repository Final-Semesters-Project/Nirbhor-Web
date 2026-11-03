"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Briefcase,
  User,
} from "lucide-react";
import { fetchBookingDetail } from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

export default function BookingDetailModal({
  isOpen,
  onClose,
  bookingId,
  token,
}) {
  const { language, t } = useLanguage();
  const d = t.dashboard;
  const c = t.common;

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen && bookingId) {
      loadBooking();
    } else {
      setBooking(null);
      setErrorMessage("");
    }
  }, [isOpen, bookingId, language]);

  const loadBooking = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await fetchBookingDetail(bookingId, token, language);
      setBooking(data);
    } catch (err) {
      console.error("Failed to load booking detail:", err);
      setErrorMessage(
        err.message ||
          (language === "bn"
            ? "বুকিংয়ের বিস্তারিত তথ্য লোড করতে সমস্যা হয়েছে।"
            : "Failed to load booking details.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(language === "bn" ? "bn-BD" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            {d.statusInProgress}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#00695C] border border-emerald-200">
            {d.statusCompleted}
          </span>
        );
      case "INITIATED":
        return (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            {d.statusInitiated}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
            {d.statusCancelled}
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00695C] text-white shadow-md shadow-[#00695C]/20">
              <Briefcase size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {d.bookingDetailTitle}
              </h2>
              {booking?.booking_id && (
                <p className="text-[11px] font-mono text-slate-400">
                  ID: {booking.booking_id}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={32} className="animate-spin text-[#00695C]" />
              <span className="text-xs font-semibold">{c.loading}</span>
            </div>
          ) : errorMessage ? (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : booking ? (
            <>
              {/* Top Status & Customer Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-[#00695C]" />
                    <span className="text-sm font-bold text-slate-900">
                      {booking.other_party_name || d.customer}
                    </span>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                {booking.other_party_phone && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="font-mono font-medium">
                        {booking.other_party_phone}
                      </span>
                    </div>
                    <a
                      href={`tel:${booking.other_party_phone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
                    >
                      <Phone size={12} />
                      <span>{d.callCustomerBtn}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Job Location if coordinates are available */}
              {(booking.job_latitude !== null && booking.job_longitude !== null) && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <MapPin size={16} className="text-[#00695C]" />
                      <span>{d.jobLocationTitle}</span>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${booking.job_latitude},${booking.job_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#00695C] hover:underline"
                    >
                      <span>{d.viewOnMaps}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Lat: {booking.job_latitude}, Long: {booking.job_longitude}
                  </p>
                </div>
              )}

              {/* Job Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Clock size={16} className="text-[#00695C]" />
                  <span>{d.timelineTitle}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                    <span>{d.createdTime}</span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(booking.created_at)}
                    </span>
                  </div>

                  {booking.call_unlocked_at && (
                    <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                      <span>{d.callUnlockedTime}</span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(booking.call_unlocked_at)}
                      </span>
                    </div>
                  )}

                  {booking.confirmed_at && (
                    <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                      <span>{d.confirmedTime}</span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(booking.confirmed_at)}
                      </span>
                    </div>
                  )}

                  {booking.work_schedule && (
                    <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                      <span>{d.scheduledTime}</span>
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        {formatDate(booking.work_schedule)}
                      </span>
                    </div>
                  )}

                  {booking.completed_at && (
                    <div className="flex justify-between text-slate-600 py-1">
                      <span>{d.completedTime}</span>
                      <span className="font-semibold text-[#00695C] bg-emerald-50 px-2 py-0.5 rounded-md">
                        {formatDate(booking.completed_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition-colors"
          >
            {c.close}
          </button>
        </div>
      </div>
    </div>
  );
}

