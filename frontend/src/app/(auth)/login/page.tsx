"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Salad, MapPin, Lock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { useAuth } from "@/providers/AuthProvider";

const featureIcons = [Salad, ShieldCheck, MapPin];

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const t = useTranslation();
  const a = t.auth;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, router, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t.auth.emailLabel + " is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await login({ email: email.trim(), password });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <LandingNavbar />

      <div className="flex min-h-screen flex-col gap-6 px-6 pb-8 pt-24 lg:flex-row lg:gap-0 lg:px-0 lg:pb-0">
        {/* Left decorative panel */}
        <div className="relative order-2 flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[image:var(--login-panel-bg)] p-6 sm:p-8 lg:order-1 lg:min-h-auto lg:w-[46%] lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:p-10 xl:w-[42%]">
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[image:var(--login-panel-grid)] bg-[size:40px_40px] opacity-45 [mask-image:linear-gradient(to_bottom_right,black_24%,transparent_82%)]" />
          {/* Crisp accent layers */}
          <div className="absolute -right-28 top-20 h-72 w-72 rounded-full border border-[color:var(--login-panel-icon-border)] bg-[color:var(--login-panel-orb-primary)] shadow-[0_0_70px_rgb(217_129_38/0.18)]" />
          <div className="absolute bottom-16 left-10 h-44 w-44 rounded-full border border-[color:var(--login-panel-icon-border)] bg-[color:var(--login-panel-orb-secondary)] shadow-[0_0_50px_rgb(8_127_91/0.14)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[image:var(--login-panel-bottom)]" />

        {/* Hero copy */}
        <div className="relative z-10">
          <h1 className="text-3xl font-black leading-tight text-[color:var(--foreground)] sm:text-4xl xl:text-5xl">
            {a.heroHeadline}
          </h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-[color:var(--muted)]">
            {a.heroSubtext}
          </p>

          <ul className="mt-8 grid gap-4">
            {a.heroPoints.map((point, i) => {
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

      {/* Right form panel */}
      <div className="order-1 flex flex-1 lg:order-2">
        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center py-4 sm:py-8 lg:px-10">
          <div className="w-full max-w-md rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)]/72 p-6 shadow-[var(--shadow)] sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-[color:var(--foreground)]">
                {a.loginTitle}
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {a.loginSubtitle}
              </p>
            </div>

            {/* Google button */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition-all duration-200 hover:bg-[color:var(--surface-soft)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
            >
              {/* Google SVG */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              {a.continueWithGoogle}
            </button>

            {/* Divider */}
            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t border-[color:var(--border)]" />
              <span className="mx-4 shrink-0 text-xs font-medium text-[color:var(--muted)]">
                {a.orContinueWith}
              </span>
              <div className="flex-1 border-t border-[color:var(--border)]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="grid gap-5">
              {/* Email */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-[color:var(--foreground)]"
                >
                  {a.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={a.emailPlaceholder}
                  className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--foreground)] placeholder-[color:var(--muted)] outline-none ring-0 transition-all duration-200 hover:border-[color:var(--primary)]/60 focus:border-[color:var(--primary)] focus:ring-3 focus:ring-[color:var(--primary)]/15"
                />
              </div>

              {/* Password */}
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-[color:var(--foreground)]"
                  >
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
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={a.passwordPlaceholder}
                    className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 pr-12 text-sm text-[color:var(--foreground)] placeholder-[color:var(--muted)] outline-none transition-all duration-200 hover:border-[color:var(--primary)]/60 focus:border-[color:var(--primary)] focus:ring-3 focus:ring-[color:var(--primary)]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={16} strokeWidth={2} />
                    ) : (
                      <Eye size={16} strokeWidth={2} />
                    )}
                  </button>
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
                    {a.loggingIn}
                  </>
                ) : (
                  a.loginButton
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
              {a.noAccount}{" "}
              <a
                href="/register"
                className="font-bold text-[color:var(--primary)] transition-colors hover:text-[color:var(--primary-strong)]"
              >
                {a.signUp}
              </a>
            </p>

            {/* Trust note */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[color:var(--muted)]">
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
