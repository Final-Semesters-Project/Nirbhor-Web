"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const LanguageContext = createContext({
  language: "bn",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.bn,
  currentTranslations: translations.bn,
});

export const STORAGE_LANG_KEY = "nirbhor_lang";

export function LanguageProvider({ children }) {
  // Default to 'bn' (Bangla), sync with localStorage on mount
  const [language, setLanguageState] = useState("bn");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved === "en" || saved === "bn") {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = "bn";
    }
  }, []);

  const setLanguage = (newLang) => {
    if (newLang !== "en" && newLang !== "bn") return;
    setLanguageState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
      document.documentElement.lang = newLang;
      // Dispatch a storage event or custom event for non-react listeners
      window.dispatchEvent(new CustomEvent("nirbhor_lang_change", { detail: newLang }));
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "bn" ? "en" : "bn";
    setLanguage(nextLang);
  };

  const currentTranslations = translations[language] || translations.bn;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: currentTranslations,
        currentTranslations,
        isMounted,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

