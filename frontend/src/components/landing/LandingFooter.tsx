"use client";

import { useTranslation } from "@/hooks/useTranslation";

export function LandingFooter() {
  const t = useTranslation();
  const { nav } = t;
  const copy = t.footer;

  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="NutriShastho AI"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-lg font-bold text-[color:var(--foreground)]">
                {nav.product}
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-[color:var(--muted)]">
              {copy.description}
            </p>
          </div>

          {/* Link columns */}
          <div className="grid gap-8 sm:grid-cols-3">
            {copy.columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold text-[color:var(--foreground)]">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-[color:var(--muted)] transition-colors duration-150 hover:text-[color:var(--primary)]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] p-5 text-sm leading-6 text-[color:var(--muted)]">
          {copy.disclaimer}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-3 border-t border-[color:var(--border)] pt-6 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.copyright}</p>
          <div className="flex gap-4">
            <a
              href="#"
              className="transition-colors duration-150 hover:text-[color:var(--primary)]"
            >
              {copy.privacy}
            </a>
            <a
              href="#"
              className="transition-colors duration-150 hover:text-[color:var(--primary)]"
            >
              {copy.terms}
            </a>
            <a
              href="#"
              className="transition-colors duration-150 hover:text-[color:var(--primary)]"
            >
              {copy.contact}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
