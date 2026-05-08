"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";

type Props = { size?: "sm" | "md" };

const dimensions = {
  sm: {
    height: "2.25rem",
    padding: "0 0.7rem",
    icon: 14,
    text: "0.72rem",
  },
  md: {
    height: "2.5rem",
    padding: "0 0.85rem",
    icon: 16,
    text: "0.78rem",
  },
};

export function LanguageToggle({ size = "md" }: Props) {
  const { language, setLanguage } = useLanguage();
  const ui = dimensions[size];
  const nextLabel = language === "en" ? "বাং" : "EN";
  const nextLanguage = language === "en" ? "bn" : "en";

  return (
    <button
      type="button"
      aria-label={language === "en" ? "Switch to Bangla" : "Switch to English"}
      onClick={() => setLanguage(nextLanguage)}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] font-bold text-[color:var(--foreground)] transition-colors duration-150 hover:bg-[color:var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
      style={{ height: ui.height, padding: ui.padding, fontSize: ui.text }}
    >
      <Languages size={ui.icon} strokeWidth={2.2} />
      <span>{nextLabel}</span>
    </button>
  );
}
