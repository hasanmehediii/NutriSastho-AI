"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "en" | "bn";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
});

function applyLanguage(lang: Language) {
  document.documentElement.lang = lang === "bn" ? "bn" : "en";
}

function readStoredLanguage(): Language {
  const stored = localStorage.getItem("sb-language");
  return stored === "bn" ? "bn" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLanguageState(readStoredLanguage());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Keep html[lang] in sync with the active locale.
  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    applyLanguage(next);
    localStorage.setItem("sb-language", next);
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => {
      const next = current === "en" ? "bn" : "en";
      applyLanguage(next);
      localStorage.setItem("sb-language", next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage }),
    [language, setLanguage, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
