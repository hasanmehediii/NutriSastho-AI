"use client";

import { Shield, MapPin, FileText, Salad } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/providers/LanguageProvider";
import { LandingNavbar } from "./LandingNavbar";
import { LandingFooter } from "./LandingFooter";

const featureIcons = [Salad, Shield, MapPin, FileText];

export function LandingPage() {
  const t = useTranslation();
  const { language } = useLanguage();
  const { nav } = t;
  const { landing: copy } = t;

  return (
    <div
      key={language}
      className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]"
    >
      <LandingNavbar />

      <main>
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 pb-16 pt-32 lg:px-8 lg:pb-24 lg:pt-36">
          {/* Gradient backgrounds */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-soft)_94%,transparent),color-mix(in_srgb,var(--accent-soft)_62%,transparent)_48%,var(--background))]" />
          <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--border)_58%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--border)_58%,transparent)_1px,transparent_1px)] bg-[size:42px_42px] opacity-55 [mask-image:linear-gradient(to_bottom,black,black_62%,transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,color-mix(in_srgb,var(--surface)_80%,transparent),transparent_30%),radial-gradient(circle_at_78%_38%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_34%)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-[color:var(--border)]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            {/* Left column */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--primary)] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[color:var(--primary)] animate-pulse" />
                {copy.eyebrow}
              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.05] text-[color:var(--foreground)] sm:text-5xl lg:text-6xl">
                {copy.title}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
                {copy.subtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#demo"
                  className="rounded-full bg-[color:var(--primary)] px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-all duration-200 hover:bg-[color:var(--primary-strong)] hover:-translate-y-px hover:shadow-xl active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2"
                >
                  {copy.primaryCta}
                </a>
                <a
                  href="#safety"
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-3 text-center text-sm font-bold text-[color:var(--foreground)] transition-all duration-200 hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2"
                >
                  {copy.secondaryCta}
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {copy.trust.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/84 px-4 py-3 text-sm font-bold leading-5 text-[color:var(--foreground)] shadow-sm transition-all duration-200 hover:border-[color:var(--primary)] hover:shadow-md"
                  >
                    <span className="mb-2 block h-1.5 w-8 rounded-full bg-[color:var(--accent)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right column – UI preview card */}
            <div className="relative">
              <div className="rounded-[34px] border border-[color:var(--border)] bg-[color:var(--surface)] p-3 shadow-[var(--shadow)]">
                <div className="overflow-hidden rounded-[26px] border border-[color:var(--border)] bg-[color:var(--surface-soft)]">
                  {/* Card header */}
                  <div className="flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        {nav.product}
                      </p>
                      <h2 className="mt-1 text-lg font-black text-[color:var(--foreground)]">
                        {copy.heroCard.title}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-black text-[color:var(--accent)]">
                      {copy.heroCard.report}
                    </span>
                  </div>

                  <div className="grid gap-4 p-4 md:grid-cols-[1.05fr_0.95fr]">
                    {/* Left cards */}
                    <div className="grid gap-4">
                      <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-[color:var(--muted)]">
                              {copy.heroVisual.profile}
                            </p>
                            <p className="mt-2 text-3xl font-black text-[color:var(--foreground)]">
                              {copy.heroCard.status}
                            </p>
                          </div>
                          <div className="rounded-full bg-[color:var(--surface-soft)] px-3 py-2 text-sm font-black text-[color:var(--primary)]">
                            78/100
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-7 items-end gap-2">
                          {[48, 56, 52, 70, 64, 82, 76].map((height, index) => (
                            <div
                              key={height + index}
                              className="rounded-full bg-[color:var(--surface-soft)] p-1"
                            >
                              <div
                                className="rounded-full bg-[color:var(--primary)] transition-all duration-500"
                                style={{ height: `${height}px` }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {copy.heroCard.items.slice(0, 2).map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
                          >
                            <p className="text-sm font-bold text-[color:var(--muted)]">
                              {label}
                            </p>
                            <p className="mt-2 text-lg font-black text-[color:var(--foreground)]">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right cards */}
                    <div className="grid gap-4">
                      <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-[color:var(--muted)]">
                              {copy.heroVisual.riskLabel}
                            </p>
                            <p className="mt-1 text-xl font-black text-[color:var(--danger)]">
                              {copy.heroVisual.riskValue}
                            </p>
                          </div>
                          <div className="grid h-12 w-12 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-soft)] text-sm font-black text-[color:var(--danger)]">
                            BP
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                        <p className="text-sm font-bold text-[color:var(--muted)]">
                          {copy.heroVisual.planTitle}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">
                          {copy.heroVisual.planMeta}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {copy.heroVisual.meals.map((meal) => (
                            <span
                              key={meal}
                              className="rounded-full bg-[color:var(--surface-soft)] px-3 py-2 text-xs font-bold text-[color:var(--foreground)]"
                            >
                              {meal}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                        <p className="text-sm font-black text-[color:var(--foreground)]">
                          {copy.heroVisual.reasonTitle}
                        </p>
                        <div className="mt-4 grid gap-3">
                          {copy.heroVisual.reasons.map((reason) => (
                            <div key={reason} className="flex gap-3">
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[color:var(--primary)]" />
                              <p className="text-sm leading-6 text-[color:var(--muted)]">
                                {reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-bold text-[color:var(--foreground)]">
                        {copy.heroVisual.clinic}
                      </p>
                      <div className="h-2 rounded-full bg-[color:var(--surface-soft)] sm:w-48">
                        <div className="h-2 w-3/4 rounded-full bg-[color:var(--accent)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────── */}
        <section id="features" className="px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black text-[color:var(--foreground)] sm:text-4xl">
                {copy.featuresTitle}
              </h2>
              <p className="mt-4 text-lg leading-8 text-[color:var(--muted)]">
                {copy.featuresSubtitle}
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {copy.features.map((feature, index) => {
                const Icon = featureIcons[index];
                return (
                  <article
                    key={feature.title}
                    className="group rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm transition-all duration-300 hover:shadow-[0_8px_32px_rgb(0_0_0/0.08)] hover:-translate-y-1 hover:border-[color:var(--primary)]/40"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--surface-soft)] text-[color:var(--primary)] transition-all duration-200 group-hover:bg-[color:var(--primary)] group-hover:text-white">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-[color:var(--foreground)]">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                      {feature.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Workflow ──────────────────────────────────────── */}
        <section
          id="workflow"
          className="bg-[color:var(--surface-soft)] px-6 py-20 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <h2 className="text-3xl font-black text-[color:var(--foreground)] sm:text-4xl">
              {copy.workflowTitle}
            </h2>
            <div className="grid gap-4">
              {copy.workflow.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition-all duration-200 hover:border-[color:var(--primary)]/40 hover:shadow-sm"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--primary)] text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-base leading-7 text-[color:var(--foreground)]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Safety ────────────────────────────────────────── */}
        <section id="safety" className="px-6 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-black text-[color:var(--foreground)] sm:text-4xl">
                {copy.safetyTitle}
              </h2>
              <p className="mt-5 text-lg leading-8 text-[color:var(--muted)]">
                {copy.safetyBody}
              </p>
            </div>
            <div className="rounded-[30px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
              <div className="grid gap-3">
                {copy.safetyPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl bg-[color:var(--surface-soft)] px-5 py-4"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--primary)]" />
                    <p className="text-sm font-semibold leading-6 text-[color:var(--foreground)]">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Demo ──────────────────────────────────────────── */}
        <section id="demo" className="px-6 pb-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[36px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)] lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <h2 className="text-3xl font-black text-[color:var(--foreground)] sm:text-4xl">
                {copy.demoTitle}
              </h2>
              <p className="mt-5 text-lg leading-8 text-[color:var(--muted)]">
                {copy.demoBody}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {copy.stats.map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-3xl bg-[color:var(--surface-soft)] p-5 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="text-3xl font-black text-[color:var(--primary)]">
                    {value}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--muted)]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
