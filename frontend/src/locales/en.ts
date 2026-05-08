import type { Translations } from "./types";

export const en: Translations = {
  nav: {
    product: "NutriShastho AI",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#workflow" },
      { label: "Safety", href: "#safety" },
      { label: "Demo", href: "#demo" },
    ],
    login: "Sign in",
    cta: "Start demo",
    languageToggle: "বাং",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  landing: {
    eyebrow: "Accessible AI health support for Bangladesh",
    title: "Budget-aware nutrition and early health guidance in one assistant.",
    subtitle:
      "NutriShastho AI connects monthly food budget, Bangladeshi diet planning, health monitoring, symptom risk checks, and nearby care suggestions with explainable AI.",
    primaryCta: "Explore demo",
    secondaryCta: "View safety model",
    trust: [
      "Bangladeshi food context",
      "Explainable recommendations",
      "Doctor-first safety",
    ],
    heroCard: {
      title: "Today's care snapshot",
      status: "Medium attention",
      items: [
        ["Budget", "6,000 BDT/month"],
        ["Blood pressure", "150/96 mmHg"],
        ["Diet focus", "Low salt, high fiber"],
        ["Next step", "Consult GP within 48h"],
      ],
      report: "Doctor summary ready",
    },
    heroVisual: {
      profile: "Mirpur family profile",
      riskLabel: "AI risk level",
      riskValue: "Watch closely",
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
    },
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
      "A user from Mirpur enters a 6,000 BDT monthly food budget, high blood pressure, and fever. NutriShastho AI creates a low-salt Bangladeshi meal plan, flags the risk, explains why, suggests tests, and shows nearby clinics.",
    stats: [
      ["25%", "Impact through affordable health decisions"],
      ["20%", "Responsible AI and data use"],
      ["15%", "Differentiated Bangladesh focus"],
    ],
  },
  footer: {
    description:
      "Budget-aware nutrition, health tracking, and early-care guidance built for Bangladeshi families.",
    columns: [
      {
        title: "Product",
        links: ["Diet planner", "Risk engine", "Clinic finder", "Reports"],
      },
      {
        title: "Health focus",
        links: [
          "Blood pressure",
          "Fever care",
          "Maternal nutrition",
          "Family mode",
        ],
      },
      {
        title: "Trust",
        links: [
          "Explainable AI",
          "Privacy first",
          "Safety rules",
          "No diagnosis claims",
        ],
      },
    ],
    disclaimer:
      "NutriShastho AI provides educational guidance and decision support. It does not replace a qualified doctor or emergency medical care.",
    copyright: "© 2026 NutriShastho AI. Built for accessible, ethical care.",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to your NutriShastho AI account",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    loginButton: "Sign in",
    loggingIn: "Signing in…",
    noAccount: "Don't have an account?",
    signUp: "Sign up free",
    orContinueWith: "Or continue with",
    continueWithGoogle: "Continue with Google",
    trustNote: "Your health data stays private and encrypted.",
    heroHeadline: "Your health, your budget, one assistant.",
    heroSubtext:
      "NutriShastho AI helps Bangladeshi families make affordable health decisions with explainable, responsible AI.",
    heroPoints: [
      "Budget-smart Bangladeshi diet plans",
      "Transparent risk scores with explanations",
      "Nearby clinic & doctor guidance",
    ],
  },
};
