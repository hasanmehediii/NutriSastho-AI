"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { bn } from "@/locales/bn";
import { en } from "@/locales/en";
import type { Translations } from "@/locales/types";

const locales: Record<string, Translations> = { en, bn };

export function useTranslation(): Translations {
  const { language } = useLanguage();
  return locales[language] ?? en;
}
