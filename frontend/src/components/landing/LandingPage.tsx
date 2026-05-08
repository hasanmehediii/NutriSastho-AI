"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LandingLanguage,
  LandingNavbar,
  LandingTheme,
} from "./LandingNavbar";
import { LandingFooter } from "./LandingFooter";

const landingCopy = {
  en: {
    eyebrow: "Accessible AI health support for Bangladesh",
    title: "Budget-aware nutrition and early health guidance in one assistant.",
    subtitle:
      "NutriSastho AI connects monthly food budget, Bangladeshi diet planning, health monitoring, symptom risk checks, and nearby care suggestions with explainable AI.",
    primaryCta: "Explore demo",
    secondaryCta: "View safety model",
    trust: ["Bangladeshi food context", "Explainable recommendations", "Doctor-first safety"],
    heroCardTitle: "Today’s care snapshot",
    heroCardStatus: "Medium attention",
    heroCardItems: [
      ["Budget", "6,000 BDT/month"],
      ["Blood pressure", "150/96 mmHg"],
      ["Diet focus", "Low salt, high fiber"],
      ["Next step", "Consult GP within 48h"],
    ],
    featuresTitle: "Built beyond a health chatbot",
    featuresSubtitle:
      "The product combines affordability, prevention, and care navigation so users can act on health advice in real life.",
    features: [
      {
        title: "Budget-smart diet plans",
        body: "Creates weekly meal ideas using local foods like rice, dal, egg, fish, vegetables, and seasonal fruit.",
      },
      {
        title: "Vital and symptom risk engine",
        body: "Checks temperature, blood pressure, BMI, symptoms, and condition history with transparent risk levels.",
      },
      {
        title: "Nearby care guidance",
        body: "Suggests doctor category, useful tests, and nearby clinic or hospital options when risk is detected.",
      },
      {
        title: "Doctor visit summary",
        body: "Turns logs, vitals, symptoms, and AI reasoning into a concise report the user can take to a clinician.",
      },
    ],
    workflowTitle: "From budget to care decision",
    workflow: [
      "User enters family budget, food preference, location, and health profile.",
      "The app generates a localized diet plan and budget split.",
      "Health logs are scored by a safety-first risk engine.",
      "AI explains the result and recommends the next best action.",
    ],
    safetyTitle: "Responsible AI by design",
    safetyBody:
      "Medical warnings are triggered by deterministic safety rules first. AI explains the result, but it does not claim diagnosis or prescribe medicine.",
    safetyPoints: [
      "Emergency symptoms are escalated clearly.",
      "Every recommendation includes the reason behind it.",
      "Users are guided toward qualified medical care.",
    ],
    demoTitle: "Hackathon demo scenario",
    demoBody:
      "A user from Mirpur enters a 6,000 BDT monthly food budget, high blood pressure, and fever. NutriSastho AI creates a low-salt Bangladeshi meal plan, flags the risk, explains why, suggests tests, and shows nearby clinics.",
    stats: [
      ["25%", "Impact through affordable health decisions"],
      ["20%", "Responsible AI and data use"],
      ["15%", "Differentiated Bangladesh focus"],
    ],
  },
  bn: {
    eyebrow: "বাংলাদেশের জন্য সহজলভ্য AI স্বাস্থ্য সহায়তা",
    title: "বাজেট অনুযায়ী পুষ্টি ও প্রাথমিক স্বাস্থ্য নির্দেশনা এক সহায়কে।",
    subtitle:
      "NutriSastho AI মাসিক খাবারের বাজেট, বাংলাদেশি ডায়েট প্ল্যান, স্বাস্থ্য মনিটরিং, উপসর্গভিত্তিক রিস্ক চেক এবং কাছের চিকিৎসা সেবাকে ব্যাখ্যাযোগ্য AI দিয়ে একসাথে আনে।",
    primaryCta: "ডেমো দেখুন",
    secondaryCta: "সেফটি মডেল",
    trust: ["বাংলাদেশি খাবারের প্রেক্ষাপট", "ব্যাখ্যাযোগ্য সুপারিশ", "ডাক্তার-প্রথম নিরাপত্তা"],
    heroCardTitle: "আজকের কেয়ার স্ন্যাপশট",
    heroCardStatus: "মাঝারি সতর্কতা",
    heroCardItems: [
      ["বাজেট", "৬,০০০ টাকা/মাস"],
      ["রক্তচাপ", "১৫০/৯৬ mmHg"],
      ["ডায়েট ফোকাস", "কম লবণ, বেশি ফাইবার"],
      ["পরবর্তী ধাপ", "৪৮ ঘন্টার মধ্যে GP দেখান"],
    ],
    featuresTitle: "সাধারণ হেলথ চ্যাটবটের চেয়ে বেশি",
    featuresSubtitle:
      "প্রোডাক্টটি বাজেট, প্রতিরোধমূলক যত্ন ও চিকিৎসা সেবার পথনির্দেশ এক করে, যাতে ব্যবহারকারী বাস্তবে সিদ্ধান্ত নিতে পারে।",
    features: [
      {
        title: "বাজেট-স্মার্ট ডায়েট প্ল্যান",
        body: "ভাত, ডাল, ডিম, মাছ, সবজি ও মৌসুমি ফল দিয়ে সাপ্তাহিক খাবারের পরিকল্পনা তৈরি করে।",
      },
      {
        title: "ভাইটাল ও উপসর্গ রিস্ক ইঞ্জিন",
        body: "তাপমাত্রা, রক্তচাপ, BMI, উপসর্গ ও পূর্বের রোগের তথ্য দিয়ে স্বচ্ছ রিস্ক লেভেল দেখায়।",
      },
      {
        title: "কাছের চিকিৎসা সহায়তা",
        body: "রিস্ক থাকলে ডাক্তার ক্যাটাগরি, প্রয়োজনীয় টেস্ট ও কাছের ক্লিনিক বা হাসপাতালের পরামর্শ দেয়।",
      },
      {
        title: "ডাক্তার ভিজিট সামারি",
        body: "ভাইটাল, উপসর্গ, লগ ও AI ব্যাখ্যা থেকে সংক্ষিপ্ত রিপোর্ট তৈরি করে যা ডাক্তারের কাছে নেওয়া যায়।",
      },
    ],
    workflowTitle: "বাজেট থেকে কেয়ার সিদ্ধান্ত",
    workflow: [
      "ব্যবহারকারী পরিবার বাজেট, খাবারের পছন্দ, লোকেশন ও স্বাস্থ্য প্রোফাইল দেয়।",
      "অ্যাপ লোকাল ডায়েট প্ল্যান ও বাজেট ভাগ তৈরি করে।",
      "হেলথ লগ সেফটি-ফার্স্ট রিস্ক ইঞ্জিন দিয়ে স্কোর হয়।",
      "AI ফলাফল ব্যাখ্যা করে এবং পরবর্তী সেরা পদক্ষেপ জানায়।",
    ],
    safetyTitle: "দায়িত্বশীল AI ডিজাইন",
    safetyBody:
      "মেডিকেল সতর্কতা আগে নির্দিষ্ট সেফটি রুল দিয়ে ট্রিগার হয়। AI ফলাফল ব্যাখ্যা করে, কিন্তু ডায়াগনোসিস দাবি করে না বা ওষুধ প্রেসক্রাইব করে না।",
    safetyPoints: [
      "জরুরি উপসর্গ পরিষ্কারভাবে এস্কেলেট করা হয়।",
      "প্রতিটি সুপারিশের কারণ দেখানো হয়।",
      "ব্যবহারকারীকে যোগ্য চিকিৎসকের কাছে যেতে বলা হয়।",
    ],
    demoTitle: "হ্যাকাথন ডেমো সিনারিও",
    demoBody:
      "মিরপুরের একজন ব্যবহারকারী ৬,০০০ টাকার মাসিক খাবারের বাজেট, উচ্চ রক্তচাপ ও জ্বর ইনপুট দেয়। NutriSastho AI কম লবণের বাংলাদেশি খাবার প্ল্যান তৈরি করে, রিস্ক দেখায়, কারণ ব্যাখ্যা করে, টেস্ট সাজেস্ট করে এবং কাছের ক্লিনিক দেখায়।",
    stats: [
      ["২৫%", "সাশ্রয়ী স্বাস্থ্য সিদ্ধান্তে ইমপ্যাক্ট"],
      ["২০%", "দায়িত্বশীল AI ও ডেটা ব্যবহার"],
      ["১৫%", "বাংলাদেশ-কেন্দ্রিক ভিন্নতা"],
    ],
  },
};

export function LandingPage() {
  const [language, setLanguage] = useState<LandingLanguage>("en");
  const [theme, setTheme] = useState<LandingTheme>("light");
  const copy = useMemo(() => landingCopy[language], [language]);
  const heroVisual = useMemo(
    () =>
      language === "en"
        ? {
            profile: "Mirpur family profile",
            riskLabel: "AI risk level",
            riskValue: "Watch closely",
            report: "Doctor summary ready",
            planTitle: "Budget meal plan",
            planMeta: "6,000 BDT monthly budget",
            meals: ["Dal + rice", "Egg bhuna", "Leafy veg", "Guava"],
            reasonTitle: "Why this advice?",
            reasons: [
              "BP trend is above normal range",
              "Salt-heavy meals reduced",
              "GP visit suggested within 48h",
            ],
            clinic: "3 nearby clinics found",
          }
        : {
            profile: "মিরপুর ফ্যামিলি প্রোফাইল",
            riskLabel: "AI রিস্ক লেভেল",
            riskValue: "খেয়াল রাখা দরকার",
            report: "ডাক্তার সামারি প্রস্তুত",
            planTitle: "বাজেট মিল প্ল্যান",
            planMeta: "৬,০০০ টাকা মাসিক বাজেট",
            meals: ["ডাল + ভাত", "ডিম ভুনা", "শাকসবজি", "পেয়ারা"],
            reasonTitle: "কেন এই পরামর্শ?",
            reasons: [
              "রক্তচাপ স্বাভাবিকের চেয়ে বেশি",
              "লবণযুক্ত খাবার কমানো হয়েছে",
              "৪৮ ঘন্টার মধ্যে GP দেখানো ভালো",
            ],
            clinic: "কাছাকাছি ৩টি ক্লিনিক পাওয়া গেছে",
          },
    [language],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language === "bn" ? "bn" : "en";
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
  }, [language, theme]);

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <LandingNavbar
        language={language}
        theme={theme}
        onLanguageChange={setLanguage}
        onThemeChange={setTheme}
      />

      <main>
        <section className="relative overflow-hidden px-6 pb-16 pt-32 lg:px-8 lg:pb-24 lg:pt-36">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-soft)_94%,transparent),color-mix(in_srgb,var(--accent-soft)_62%,transparent)_48%,var(--background))]" />
          <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--border)_58%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--border)_58%,transparent)_1px,transparent_1px)] bg-[size:42px_42px] opacity-55 [mask-image:linear-gradient(to_bottom,black,black_62%,transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,color-mix(in_srgb,var(--surface)_80%,transparent),transparent_30%),radial-gradient(circle_at_78%_38%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_34%)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-[color:var(--border)]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--primary)] shadow-sm">
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
                  className="rounded-full bg-[color:var(--primary)] px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[color:var(--primary-strong)]"
                >
                  {copy.primaryCta}
                </a>
                <a
                  href="#safety"
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-3 text-center text-sm font-bold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-soft)]"
                >
                  {copy.secondaryCta}
                </a>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {copy.trust.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/84 px-4 py-3 text-sm font-bold leading-5 text-[color:var(--foreground)] shadow-sm"
                  >
                    <span className="mb-2 block h-1.5 w-8 rounded-full bg-[color:var(--accent)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[34px] border border-[color:var(--border)] bg-[color:var(--surface)] p-3 shadow-[var(--shadow)]">
                <div className="overflow-hidden rounded-[26px] border border-[color:var(--border)] bg-[color:var(--surface-soft)]">
                  <div className="flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        NutriSastho AI
                      </p>
                      <h2 className="mt-1 text-lg font-black text-[color:var(--foreground)]">
                        {copy.heroCardTitle}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-black text-[color:var(--accent)]">
                      {heroVisual.report}
                    </span>
                  </div>

                  <div className="grid gap-4 p-4 md:grid-cols-[1.05fr_0.95fr]">
                    <div className="grid gap-4">
                      <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-[color:var(--muted)]">
                              {heroVisual.profile}
                            </p>
                            <p className="mt-2 text-3xl font-black text-[color:var(--foreground)]">
                              {copy.heroCardStatus}
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
                                className="rounded-full bg-[color:var(--primary)]"
                                style={{ height: `${height}px` }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {copy.heroCardItems.slice(0, 2).map(([label, value]) => (
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

                    <div className="grid gap-4">
                      <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-[color:var(--muted)]">
                              {heroVisual.riskLabel}
                            </p>
                            <p className="mt-1 text-xl font-black text-[color:var(--danger)]">
                              {heroVisual.riskValue}
                            </p>
                          </div>
                          <div className="grid h-12 w-12 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-soft)] text-sm font-black text-[color:var(--danger)]">
                            BP
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                        <p className="text-sm font-bold text-[color:var(--muted)]">
                          {heroVisual.planTitle}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">
                          {heroVisual.planMeta}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {heroVisual.meals.map((meal) => (
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
                          {heroVisual.reasonTitle}
                        </p>
                        <div className="mt-4 grid gap-3">
                          {heroVisual.reasons.map((reason) => (
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
                        {heroVisual.clinic}
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
              {copy.features.map((feature, index) => (
                <article
                  key={feature.title}
                  className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--surface-soft)] text-sm font-black text-[color:var(--primary)]">
                    0{index + 1}
                  </div>
                  <h3 className="mt-5 text-lg font-black text-[color:var(--foreground)]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                    {feature.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-[color:var(--surface-soft)] px-6 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <h2 className="text-3xl font-black text-[color:var(--foreground)] sm:text-4xl">
              {copy.workflowTitle}
            </h2>
            <div className="grid gap-4">
              {copy.workflow.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5"
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
                    className="rounded-2xl bg-[color:var(--surface-soft)] px-5 py-4 text-sm font-semibold leading-6 text-[color:var(--foreground)]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
                  className="rounded-3xl bg-[color:var(--surface-soft)] p-5"
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

      <LandingFooter language={language} />
    </div>
  );
}
