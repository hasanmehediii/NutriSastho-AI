"use client";

import type { SelectHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  icon?: ReactNode;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({
  label,
  icon,
  options,
  placeholder,
  id,
  className = "",
  ...rest
}: SelectProps) {
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
        <select
          id={id}
          className={[
            "w-full appearance-none rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 pr-10 text-sm text-[color:var(--foreground)] outline-none ring-0 transition-all duration-200 hover:border-[color:var(--primary)]/60 focus:border-[color:var(--primary)] focus:ring-3 focus:ring-[color:var(--primary)]/15",
            icon ? "pl-11" : "",
            className,
          ].join(" ")}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
        />
      </div>
    </div>
  );
}
