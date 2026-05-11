"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";

const pageTitles: Record<string, { en: string; bn: string }> = {
  "/dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  "/health-input": { en: "Health Input", bn: "স্বাস্থ্য ইনপুট" },
  "/budget": { en: "Budget Planner", bn: "বাজেট পরিকল্পনা" },
  "/diet-plan": { en: "Diet Plan", bn: "ডায়েট প্ল্যান" },
  "/risk-analysis": { en: "Risk Analysis", bn: "রিস্ক বিশ্লেষণ" },
  "/nearby-care": { en: "Nearby Care", bn: "কাছের সেবা" },
  "/reports": { en: "Reports", bn: "রিপোর্ট" },
  "/family": { en: "Family Profiles", bn: "পরিবার প্রোফাইল" },
  "/settings": { en: "Settings", bn: "সেটিংস" },
};

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const title = pageTitles[pathname]?.[language] ?? "NutriShastho AI";
  const displayName = user?.full_name || user?.email || "Account";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

  async function handleLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-9 w-9 place-items-center rounded-xl text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)] lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-[color:var(--foreground)]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2 sm:flex">
          <Search size={14} strokeWidth={2} className="text-[color:var(--muted)]" />
          <input
            type="text"
            placeholder={language === "bn" ? "খুঁজুন..." : "Search..."}
            className="w-40 bg-transparent text-xs text-[color:var(--foreground)] placeholder-[color:var(--muted)] outline-none"
          />
        </div>

        {/* Notification */}
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-xl text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[color:var(--danger)]" />
        </button>

        {/* User avatar */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-[color:var(--surface-soft)]"
          title={language === "bn" ? "লগ আউট" : "Log out"}
        >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--primary)]/15 text-xs font-bold text-[color:var(--primary)]">
            {initials}
          </div>
          <span className="hidden text-sm font-semibold text-[color:var(--foreground)] sm:block">
            {displayName}
          </span>
        </button>
      </div>
    </header>
  );
}
