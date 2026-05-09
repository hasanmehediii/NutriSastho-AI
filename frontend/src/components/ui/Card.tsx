"use client";

import type { ReactNode } from "react";

type CardVariant = "default" | "glass" | "bordered";

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  padding?: boolean;
  onClick?: () => void;
};

const variantCls: Record<CardVariant, string> = {
  default:
    "border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm",
  glass:
    "border border-[color:var(--border)]/60 bg-[color:var(--surface)]/60 backdrop-blur-xl shadow-lg",
  bordered:
    "border-2 border-[color:var(--primary)]/20 bg-[color:var(--surface)]",
};

export function Card({
  children,
  variant = "default",
  className = "",
  padding = true,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "rounded-2xl transition-colors duration-200",
        variantCls[variant],
        padding ? "p-5" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`text-base font-bold text-[color:var(--foreground)] ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`mt-1 text-sm text-[color:var(--muted)] ${className}`}>
      {children}
    </p>
  );
}
