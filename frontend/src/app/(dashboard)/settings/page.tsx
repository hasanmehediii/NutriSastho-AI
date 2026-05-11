"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Bell,
  Shield,
  Download,
  Trash2,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill from real user data
  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setLocation(user.location || "");
    }
  }, [user]);

  const [notifications, setNotifications] = useState({
    healthAlerts: true,
    dietReminders: true,
    weeklyReport: false,
    budgetAlerts: true,
  });

  function toggleNotif(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSaveProfile() {
    setSaving(true);
    setError("");
    try {
      await updateProfile({
        full_name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Success toast */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-5 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={18} strokeWidth={2} />
          Profile updated successfully!
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/8 px-5 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Profile section */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--primary)]/12">
            <User size={20} strokeWidth={2} className="text-[color:var(--primary)]" />
          </div>
          <div>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="settingsName"
            label="Full Name"
            icon={<User size={16} strokeWidth={2} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            id="settingsEmail"
            label="Email"
            icon={<Mail size={16} strokeWidth={2} />}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
          />
          <Input
            id="settingsPhone"
            label="Phone"
            icon={<Phone size={16} strokeWidth={2} />}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            id="settingsLocation"
            label="Location"
            icon={<MapPin size={16} strokeWidth={2} />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveProfile} loading={saving}>
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/12">
            <Palette size={20} strokeWidth={2} className="text-indigo-500" />
          </div>
          <div>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </div>
        </div>

        <div className="space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between rounded-xl bg-[color:var(--surface-soft)] px-4 py-3">
            <div className="flex items-center gap-3">
              <Palette size={16} strokeWidth={2} className="text-[color:var(--muted)]" />
              <div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">Theme</p>
                <p className="text-[11px] text-[color:var(--muted)]">
                  Currently: {theme === "dark" ? "Dark mode" : "Light mode"}
                </p>
              </div>
            </div>
            <ThemeToggle size="sm" />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between rounded-xl bg-[color:var(--surface-soft)] px-4 py-3">
            <div className="flex items-center gap-3">
              <Globe size={16} strokeWidth={2} className="text-[color:var(--muted)]" />
              <div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">Language</p>
                <p className="text-[11px] text-[color:var(--muted)]">
                  Currently: {language === "en" ? "English" : "বাংলা"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-1.5 text-xs font-bold text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-muted)]"
            >
              {language === "en" ? "বাংলা" : "English"}
            </button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/12">
            <Bell size={20} strokeWidth={2} className="text-amber-500" />
          </div>
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what alerts you receive</CardDescription>
          </div>
        </div>

        <div className="space-y-3">
          {(
            [
              { key: "healthAlerts" as const, label: "Health Alerts", desc: "Emergency and risk notifications" },
              { key: "dietReminders" as const, label: "Diet Reminders", desc: "Daily meal plan reminders" },
              { key: "weeklyReport" as const, label: "Weekly Report", desc: "Summary of weekly health data" },
              { key: "budgetAlerts" as const, label: "Budget Alerts", desc: "Budget limit notifications" },
            ] as const
          ).map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between rounded-xl bg-[color:var(--surface-soft)] px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{n.label}</p>
                <p className="text-[11px] text-[color:var(--muted)]">{n.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotif(n.key)}
                className={[
                  "relative h-6 w-11 rounded-full transition-colors duration-200",
                  notifications[n.key]
                    ? "bg-[color:var(--primary)]"
                    : "bg-[color:var(--surface-muted)] border border-[color:var(--border)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                    notifications[n.key] ? "translate-x-5" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/12">
            <Shield size={20} strokeWidth={2} className="text-red-500" />
          </div>
          <div>
            <CardTitle>Privacy & Data</CardTitle>
            <CardDescription>Control your health data</CardDescription>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-[color:var(--surface-soft)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">Download Your Data</p>
              <p className="text-[11px] text-[color:var(--muted)]">
                Export all your health records as JSON
              </p>
            </div>
            <Button variant="secondary" size="sm" icon={<Download size={14} />}>
              Download
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Delete Account
              </p>
              <p className="text-[11px] text-[color:var(--muted)]">
                Permanently remove all your data
              </p>
            </div>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />}>
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Info size={16} strokeWidth={2} className="text-[color:var(--muted)]" />
          <CardTitle>About</CardTitle>
        </div>
        <div className="space-y-2 text-sm text-[color:var(--muted)]">
          <p>
            <span className="font-semibold text-[color:var(--foreground)]">NutriShastho AI</span>{" "}
            v1.0.0
          </p>
          <p>
            A Bangladesh-focused AI health and nutrition companion. Built for accessible,
            ethical care.
          </p>
          <p className="text-xs italic">
            This application provides educational guidance and decision support. It does not
            replace a qualified doctor or emergency medical care.
          </p>
        </div>
      </Card>
    </div>
  );
}
