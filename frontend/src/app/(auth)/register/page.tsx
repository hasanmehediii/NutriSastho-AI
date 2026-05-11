"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Salad,
  MapPin,
  Lock,
  User,
  Phone,
  Droplets,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { useAuth } from "@/providers/AuthProvider";

const featureIcons = [Salad, ShieldCheck, MapPin];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/* ─── Password strength helper ─── */
type PasswordStrength = "none" | "weak" | "fair" | "good" | "strong";

function evaluatePassword(pw: string): {
  strength: PasswordStrength;
  label: string;
  color: string;
  percent: number;
} {
  if (!pw) return { strength: "none", label: "", color: "", percent: 0 };

  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1)
    return { strength: "weak", label: "Weak", color: "var(--danger)", percent: 25 };
  if (score === 2)
    return { strength: "fair", label: "Fair", color: "var(--accent)", percent: 50 };
  if (score === 3)
    return { strength: "good", label: "Good", color: "#22c55e", percent: 75 };
  return { strength: "strong", label: "Strong", color: "var(--primary)", percent: 100 };
}

/* ─── Shared input style ─── */
const inputCls =
  "w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--foreground)] placeholder-[color:var(--muted)] outline-none ring-0 transition-all duration-200 hover:border-[color:var(--primary)]/60 focus:border-[color:var(--primary)] focus:ring-3 focus:ring-[color:var(--primary)]/15";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, register } = useAuth();
  const t = useTranslation();
  const a = t.auth;
  const r = (t as Record<string, unknown>).register as Record<string, string> | undefined;

  /* ─── Form state ─── */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [location, setLocation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordInfo = useMemo(() => evaluatePassword(password), [password]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, router, user]);

  /* ─── Submit ─── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError(r?.fullNameRequired ?? "Full name is required.");
      return;
    }
    if (!email.trim()) {
      setError(r?.emailRequired ?? "Email address is required.");
      return;
    }
    if (!phone.trim()) {
      setError(r?.phoneRequired ?? "Phone number is required.");
      return;
    }
    if (password.length < 6) {
      setError(r?.passwordMin ?? "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError(r?.passwordMismatch ?? "Passwords do not match.");
      return;
    }
    if (!bloodGroup) {
      setError(r?.bloodGroupRequired ?? "Please select your blood group.");
      return;
    }
    if (!location.trim()) {
      setError(r?.locationRequired ?? "Location is required.");
      return;
    }

    try {
      setLoading(true);
      await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        bloodGroup,
        location: location.trim(),
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <LandingNavbar />

      <div className="flex min-h-screen flex-col gap-6 px-6 pb-8 pt-24 lg:flex-row lg:gap-0 lg:px-0 lg:pb-0">
        {/* ───── Left decorative panel (same as login) ───── */}
        <div className="relative order-2 flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[image:var(--login-panel-bg)] p-6 sm:p-8 lg:order-1 lg:min-h-auto lg:w-[46%] lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:p-10 xl:w-[42%]">
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[image:var(--login-panel-grid)] bg-[size:40px_40px] opacity-45 [mask-image:linear-gradient(to_bottom_right,black_24%,transparent_82%)]" />
          {/* Accent orbs */}
          <div className="absolute -right-28 top-20 h-72 w-72 rounded-full border border-[color:var(--login-panel-icon-border)] bg-[color:var(--login-panel-orb-primary)] shadow-[0_0_70px_rgb(217_129_38/0.18)]" />
          <div className="absolute bottom-16 left-10 h-44 w-44 rounded-full border border-[color:var(--login-panel-icon-border)] bg-[color:var(--login-panel-orb-secondary)] shadow-[0_0_50px_rgb(8_127_91/0.14)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[image:var(--login-panel-bottom)]" />

          {/* Hero copy */}
          <div className="relative z-10">
            <h1 className="text-3xl font-black leading-tight text-[color:var(--foreground)] sm:text-4xl xl:text-5xl">
              {r?.heroHeadline ?? "Join the health revolution today."}
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-[color:var(--muted)]">
              {r?.heroSubtext ??
                "Create your free NutriShastho AI account and start managing your health with budget-smart, AI-powered guidance."}
            </p>

            <ul className="mt-8 grid gap-4">
              {(a.heroPoints ?? []).map((point, i) => {
                const Icon = featureIcons[i];
                return (
                  <li key={point} className="flex items-center gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:var(--login-panel-icon-border)] bg-[color:var(--login-panel-icon-bg)] text-[color:var(--primary)] shadow-[var(--login-panel-icon-shadow)]">
                      <Icon size={17} strokeWidth={2} />
                    </span>
                    <span className="text-sm font-semibold text-[color:var(--foreground)]">
                      {point}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Bottom note */}
          <p className="relative z-10 text-xs font-medium text-[color:var(--muted)]">
            © 2026 NutriShastho AI · Built for accessible, ethical care
          </p>
        </div>

        {/* ───── Right form panel ───── */}
        <div className="order-1 flex flex-1 lg:order-2">
          <div className="flex flex-1 items-center justify-center py-4 sm:py-8 lg:px-10">
            <div className="w-full max-w-md rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)]/72 p-6 shadow-[var(--shadow)] sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-3xl font-black text-[color:var(--foreground)]">
                  {r?.title ?? "Create your account"}
                </h2>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {r?.subtitle ?? "Start your health journey with NutriShastho AI"}
                </p>
              </div>

              {/* Google button */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition-all duration-200 hover:bg-[color:var(--surface-soft)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                </svg>
                {a.continueWithGoogle}
              </button>

              {/* Divider */}
              <div className="relative my-5 flex items-center">
                <div className="flex-1 border-t border-[color:var(--border)]" />
                <span className="mx-4 shrink-0 text-xs font-medium text-[color:var(--muted)]">
                  {a.orContinueWith}
                </span>
                <div className="flex-1 border-t border-[color:var(--border)]" />
              </div>

              {/* ─── Form ─── */}
              <form onSubmit={handleSubmit} noValidate className="grid gap-4">
                {/* Full name */}
                <div className="grid gap-1.5">
                  <label htmlFor="fullName" className="text-sm font-semibold text-[color:var(--foreground)]">
                    {r?.fullNameLabel ?? "Full name"}
                  </label>
                  <div className="relative">
                    <User size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={r?.fullNamePlaceholder ?? "Enter your full name"}
                      className={`${inputCls} pl-11`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="grid gap-1.5">
                  <label htmlFor="reg-email" className="text-sm font-semibold text-[color:var(--foreground)]">
                    {a.emailLabel}
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={a.emailPlaceholder}
                    className={inputCls}
                  />
                </div>

                {/* Phone */}
                <div className="grid gap-1.5">
                  <label htmlFor="phone" className="text-sm font-semibold text-[color:var(--foreground)]">
                    {r?.phoneLabel ?? "Phone number"}
                  </label>
                  <div className="relative">
                    <Phone size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={r?.phonePlaceholder ?? "+880 1XXX-XXXXXX"}
                      className={`${inputCls} pl-11`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="reg-password" className="text-sm font-semibold text-[color:var(--foreground)]">
                      {a.passwordLabel}
                    </label>
                    <a
                      href="#"
                      className="text-xs font-semibold text-[color:var(--primary)] transition-colors hover:text-[color:var(--primary-strong)]"
                    >
                      {a.forgotPassword}
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={a.passwordPlaceholder}
                      className={`${inputCls} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {password && (
                    <div className="grid gap-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${passwordInfo.percent}%`,
                              backgroundColor: passwordInfo.color,
                            }}
                          />
                        </div>
                        <span
                          className="shrink-0 text-[11px] font-bold"
                          style={{ color: passwordInfo.color }}
                        >
                          {passwordInfo.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="grid gap-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-[color:var(--foreground)]">
                    {r?.confirmPasswordLabel ?? "Confirm password"}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={r?.confirmPasswordPlaceholder ?? "Re-enter your password"}
                      className={`${inputCls} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                    </button>
                  </div>
                  {/* Mismatch indicator */}
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] font-semibold text-[color:var(--danger)]">
                      {r?.passwordMismatch ?? "Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* Blood group + Location row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Blood group */}
                  <div className="grid gap-1.5">
                    <label htmlFor="bloodGroup" className="text-sm font-semibold text-[color:var(--foreground)]">
                      {r?.bloodGroupLabel ?? "Blood group"}
                    </label>
                    <div className="relative">
                      <Droplets size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                      <select
                        id="bloodGroup"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className={`${inputCls} appearance-none pl-11 pr-10`}
                      >
                        <option value="">{r?.bloodGroupPlaceholder ?? "Select"}</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} strokeWidth={2} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid gap-1.5">
                    <label htmlFor="location" className="text-sm font-semibold text-[color:var(--foreground)]">
                      {r?.locationLabel ?? "Location"}
                    </label>
                    <div className="relative">
                      <MapPin size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                      <input
                        id="location"
                        type="text"
                        autoComplete="address-level2"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={r?.locationPlaceholder ?? "e.g. Mirpur, Dhaka"}
                        className={`${inputCls} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-2xl border border-[color:var(--danger)]/25 bg-[color:var(--danger)]/8 px-4 py-3 text-sm font-semibold text-[color:var(--danger)]">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[color:var(--primary)] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-900/10 transition-all duration-200 hover:bg-[color:var(--primary-strong)] hover:-translate-y-px hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {r?.creatingAccount ?? "Creating account…"}
                    </>
                  ) : (
                    r?.createButton ?? "Create account"
                  )}
                </button>
              </form>

              {/* Sign in link */}
              <p className="mt-5 text-center text-sm text-[color:var(--muted)]">
                {r?.haveAccount ?? "Already have an account?"}{" "}
                <a
                  href="/login"
                  className="font-bold text-[color:var(--primary)] transition-colors hover:text-[color:var(--primary-strong)]"
                >
                  {a.loginButton}
                </a>
              </p>

              {/* Trust note */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[color:var(--muted)]">
                <Lock size={12} strokeWidth={2.5} />
                <span>{a.trustNote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
