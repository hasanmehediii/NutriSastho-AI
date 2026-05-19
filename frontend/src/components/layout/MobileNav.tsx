"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  HeartPulse,
  Wallet,
  Utensils,
  Dumbbell,
  ShieldAlert,
  MapPin,
  FileText,
  Users,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", labelBn: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/health-input", label: "Health Input", labelBn: "স্বাস্থ্য ইনপুট", icon: HeartPulse },
  { href: "/budget", label: "Budget", labelBn: "বাজেট", icon: Wallet },
  { href: "/diet-plan", label: "Diet Plan", labelBn: "ডায়েট প্ল্যান", icon: Utensils },
  { href: "/exercise-plan", label: "Exercise Plan", labelBn: "ব্যায়াম পরিকল্পনা", icon: Dumbbell },
  { href: "/risk-analysis", label: "Risk Analysis", labelBn: "রিস্ক বিশ্লেষণ", icon: ShieldAlert },
  { href: "/nearby-care", label: "Nearby Care", labelBn: "কাছের সেবা", icon: MapPin },
  { href: "/reports", label: "Reports", labelBn: "রিপোর্ট", icon: FileText },
  { href: "/family", label: "Family", labelBn: "পরিবার", icon: Users },
  { href: "/settings", label: "Settings", labelBn: "সেটিংস", icon: Settings },
];

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    onClose();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[color:var(--border)] bg-[color:var(--surface)] transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[color:var(--border)] px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="NutriShastho AI"
              width={32}
              height={32}
              className="h-8 w-8 rounded-xl object-cover"
            />
            <span className="text-sm font-bold text-[color:var(--foreground)]">
              NutriShastho AI
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[color:var(--primary)]/10 text-[color:var(--primary)] font-semibold"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]",
                ].join(" ")}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{language === "bn" ? item.labelBn : item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[color:var(--border)] p-3 space-y-3">
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--danger)]"
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>{language === "bn" ? "লগ আউট" : "Log out"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
