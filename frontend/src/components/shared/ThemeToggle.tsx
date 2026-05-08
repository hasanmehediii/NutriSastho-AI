"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

type Props = { size?: "sm" | "md" };

const dimensions = {
  sm: { width: "3.75rem", height: "2rem", thumb: "1.5rem", icon: 12 },
  md: { width: "4.5rem", height: "2.375rem", thumb: "1.875rem", icon: 14 },
};

export function ThemeToggle({ size = "md" }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const ui = dimensions[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="relative inline-flex shrink-0 items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
      style={{ width: ui.width, height: ui.height }}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 flex w-1/2 items-center justify-center">
        <span className={isDark ? "opacity-35 transition-opacity" : "opacity-100 transition-opacity"}>
          <Sun size={ui.icon} strokeWidth={2.4} color="var(--accent)" />
        </span>
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex w-1/2 items-center justify-center">
        <span className={isDark ? "opacity-100 transition-opacity" : "opacity-35 transition-opacity"}>
          <Moon size={ui.icon} strokeWidth={2.4} color="var(--primary)" />
        </span>
      </span>
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute left-1 top-1 flex items-center justify-center rounded-full bg-[color:var(--surface)] shadow-[0_2px_10px_rgba(0,0,0,0.16)] transition-transform duration-300 ease-out",
          isDark ? "translate-x-[calc(100%+0.25rem)]" : "translate-x-0",
        ].join(" ")}
        style={{ width: ui.thumb, height: ui.thumb }}
      >
        {isDark ? (
          <Moon size={ui.icon - 1} strokeWidth={2.4} color="var(--primary)" />
        ) : (
          <Sun size={ui.icon - 1} strokeWidth={2.4} color="var(--accent)" />
        )}
      </span>
    </button>
  );
}
