"use client";

import { useState, useEffect } from "react";
import {
  X,
  Wrench,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  fetchCategories,
  fetchSkillsByCategory,
  addProviderSkills,
} from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

export default function AddSkillsModal({
  isOpen,
  onClose,
  onSuccess,
  existingSkills = [],
  token,
}) {
  const { language, t } = useLanguage();
  const d = t.dashboard;
  const c = t.common;

  const [categories, setCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState([]);
  const [categorySkills, setCategorySkills] = useState({});
  const [loadingSkillsCategories, setLoadingSkillsCategories] = useState({});

  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const existingSkillIds = new Set(existingSkills.map((s) => Number(s.id)));

  // Load categories on open
  useEffect(() => {
    if (isOpen) {
      setSelectedSkillIds([]);
      setErrorMessage("");
      loadCategories();
    }
  }, [isOpen, language]);

  const loadCategories = async () => {
    setIsCategoryLoading(true);
    try {
      const list = await fetchCategories(language);
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const toggleCategory = async (categoryId) => {
    const isExpanded = expandedCategories.includes(categoryId);
    if (isExpanded) {
      setExpandedCategories(expandedCategories.filter((id) => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
      // Fetch skills if not loaded yet
      if (!categorySkills[categoryId]) {
        setLoadingSkillsCategories((prev) => ({ ...prev, [categoryId]: true }));
        try {
          const skills = await fetchSkillsByCategory(categoryId, language);
          setCategorySkills((prev) => ({ ...prev, [categoryId]: skills }));
        } catch (err) {
          console.error(`Failed to fetch skills for category ${categoryId}:`, err);
        } finally {
          setLoadingSkillsCategories((prev) => ({ ...prev, [categoryId]: false }));
        }
      }
    }
  };

  const toggleSkill = (skillId) => {
    if (existingSkillIds.has(skillId)) return;
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (selectedSkillIds.length === 0) {
      setErrorMessage(
        language === "bn"
          ? "অনুগ্রহ করে কমপক্ষে একটি নতুন দক্ষতা নির্বাচন করুন।"
          : "Please select at least one skill to add."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await addProviderSkills(selectedSkillIds, token, language);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Failed to add skills:", err);
      setErrorMessage(
        err.message ||
          (language === "bn"
            ? "দক্ষতা যুক্ত করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।"
            : "Failed to add skills. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00695C] text-white shadow-md shadow-[#00695C]/20">
              <Wrench size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {d.addSkillsTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {d.addSkillsSubtitle}
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
        <div className="overflow-y-auto p-6 space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Categories List */}
          {isCategoryLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={28} className="animate-spin text-[#00695C]" />
              <span className="text-xs font-medium">{c.loading}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => {
                const isExpanded = expandedCategories.includes(cat.id);
                const skills = categorySkills[cat.id] || [];
                const isLoadingSkills = loadingSkillsCategories[cat.id];
                const catName = language === "bn" ? cat.name_bn || cat.name : cat.name_en || cat.name;

                return (
                  <div
                    key={cat.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all shadow-sm"
                  >
                    {/* Category Title Row */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#00695C]">
                          <Wrench size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {catName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Expandable Skills Section */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                        {isLoadingSkills ? (
                          <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-400">
                            <Loader2 size={16} className="animate-spin text-[#00695C]" />
                            <span>{c.loading}</span>
                          </div>
                        ) : skills.length === 0 ? (
                          <p className="py-2 text-center text-xs text-slate-400">
                            {language === "bn"
                              ? "এই ক্যাটাগরিতে কোনো দক্ষতা পাওয়া যায়নি।"
                              : "No skills found under this category."}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {skills.map((skill) => {
                              const skillId = Number(skill.id);
                              const isAlreadyAdded = existingSkillIds.has(skillId);
                              const isSelected = selectedSkillIds.includes(skillId);
                              const skillName =
                                language === "bn"
                                  ? skill.name_bn || skill.name
                                  : skill.name_en || skill.name;

                              return (
                                <button
                                  key={skillId}
                                  type="button"
                                  disabled={isAlreadyAdded || isSubmitting}
                                  onClick={() => toggleSkill(skillId)}
                                  className={`flex items-center justify-between rounded-xl p-3 text-left transition-all ${
                                    isAlreadyAdded
                                      ? "bg-slate-100/70 border border-slate-200 text-slate-400 cursor-not-allowed"
                                      : isSelected
                                      ? "bg-[#00695C] border border-[#00695C] text-white shadow-sm"
                                      : "bg-white border border-slate-200 hover:border-emerald-300 text-slate-800"
                                  }`}
                                >
                                  <span className="text-xs font-semibold">
                                    {skillName}
                                  </span>

                                  {isAlreadyAdded ? (
                                    <span className="text-[10px] font-bold uppercase tracking-wider rounded-md bg-slate-200 px-1.5 py-0.5 text-slate-500">
                                      {d.alreadyAddedBadge}
                                    </span>
                                  ) : isSelected ? (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[#00695C]">
                                      <Check size={13} strokeWidth={3} />
                                    </div>
                                  ) : (
                                    <div className="h-5 w-5 rounded-md border border-slate-300" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="text-xs font-semibold text-slate-600">
            {selectedSkillIds.length > 0 ? (
              <span className="text-[#00695C] font-bold">
                {language === "bn"
                  ? `${selectedSkillIds.length.toLocaleString("bn-BD")} ${d.selectedSkillsCount}`
                  : `${selectedSkillIds.length} ${d.selectedSkillsCount}`}
              </span>
            ) : (
              <span>0 {d.selectedSkillsCount}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {c.cancel}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedSkillIds.length === 0}
              className="flex items-center gap-2 rounded-xl bg-[#00695C] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#00695C]/25 hover:bg-[#005247] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>{d.savingSkills}</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>{d.saveSkillsBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

