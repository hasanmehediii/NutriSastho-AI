import type { Metadata } from "next";

import {
  DocumentationLayout,
  DocumentationPageCard,
} from "@/components/documentation/DocumentationLayout";
import { documentationOverview, documentationPages } from "@/lib/documentation";

export const metadata: Metadata = {
  title: "Documentation | NutriShastho AI",
  description:
    "Public project documentation for NutriShastho AI, including features, architecture, AI workflows, safety, and deployment.",
};

export default function DocumentationHome() {
  return (
    <DocumentationLayout
      eyebrow="Project Documentation"
      title="Understand NutriShastho AI from product idea to deployment."
      summary="This public documentation explains what the project does, how users interact with it, how the services are connected, which AI features are used, and how the system can be deployed."
    >
      <div className="space-y-10">
        <div className="rounded-2xl border-2 border-yellow-500/50 bg-yellow-500/10 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-yellow-500/20 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-black text-[color:var(--foreground)] uppercase tracking-wide">
                Judge / Reviewer Notice: Free Tier Deployment
              </h3>
              <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                The backend and MCP server are deployed on Render's free tier. 
                They spin down after 15 minutes of inactivity. <strong>When you first open the app, it may take up to 60 seconds for the servers to wake up.</strong> Please be patient on the first request!
              </p>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {documentationOverview.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--surface-soft)] text-[color:var(--primary)]">
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <h2 className="mt-5 text-lg font-black text-[color:var(--foreground)]">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                  {item.body}
                </p>
              </article>
            );
          })}
        </section>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--primary)]">
                Browse The Details
              </p>
              <h2 className="mt-2 text-2xl font-black text-[color:var(--foreground)]">
                Documentation Sections
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[color:var(--muted)]">
              Each page is written for outsiders, judges, collaborators, and early
              users who need to understand the project without signing in.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {documentationPages.map((page) => (
              <DocumentationPageCard key={page.slug} page={page} />
            ))}
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
