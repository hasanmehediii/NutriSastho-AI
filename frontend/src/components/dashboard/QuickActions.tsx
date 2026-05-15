"use client";

import Link from "next/link";
import {
  HeartPulse,
  ShieldAlert,
  Wallet,
  Utensils,
  Dumbbell,
} from "lucide-react";

const actions = [
  {
    href: "/health-input",
    label: "Log Vitals",
    labelBn: "ভাইটাল লগ",
    icon: HeartPulse,
    color: "#ef4444",
    description: "Record temperature, BP, weight",
  },
  {
    href: "/risk-analysis",
    label: "Check Symptoms",
    labelBn: "উপসর্গ চেক",
    icon: ShieldAlert,
    color: "#f59e0b",
    description: "AI-powered risk assessment",
  },
  {
    href: "/budget",
    label: "Update Budget",
    labelBn: "বাজেট আপডেট",
    icon: Wallet,
    color: "#087f5b",
    description: "Monthly food budget planner",
  },
  {
    href: "/diet-plan",
    label: "View Diet Plan",
    labelBn: "ডায়েট দেখুন",
    icon: Utensils,
    color: "#6366f1",
    description: "Bangladeshi meal plan",
  },
  {
    href: "/exercise-plan",
    label: "Exercise Plan",
    labelBn: "ব্যায়াম",
    icon: Dumbbell,
    color: "#8b5cf6",
    description: "AI-powered workout plan",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href}
            href={a.href}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-center transition-all duration-200 hover:border-[color:var(--primary)]/40 hover:shadow-md hover:-translate-y-0.5"
          >
            <div
              className="grid h-11 w-11 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: `color-mix(in srgb, ${a.color} 12%, transparent)` }}
            >
              <Icon size={20} strokeWidth={2} style={{ color: a.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-[color:var(--foreground)]">{a.label}</p>
              <p className="mt-0.5 text-[11px] text-[color:var(--muted)]">{a.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
