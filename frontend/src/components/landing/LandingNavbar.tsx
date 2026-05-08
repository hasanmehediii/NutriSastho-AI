"use client";

import { useEffect, useState } from "react";
import { Languages, Menu, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/providers/LanguageProvider";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const nav = t.nav;
  const nextLanguage = language === "en" ? "bn" : "en";
  const languageButtonLabel = language === "en" ? "বাং" : "EN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLanguageChange = () => {
    setLanguage(nextLanguage);
    window.location.reload();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div
        className={[
          "mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-xl transition-all duration-300 sm:px-6",
          scrolled
            ? "border-[color:var(--border)] bg-[color:var(--surface)]/95 shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
            : "border-[color:var(--border)]/50 bg-[color:var(--surface)]/75 shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        ].join(" ")}
      >
        <a href="#" className="group flex items-center gap-2.5">
          <img
            src="/icon.png"
            alt="NutriShastho AI"
            className="h-8 w-8 rounded-xl object-cover shadow-sm transition-transform duration-150 group-hover:scale-105"
          />
          <span className="hidden text-sm font-bold text-[color:var(--foreground)] sm:block">
            {nav.product}
          </span>
        </a>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl px-3.5 py-2 text-sm font-medium text-[color:var(--muted)] transition-colors duration-150 hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            aria-label={language === "en" ? "Switch to Bangla" : "Switch to English"}
            onClick={handleLanguageChange}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3.5 py-2 text-sm font-bold text-[color:var(--foreground)] transition-colors duration-150 hover:bg-[color:var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
          >
            <Languages size={16} strokeWidth={2.2} />
            <span>{languageButtonLabel}</span>
          </button>
          <ThemeToggle />

          <a
            href="/login"
            className="rounded-xl border border-[color:var(--border)] px-3.5 py-2 text-sm font-semibold text-[color:var(--foreground)] transition-colors duration-150 hover:bg-[color:var(--surface-soft)]"
          >
            {nav.login}
          </a>
          <a
            href="#demo"
            className="rounded-xl bg-[color:var(--primary)] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-[color:var(--primary-strong)] hover:-translate-y-px active:translate-y-0"
          >
            {nav.cta}
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label={language === "en" ? "Switch to Bangla" : "Switch to English"}
            onClick={handleLanguageChange}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-[11px] font-bold text-[color:var(--foreground)] transition-colors duration-150 hover:bg-[color:var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
          >
            <Languages size={14} strokeWidth={2.2} />
            <span>{languageButtonLabel}</span>
          </button>
          <ThemeToggle size="sm" />

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? nav.closeMenu : nav.openMenu}
            aria-expanded={menuOpen}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[color:var(--border)] text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-soft)]"
          >
            {menuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.12)] lg:hidden">
          <div className="grid gap-1">
            {nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-soft)]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[color:var(--border)] pt-3">
            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-[color:var(--border)] px-4 py-2.5 text-center text-sm font-bold text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-soft)]"
            >
              {nav.login}
            </a>
            <a
              href="#demo"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-[color:var(--primary)] px-4 py-2.5 text-center text-sm font-bold text-white transition-all hover:bg-[color:var(--primary-strong)]"
            >
              {nav.cta}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
