"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
};

export function Input({
  label,
  error,
  icon,
  id,
  className = "",
  ...rest
}: InputProps) {
  return (
    <div className="grid gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[color:var(--foreground)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={[
            "w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--foreground)] placeholder-[color:var(--muted)] outline-none ring-0 transition-all duration-200 hover:border-[color:var(--primary)]/60 focus:border-[color:var(--primary)] focus:ring-3 focus:ring-[color:var(--primary)]/15",
            icon ? "pl-11" : "",
            error
              ? "border-[color:var(--danger)] focus:border-[color:var(--danger)] focus:ring-[color:var(--danger)]/15"
              : "",
            className,
          ].join(" ")}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-[11px] font-semibold text-[color:var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
