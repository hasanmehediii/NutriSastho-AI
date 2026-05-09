"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
};

const variantCls: Record<Variant, string> = {
  primary:
    "bg-[color:var(--primary)] text-white shadow-sm hover:bg-[color:var(--primary-strong)] hover:-translate-y-px hover:shadow-md",
  secondary:
    "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-soft)]",
  ghost:
    "text-[color:var(--muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]",
  danger:
    "bg-[color:var(--danger)] text-white shadow-sm hover:opacity-90",
};

const sizeCls: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-2xl gap-2",
  lg: "px-6 py-3 text-sm rounded-2xl gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] disabled:cursor-not-allowed disabled:opacity-60",
        variantCls[variant],
        sizeCls[size],
        className,
      ].join(" ")}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      )}
      {!loading && icon}
      {children}
    </button>
  );
}
