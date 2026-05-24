import {
  Activity,
  Bot,
  BrainCircuit,
  Database,
  HeartPulse,
  MapPinned,
  Network,
  Rocket,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

export type DocumentationPage = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  icon: typeof HeartPulse;
  highlights: string[];
  sections: Array<{
    title: string;
    body: string;
    items?: string[];
  }>;
};

export const documentationPages: DocumentationPage[] = [
  {
    slug: "how-to-use",
    title: "How To Use",
    eyebrow: "User Journey",
    summary:
      "A practical walkthrough from account creation to health input, budget planning, AI explanations, and care navigation.",
    icon: Activity,
    highlights: [
      "Create an account and keep your profile updated.",
      "Save health vitals and symptoms before generating plans.",
      "Review AI output as decision support, not medical diagnosis.",
    ],
    sections: [
      {
        title: "Start With Your Profile",
        body:
          "Register, sign in, and add core profile details such as full name, phone, blood group, and location. The dashboard uses this context to personalize the experience.",
        items: [
          "Use a real email for account recovery readiness.",
          "Set location so nearby-care results can be filtered.",
          "Keep family and profile details current before generating reports.",
        ],
      },
      {
        title: "Enter Health And Budget Data",
        body:
          "The app becomes useful after you enter health profile, vital signs, monthly budget, family size, meals per day, preferred foods, and foods to avoid.",
        items: [
          "Health input supports blood pressure, temperature, blood sugar, BMI, symptoms, and conditions.",
          "Budget input helps shape Bangladeshi meal plans around real affordability.",
          "Saved data is reused by diet, risk, reports, and exercise workflows.",
        ],
      },
      {
        title: "Use The AI Outputs Carefully",
        body:
          "Diet plans, risk explanations, exercise plans, and report text are designed as guidance. Emergency or high-risk situations should be handled by qualified medical care.",
        items: [
          "Read the reasons behind each recommendation.",
          "Use doctor summaries when visiting a clinician.",
          "Do not treat AI responses as prescriptions.",
        ],
      },
    ],
  },
  {
    slug: "architecture",
    title: "Architecture",
    eyebrow: "System Design",
    summary:
      "NutriShastho AI uses a Next.js frontend, FastAPI backend, Neon/Postgres database, and an MCP server for AI tool orchestration.",
    icon: Network,
    highlights: [
      "Next.js owns user experience, sessions, and AI-facing API routes.",
      "FastAPI owns authentication, data validation, and database writes.",
      "FastMCP exposes health, nutrition, and exercise tools over Streamable HTTP.",
    ],
    sections: [
      {
        title: "Request Flow",
        body:
          "The browser talks to Next.js pages and API routes. Authenticated Next.js API routes forward bearer-token requests to the FastAPI backend. AI routes may also call the MCP server for tool-based intelligence.",
        items: [
          "Browser -> Next.js App Router pages.",
          "Next.js API routes -> FastAPI backend.",
          "Next.js AI routes -> MCP server -> backend and AI providers.",
          "FastAPI -> Neon/Postgres through SQLAlchemy.",
        ],
      },
      {
        title: "Service Boundaries",
        body:
          "The frontend avoids direct database access. The backend is the trusted persistence layer. The MCP server handles AI tools and remote health-intelligence workflows.",
        items: [
          "Frontend: UI, session cookie, dashboard pages, public documentation.",
          "Backend: auth, users, health profiles, budgets, exercise plans, food, clinics.",
          "MCP: tool calls for food search, clinic search, health guidance, and exercise generation.",
        ],
      },
      {
        title: "Deployment Shape",
        body:
          "A free-first deployment can run the frontend on Vercel, backend on Render or Railway, MCP on Hugging Face Spaces or Render, and database on Neon.",
      },
    ],
  },
  {
    slug: "ai-features",
    title: "AI Features",
    eyebrow: "Responsible Intelligence",
    summary:
      "The project combines deterministic safety rules, provider-backed generation, and MCP tools so AI output stays explainable and resilient.",
    icon: BrainCircuit,
    highlights: [
      "Rule-based fallback protects the product when AI providers fail.",
      "Groq and Gemini can generate richer explanations when keys are configured.",
      "MCP tools expose reusable health, nutrition, food, clinic, and exercise workflows.",
    ],
    sections: [
      {
        title: "Risk Analysis",
        body:
          "Risk scoring checks health profile and vital signals such as blood pressure, fever, blood sugar, BMI, symptoms, and existing conditions.",
        items: [
          "Returns low, medium, or high risk levels.",
          "Shows reasons instead of opaque scores.",
          "Escalates dangerous symptoms toward medical care.",
        ],
      },
      {
        title: "Diet And Exercise Planning",
        body:
          "The app builds budget-aware Bangladeshi diet plans and weekly exercise plans. It can fall back to local rules if provider output is unavailable or invalid.",
        items: [
          "Diet planning uses budget, preferred foods, avoided foods, and health profile.",
          "Exercise planning considers risk level and safety warnings.",
          "Responses are shape-validated before being shown to users.",
        ],
      },
      {
        title: "MCP Tooling",
        body:
          "The MCP server gives the AI structured tools such as food nutrition search, nearby hospital search, BMI calculation, calorie estimation, and medical-report assistance.",
      },
    ],
  },
  {
    slug: "core-features",
    title: "Core Features",
    eyebrow: "Product Surface",
    summary:
      "The dashboard brings together health tracking, nutrition planning, nearby care, reports, family context, and AI assistance.",
    icon: HeartPulse,
    highlights: [
      "Health profile and vital history for repeated monitoring.",
      "Budget-aware meal planning for Bangladeshi households.",
      "Nearby clinic and hospital discovery from seeded Bangladesh data.",
    ],
    sections: [
      {
        title: "Health And Risk",
        body:
          "Users can save health profiles, monitor vitals, review risk analysis, and generate doctor-facing summaries.",
        items: [
          "Health input captures symptoms, conditions, blood pressure, temperature, blood sugar, height, and weight.",
          "Risk analysis explains why the user should watch, rest, retest, or seek care.",
          "Reports combine profile context with AI reasoning.",
        ],
      },
      {
        title: "Nutrition And Budget",
        body:
          "Budget planning connects family size and monthly budget to local foods, category spending, weekly spend, and meal ideas.",
        items: [
          "Food database stores Bangladeshi foods and nutrition values.",
          "Diet planning uses affordability as a first-class constraint.",
          "Price sync can refresh food item prices when external search is available.",
        ],
      },
      {
        title: "Care Navigation",
        body:
          "Nearby care lists hospitals, clinics, diagnostics, and pharmacies with city, area, distance, and map-oriented data.",
      },
    ],
  },
  {
    slug: "data-and-safety",
    title: "Data And Safety",
    eyebrow: "Trust Model",
    summary:
      "The project uses Postgres for core records, explicit retention cleanup for generated history, and safety-first wording for medical output.",
    icon: ShieldCheck,
    highlights: [
      "Core records live in Neon/Postgres.",
      "Generated/history rows can be cleaned automatically by scheduled jobs.",
      "AI guidance is framed as support, not diagnosis.",
    ],
    sections: [
      {
        title: "Stored Data",
        body:
          "The backend stores users, health profiles, budget plans, exercise plans, food items, and clinic records in Postgres.",
        items: [
          "User auth uses backend-issued access and refresh tokens.",
          "Frontend sessions are stored in HTTP-only cookies.",
          "Clinic seed data is now database-backed with CSV fallback.",
        ],
      },
      {
        title: "Retention",
        body:
          "A cleanup script can remove old generated/history rows after configured retention windows while keeping each user's latest record by default.",
        items: [
          "Exercise plans default to 30 days.",
          "Budget plans default to 180 days.",
          "Health profiles default to 365 days.",
        ],
      },
      {
        title: "Medical Safety",
        body:
          "The product is decision support. It should guide users toward qualified care for emergencies or concerning patterns and avoid diagnosis or medication claims.",
      },
    ],
  },
  {
    slug: "deployment",
    title: "Deployment",
    eyebrow: "Free-First Operations",
    summary:
      "The project is prepared for Vercel, Render, Railway, Hugging Face Spaces, Docker Compose, and GitHub Actions.",
    icon: Rocket,
    highlights: [
      "Vercel is recommended for the Next.js frontend.",
      "Render or Railway can run backend and MCP Docker services.",
      "Hugging Face Spaces is a good free Docker option for the MCP server.",
    ],
    sections: [
      {
        title: "Services",
        body:
          "Deploy three services: frontend, backend, and MCP. Point every service to the same Neon database-backed backend URL where needed.",
        items: [
          "Frontend needs BACKEND_URL, NEXT_PUBLIC_BACKEND_URL, MCP_SERVER_URL, AUTH_COOKIE_SECRET, and AI keys.",
          "Backend needs DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS, TYPE=remote, and ENV=production.",
          "MCP needs BACKEND_URL, FRONTEND_URL, and PORT.",
        ],
      },
      {
        title: "CI/CD",
        body:
          "GitHub Actions compile Python services, build the frontend, optionally publish Docker images to GHCR, deploy the MCP server to Hugging Face, trigger platform deploy hooks, and run scheduled retention cleanup.",
      },
      {
        title: "Docker",
        body:
          "For local production-style testing, create .env.docker from .env.docker.example and run docker compose with docker-compose.prod.yml.",
      },
    ],
  },
];

export const documentationOverview = [
  {
    title: "Bangladesh Health Context",
    body:
      "The product is tuned around Bangladeshi food, household budgets, family health decisions, and nearby care guidance.",
    icon: MapPinned,
  },
  {
    title: "Budget-Aware Nutrition",
    body:
      "Diet plans consider monthly budget, family size, local food items, market area, and health constraints.",
    icon: WalletCards,
  },
  {
    title: "AI With Fallbacks",
    body:
      "Provider-backed generation is optional. Local rules keep important workflows usable when AI calls fail.",
    icon: Bot,
  },
  {
    title: "Database-Backed Product",
    body:
      "Neon/Postgres stores core data, while scheduled cleanup keeps generated history from growing forever.",
    icon: Database,
  },
];

export function getDocumentationPage(slug: string) {
  return documentationPages.find((page) => page.slug === slug);
}
