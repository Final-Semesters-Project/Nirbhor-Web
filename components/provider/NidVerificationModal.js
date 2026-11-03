"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Shield,
  FileCheck2,
  Loader2,
  Trash2,
  Lock,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  getNidUploadSignature,
  uploadNidImageToCloudinary,
  submitNidVerification,
} from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

export default function NidVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  userMeData,
  token,
}) {
  const { language, t } = useLanguage();
  const d = t.dashboard;
  const c = t.common;

  const [frontFile, setFrontFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);

  const [backFile, setBackFile] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setProgressText("");
      // Pre-fill with existing NID if available
      if (userMeData?.nid_url_front) {
        setFrontPreview(userMeData.nid_url_front);
      } else {
        setFrontFile(null);
        setFrontPreview(null);
      }

      if (userMeData?.nid_url_back) {
        setBackPreview(userMeData.nid_url_back);
      } else {
        setBackFile(null);
        setBackPreview(null);
      }
    }
  }, [isOpen, userMeData]);

  if (!isOpen) return null;

  const handleFrontSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage(
          language === "bn"
            ? "অনুগ্রহ করে শুধু ছবি ফাইল (JPG, PNG) নির্বাচন করুন।"
            : "Please select an image file (JPG, PNG)."
        );
        return;
      }
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleBackSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage(
          language === "bn"
            ? "অনুগ্রহ করে শুধু ছবি ফাইল (JPG, PNG) নির্বাচন করুন।"
            : "Please select an image file (JPG, PNG)."
        );
        return;
      }
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const verificationStatus = userMeData?.verification_status || "not_initiated";
  // #0 "not_initiated", #3 "rejected" -> can change picture & submit
  // #1 "pending", #2 "approved" -> locked, picture cannot be changed, submit disabled
  const isLocked = verificationStatus === "pending" || verificationStatus === "approved";
  const canEdit = verificationStatus === "not_initiated" || verificationStatus === "rejected";

  const clearFront = () => {
    if (isLocked) return;
    setFrontFile(null);
    setFrontPreview(null);
    if (frontInputRef.current) frontInputRef.current.value = "";
  };

  const clearBack = () => {
    if (isLocked) return;
    setBackFile(null);
    setBackPreview(null);
    if (backInputRef.current) backInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (isLocked) return;
    if (!frontFile && !frontPreview) {
      setErrorMessage(
        language === "bn"
          ? "অনুগ্রহ করে এনআইডির সামনের পিঠের ছবি নির্বাচন করুন।"
          : "Please select the front side photo of your NID."
      );
      return;
    }

    if (!backFile && !backPreview) {
      setErrorMessage(
        language === "bn"
          ? "অনুগ্রহ করে এনআইডির পেছনের পিঠের ছবি নির্বাচন করুন।"
          : "Please select the back side photo of your NID."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let finalFrontUrl = frontPreview;
      let finalFrontPublicId = null;

      let finalBackUrl = backPreview;
      let finalBackPublicId = null;

      // 1. Upload Front image if newly selected
      if (frontFile) {
        setProgressText(
          language === "bn"
            ? "সামনের ছবির সিগনেচার যাচাই করা হচ্ছে..."
            : "Requesting signature for Front photo..."
        );
        const frontSig = await getNidUploadSignature("front", token, language);

        setProgressText(
          language === "bn"
            ? "সামনের ছবি সুরক্ষিত সার্ভারে আপলোড হচ্ছে..."
            : "Uploading Front photo to secure cloud..."
        );
        const frontRes = await uploadNidImageToCloudinary(frontFile, frontSig);
        finalFrontUrl = frontRes.secure_url;
        finalFrontPublicId = frontRes.public_id;
      }

      // 2. Upload Back image if newly selected
      if (backFile) {
        setProgressText(
          language === "bn"
            ? "পেছনের ছবির সিগনেচার যাচাই করা হচ্ছে..."
            : "Requesting signature for Back photo..."
        );
        const backSig = await getNidUploadSignature("back", token, language);

        setProgressText(
          language === "bn"
            ? "পেছনের ছবি সুরক্ষিত সার্ভারে আপলোড হচ্ছে..."
            : "Uploading Back photo to secure cloud..."
        );
        const backRes = await uploadNidImageToCloudinary(backFile, backSig);
        finalBackUrl = backRes.secure_url;
        finalBackPublicId = backRes.public_id;
      }

      // 3. Submit to backend
      setProgressText(
        language === "bn"
          ? "নথিপত্র নির্ভরের সিস্টেমে সংরক্ষণ করা হচ্ছে..."
          : "Submitting verification details to Nirbhor..."
      );

      await submitNidVerification(
        {
          nid_url_front: finalFrontUrl,
          nid_front_public_id: finalFrontPublicId,
          nid_url_back: finalBackUrl,
          nid_back_public_id: finalBackPublicId,
        },
        token,
        language
      );

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error("NID submit error:", err);
      setErrorMessage(
        err.message ||
          (language === "bn"
            ? "এনআইডি আপলোড বা যাচাইকরণ জমা দিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।"
            : "Failed to upload or submit NID. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
      setProgressText("");
    }
  };

  const isRejected = userMeData?.verification_status === "rejected";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00695C] text-white shadow-md shadow-[#00695C]/20">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {d.nidModalTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {d.nidModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Approved & Locked Alert */}
          {verificationStatus === "approved" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-900 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#00695C] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-[#00695C] flex items-center gap-1.5 text-sm">
                  <Lock size={14} />
                  {language === "bn" ? "এনআইডি যাচাইকৃত ও অনুমোদিত (লক করা)" : "NID Verified & Approved (Locked)"}
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  {language === "bn"
                    ? "আপনার জাতীয় পরিচয়পত্র নির্ভরের অ্যাডমিন কর্তৃক সফলভাবে যাচাই ও অনুমোদিত হয়েছে। এটি স্থায়ীভাবে সংরক্ষিত ও লক করা রয়েছে।"
                    : "Your National ID has been verified and approved. It is securely saved and permanently locked."}
                </p>
              </div>
            </div>
          )}

          {/* Pending & Locked Alert */}
          {verificationStatus === "pending" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs font-medium text-amber-900 flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-800 flex items-center gap-1.5 text-sm">
                  <Lock size={14} />
                  {language === "bn" ? "যাচাইকরণ প্রক্রিয়াধীন ও লক করা আছে" : "Verification Under Review (Locked)"}
                </span>
                <p className="text-amber-800 leading-relaxed">
                  {language === "bn"
                    ? "আপনার জাতীয় পরিচয়পত্র জমা দেওয়া হয়েছে এবং নির্ভর টিম এটি যাচাই করছে। পর্যালোচনা চলাকালীন ছবি পরিবর্তন বা পুনরায় জমা দেওয়া যাবে না।"
                    : "Your National ID has been submitted and is currently being reviewed. Documents cannot be modified while pending review."}
                </p>
              </div>
            </div>
          )}

          {/* Rejection Alert if applicable */}
          {isRejected && userMeData?.verification_rejection_reason && (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-red-900 block">
                  {d.rejectedBadge}
                </span>
                <p className="text-xs text-red-700">
                  <strong className="font-semibold">{d.rejectionReasonLabel} </strong>
                  {userMeData.verification_rejection_reason}
                </p>
              </div>
            </div>
          )}

          {/* Guideline / Requirements */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
            <FileCheck2 className="h-4 w-4 text-[#00695C] shrink-0 mt-0.5" />
            <span>
              {isLocked
                ? (language === "bn"
                    ? "আপনার সংরক্ষিত এনআইডির ছবি নিচে প্রদর্শিত হচ্ছে।"
                    : "Your saved National ID photos are displayed below.")
                : d.nidRequirements}
            </span>
          </div>

          {/* Upload Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front Side */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{d.frontSide} *</span>
                {frontPreview && !isLocked && (
                  <button
                    type="button"
                    onClick={clearFront}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    <Trash2 size={12} /> {d.clearPhoto}
                  </button>
                )}
                {isLocked && frontPreview && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Lock size={10} /> {language === "bn" ? "লক" : "Locked"}
                  </span>
                )}
              </label>

              <div
                onClick={() => !isLocked && !frontPreview && frontInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  frontPreview
                    ? "border-emerald-300 bg-emerald-50/20"
                    : isLocked
                    ? "border-slate-200 bg-slate-100 cursor-not-allowed"
                    : "border-slate-300 hover:border-[#00695C] bg-slate-50/50 cursor-pointer"
                } min-h-[170px] overflow-hidden`}
              >
                {!isLocked && (
                  <input
                    type="file"
                    ref={frontInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFrontSelect}
                    className="hidden"
                  />
                )}

                {frontPreview ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <img
                      src={frontPreview}
                      alt="NID Front"
                      className="max-h-[140px] w-auto rounded-lg object-contain shadow-sm border border-slate-200"
                    />
                    {!isLocked ? (
                      <button
                        type="button"
                        onClick={() => frontInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="mt-2 text-xs font-bold text-[#00695C] hover:underline cursor-pointer"
                      >
                        {d.changePhoto}
                      </button>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                        <Lock size={12} className="text-slate-400" />
                        <span>{language === "bn" ? "লক করা (পরিবর্তনযোগ্য নয়)" : "Locked (Read Only)"}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00695C]">
                      <Camera size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {d.chooseFront}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      JPG, PNG (Max 5MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Back Side */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{d.backSide} *</span>
                {backPreview && !isLocked && (
                  <button
                    type="button"
                    onClick={clearBack}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                  >
                    <Trash2 size={12} /> {d.clearPhoto}
                  </button>
                )}
                {isLocked && backPreview && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Lock size={10} /> {language === "bn" ? "লক" : "Locked"}
                  </span>
                )}
              </label>

              <div
                onClick={() => !isLocked && !backPreview && backInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  backPreview
                    ? "border-emerald-300 bg-emerald-50/20"
                    : isLocked
                    ? "border-slate-200 bg-slate-100 cursor-not-allowed"
                    : "border-slate-300 hover:border-[#00695C] bg-slate-50/50 cursor-pointer"
                } min-h-[170px] overflow-hidden`}
              >
                {!isLocked && (
                  <input
                    type="file"
                    ref={backInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBackSelect}
                    className="hidden"
                  />
                )}

                {backPreview ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <img
                      src={backPreview}
                      alt="NID Back"
                      className="max-h-[140px] w-auto rounded-lg object-contain shadow-sm border border-slate-200"
                    />
                    {!isLocked ? (
                      <button
                        type="button"
                        onClick={() => backInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="mt-2 text-xs font-bold text-[#00695C] hover:underline cursor-pointer"
                      >
                        {d.changePhoto}
                      </button>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                        <Lock size={12} className="text-slate-400" />
                        <span>{language === "bn" ? "লক করা (পরিবর্তনযোগ্য নয়)" : "Locked (Read Only)"}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00695C]">
                      <Camera size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {d.chooseBack}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      JPG, PNG (Max 5MB)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress / Status feedback */}
          {isSubmitting && progressText && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-[#00695C]">
              <Loader2 size={16} className="animate-spin text-[#00695C]" />
              <span>{progressText}</span>
            </div>
          )}

          {/* Error feedback */}
          {errorMessage && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              {(errorMessage.toLowerCase().includes("credentials") ||
                errorMessage.toLowerCase().includes("session") ||
                errorMessage.includes("সেশন") ||
                errorMessage.includes("লগইন")) && (
                <a
                  href="/login"
                  className="inline-flex items-center justify-center shrink-0 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-sm"
                >
                  {language === "bn" ? "পুনরায় লগইন করুন" : "Log In Again"}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLocked ? (language === "bn" ? "বন্ধ করুন" : "Close") : c.cancel}
          </button>

          {isLocked ? (
            <button
              type="button"
              disabled
              title={
                language === "bn"
                  ? "এনআইডি জমা দেওয়া হয়েছে এবং লক করা আছে।"
                  : "NID is submitted and locked."
              }
              className="flex items-center gap-2 rounded-xl bg-slate-200 border border-slate-300 px-6 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed shadow-none"
            >
              <Lock size={15} className="text-slate-400" />
              <span>
                {verificationStatus === "approved"
                  ? (language === "bn" ? "যাচাইকৃত (লক করা)" : "Verified (Locked)")
                  : (language === "bn" ? "জমা দেওয়া হয়েছে (লক করা)" : "Submitted (Locked)")}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#00695C] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#00695C]/25 hover:bg-[#005247] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{d.uploadingNid}</span>
                </>
              ) : (
                <>
                  <Upload size={15} />
                  <span>{d.submitNidBtn}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

