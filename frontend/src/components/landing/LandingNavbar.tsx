"use client";

import { useState } from "react";
import Image from "next/image";

export type LandingLanguage = "en" | "bn";
export type LandingTheme = "light" | "dark";

type LandingNavbarProps = {
  language: LandingLanguage;
  theme: LandingTheme;
  onLanguageChange: (language: LandingLanguage) => void;
  onThemeChange: (theme: LandingTheme) => void;
};

const navCopy = {
  en: {
    product: "NutriSastho AI",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#workflow" },
      { label: "Safety", href: "#safety" },
      { label: "Demo", href: "#demo" },
    ],
    login: "Sign in",
    cta: "Start demo",
    language: "BN",
    themeLight: "Light",
    themeDark: "Dark",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  bn: {
    product: "NutriSastho AI",
    links: [
      { label: "ফিচার", href: "#features" },
      { label: "কিভাবে কাজ করে", href: "#workflow" },
      { label: "নিরাপত্তা", href: "#safety" },
      { label: "ডেমো", href: "#demo" },
    ],
    login: "সাইন ইন",
    cta: "ডেমো শুরু",
    language: "EN",
    themeLight: "লাইট",
    themeDark: "ডার্ক",
    openMenu: "মেনু খুলুন",
    closeMenu: "মেনু বন্ধ করুন",
  },
};

export function LandingNavbar({
  language,
  theme,
  onLanguageChange,
  onThemeChange,
}: LandingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const copy = navCopy[language];
  const nextLanguage = language === "en" ? "bn" : "en";
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]/88 px-4 py-3 shadow-[var(--shadow)] backdrop-blur-xl sm:px-5">
        <a href="#" className="flex items-center gap-3" aria-label={copy.product}>
          <img
              src="/icon.png"
              alt="NutriSastho AI"
              className="h-10 w-10 rounded-full object-cover"
            />
          <span className="text-base font-bold text-[color:var(--foreground)] sm:text-lg">
            {copy.product}
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {copy.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => onLanguageChange(nextLanguage)}
            className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-soft)]"
          >
            {copy.language}
          </button>
          <button
            type="button"
            onClick={() => onThemeChange(nextTheme)}
            className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-soft)]"
          >
            {theme === "light" ? copy.themeDark : copy.themeLight}
          </button>
          <a
            href="#demo"
            className="rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[color:var(--primary-strong)]"
          >
            {copy.cta}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border)] text-[color:var(--foreground)] lg:hidden"
          aria-label={isOpen ? copy.closeMenu : copy.openMenu}
          aria-expanded={isOpen}
        >
          <span className="flex w-5 flex-col gap-1.5">
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
          </span>
        </button>
      </nav>

      {isOpen ? (
        <div className="mx-auto mt-3 max-w-7xl rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow)] lg:hidden">
          <div className="grid gap-2">
            {copy.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-soft)]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onLanguageChange(nextLanguage)}
              className="rounded-full border border-[color:var(--border)] px-4 py-3 text-sm font-bold text-[color:var(--foreground)]"
            >
              {copy.language}
            </button>
            <button
              type="button"
              onClick={() => onThemeChange(nextTheme)}
              className="rounded-full border border-[color:var(--border)] px-4 py-3 text-sm font-bold text-[color:var(--foreground)]"
            >
              {theme === "light" ? copy.themeDark : copy.themeLight}
            </button>
          </div>
          <a
            href="#demo"
            onClick={() => setIsOpen(false)}
            className="mt-3 block rounded-full bg-[color:var(--primary)] px-5 py-3 text-center text-sm font-bold text-white"
          >
            {copy.cta}
          </a>
        </div>
      ) : null}
    </header>
  );
}
