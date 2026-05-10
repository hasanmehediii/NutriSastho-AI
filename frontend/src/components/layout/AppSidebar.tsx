"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  HeartPulse,
  Wallet,
  Utensils,
  ShieldAlert,
  MapPin,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useLanguage } from "@/providers/LanguageProvider";
import { Languages } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", labelBn: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/health-input", label: "Health Input", labelBn: "স্বাস্থ্য ইনপুট", icon: HeartPulse },
  { href: "/budget", label: "Budget", labelBn: "বাজেট", icon: Wallet },
  { href: "/diet-plan", label: "Diet Plan", labelBn: "ডায়েট প্ল্যান", icon: Utensils },
  { href: "/risk-analysis", label: "Risk Analysis", labelBn: "রিস্ক বিশ্লেষণ", icon: ShieldAlert },
  { href: "/nearby-care", label: "Nearby Care", labelBn: "কাছের সেবা", icon: MapPin },
  { href: "/reports", label: "Reports", labelBn: "রিপোর্ট", icon: FileText },
  { href: "/family", label: "Family", labelBn: "পরিবার", icon: Users },
  { href: "/settings", label: "Settings", labelBn: "সেটিংস", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside
      className={[
        "hidden lg:flex flex-col border-r border-[color:var(--border)] bg-[color:var(--surface)] transition-all duration-300 relative",
        collapsed ? "w-[72px]" : "w-[260px]",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[color:var(--border)] px-4">
        <Image
          src="/icon.png"
          alt="NutriShastho AI"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-xl object-cover"
        />
        {!collapsed && (
          <span className="text-sm font-bold text-[color:var(--foreground)] truncate">
            NutriShastho AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[color:var(--primary)]/10 text-[color:var(--primary)] font-semibold"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]",
                collapsed ? "justify-center px-0" : "",
              ].join(" ")}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
              {!collapsed && (
                <span className="truncate">
                  {language === "bn" ? item.labelBn : item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-[color:var(--border)] p-3 space-y-2">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
          <ThemeToggle size="sm" />
          {!collapsed && (
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-2.5 py-1.5 text-[11px] font-bold text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-soft)]"
            >
              <Languages size={12} strokeWidth={2.2} />
              {language === "en" ? "বাং" : "EN"}
            </button>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--danger)]"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>{language === "bn" ? "লগ আউট" : "Log out"}</span>
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-20 z-10 grid h-6 w-6 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] shadow-sm transition-colors hover:text-[color:var(--foreground)]"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={12} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={12} strokeWidth={2.5} />
        )}
      </button>
    </aside>
  );
}
