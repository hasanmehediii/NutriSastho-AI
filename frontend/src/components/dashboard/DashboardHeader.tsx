"use client";

import { CalendarDays } from "lucide-react";

type Props = {
  name: string;
  greeting: string;
  date: string;
};

export function DashboardHeader({ name, greeting, date }: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-black text-[color:var(--foreground)] sm:text-3xl">
        {greeting}, {name} 👋
      </h2>
      <div className="mt-1.5 flex items-center gap-2 text-sm text-[color:var(--muted)]">
        <CalendarDays size={14} strokeWidth={2} />
        <span>{date}</span>
      </div>
    </div>
  );
}
