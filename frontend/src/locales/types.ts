export type NavLink = { label: string; href: string };

export type Translations = {
  nav: {
    product: string;
    links: NavLink[];
    login: string;
    cta: string;
    languageToggle: string;
    openMenu: string;
    closeMenu: string;
  };
  landing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    trust: string[];
    heroCard: {
      title: string;
      status: string;
      items: [string, string][];
      report: string;
    };
    heroVisual: {
      profile: string;
      riskLabel: string;
      riskValue: string;
      planTitle: string;
      planMeta: string;
      meals: string[];
      reasonTitle: string;
      reasons: string[];
      clinic: string;
    };
    featuresTitle: string;
    featuresSubtitle: string;
    features: Array<{ title: string; body: string }>;
    workflowTitle: string;
    workflow: string[];
    safetyTitle: string;
    safetyBody: string;
    safetyPoints: string[];
    demoTitle: string;
    demoBody: string;
    stats: [string, string][];
  };
  footer: {
    description: string;
    columns: Array<{ title: string; links: string[] }>;
    disclaimer: string;
    copyright: string;
    privacy: string;
    terms: string;
    contact: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    loginButton: string;
    loggingIn: string;
    noAccount: string;
    signUp: string;
    orContinueWith: string;
    continueWithGoogle: string;
    trustNote: string;
    heroHeadline: string;
    heroSubtext: string;
    heroPoints: string[];
  };
};
