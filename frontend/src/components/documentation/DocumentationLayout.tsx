import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import type { DocumentationPage } from "@/lib/documentation";
import { documentationPages } from "@/lib/documentation";

type DocumentationLayoutProps = {
  currentSlug?: string;
  title: string;
  eyebrow: string;
  summary: string;
  children: React.ReactNode;
};

export function DocumentationLayout({
  currentSlug,
  title,
  eyebrow,
  summary,
  children,
}: DocumentationLayoutProps) {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <LandingNavbar />
      <main>
        <section className="border-b border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-soft)_96%,transparent),var(--background))] px-6 pb-12 pt-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex max-w-4xl items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-[color:var(--primary)]">
              <BookOpen size={18} strokeWidth={2.2} />
              {eyebrow}
            </div>
            <h1 className="mt-5 max-w-5xl text-4xl font-black leading-tight text-[color:var(--foreground)] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
              {summary}
            </p>
          </div>
        </section>

        <section className="px-6 py-10 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <nav
                aria-label="Documentation sections"
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 shadow-sm"
              >
                <Link
                  href="/documentation"
                  className={[
                    "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                    !currentSlug
                      ? "bg-[color:var(--primary)] text-white"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]",
                  ].join(" ")}
                >
                  Overview
                  {!currentSlug && <CheckCircle2 size={16} strokeWidth={2.2} />}
                </Link>
                {documentationPages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/documentation/${page.slug}`}
                    className={[
                      "mt-1 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                      currentSlug === page.slug
                        ? "bg-[color:var(--primary)] text-white"
                        : "text-[color:var(--muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--foreground)]",
                    ].join(" ")}
                  >
                    {page.title}
                    {currentSlug === page.slug ? (
                      <CheckCircle2 size={16} strokeWidth={2.2} />
                    ) : (
                      <ArrowRight size={15} strokeWidth={2.2} />
                    )}
                  </Link>
                ))}
              </nav>
            </aside>

            <div>{children}</div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

export function DocumentationPageCard({ page }: { page: DocumentationPage }) {
  const Icon = page.icon;

  return (
    <Link
      href={`/documentation/${page.slug}`}
      className="group block rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--primary)]/50 hover:shadow-md"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--surface-soft)] text-[color:var(--primary)] transition-colors group-hover:bg-[color:var(--primary)] group-hover:text-white">
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {page.eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-black text-[color:var(--foreground)]">
        {page.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
        {page.summary}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[color:var(--primary)]">
        Read section
        <ArrowRight size={16} strokeWidth={2.2} />
      </span>
    </Link>
  );
}
