"use client";

import type { ReactNode } from "react";

type BadgeVariant = "default" | "green" | "yellow" | "red" | "blue";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
};

const variantCls: Record<BadgeVariant, string> = {
  default:
    "bg-[color:var(--surface-muted)] text-[color:var(--muted)]",
  green:
    "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  yellow:
    "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  red:
    "bg-red-500/12 text-red-600 dark:text-red-400",
  blue:
    "bg-sky-500/12 text-sky-600 dark:text-sky-400",
};

const dotColor: Record<BadgeVariant, string> = {
  default: "bg-[color:var(--muted)]",
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-sky-500",
};

export function Badge({
  children,
  variant = "default",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none",
        variantCls[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColor[variant]}`}
        />
      )}
      {children}
    </span>
  );
}
