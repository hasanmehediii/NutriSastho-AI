import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentationLayout } from "@/components/documentation/DocumentationLayout";
import {
  documentationPages,
  getDocumentationPage,
} from "@/lib/documentation";

type DocumentationDetailProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return documentationPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: DocumentationDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocumentationPage(slug);

  if (!page) {
    return {
      title: "Documentation | NutriShastho AI",
    };
  }

  return {
    title: `${page.title} | NutriShastho AI Documentation`,
    description: page.summary,
  };
}

export default async function DocumentationDetail({
  params,
}: DocumentationDetailProps) {
  const { slug } = await params;
  const page = getDocumentationPage(slug);

  if (!page) notFound();

  const Icon = page.icon;

  return (
    <DocumentationLayout
      currentSlug={page.slug}
      eyebrow={page.eyebrow}
      title={page.title}
      summary={page.summary}
    >
      <div className="space-y-8">
        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[color:var(--surface-soft)] text-[color:var(--primary)]">
              <Icon size={26} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--primary)]">
                Key Points
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {page.highlights.map((highlight) => (
                  <p
                    key={highlight}
                    className="rounded-xl bg-[color:var(--surface-soft)] px-4 py-3 text-sm font-bold leading-6 text-[color:var(--foreground)]"
                  >
                    {highlight}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {page.sections.map((section, index) => (
          <section
            key={section.title}
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--primary)] text-sm font-black text-white">
                {index + 1}
              </span>
              <h2 className="text-xl font-black text-[color:var(--foreground)]">
                {section.title}
              </h2>
            </div>
            <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
              {section.body}
            </p>
            {section.items && (
              <div className="mt-5 grid gap-3">
                {section.items.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-xl bg-[color:var(--surface-soft)] px-4 py-3"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[color:var(--primary)]" />
                    <p className="text-sm font-semibold leading-6 text-[color:var(--foreground)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </DocumentationLayout>
  );
}
