import type { LandingLanguage } from "./LandingNavbar";

type LandingFooterProps = {
  language: LandingLanguage;
};

const footerCopy = {
  en: {
    description:
      "Budget-aware nutrition, health tracking, and early-care guidance built for Bangladeshi families.",
    columns: [
      {
        title: "Product",
        links: ["Diet planner", "Risk engine", "Clinic finder", "Reports"],
      },
      {
        title: "Health focus",
        links: ["Blood pressure", "Fever care", "Maternal nutrition", "Family mode"],
      },
      {
        title: "Trust",
        links: ["Explainable AI", "Privacy first", "Safety rules", "No diagnosis claims"],
      },
    ],
    disclaimer:
      "NutriSastho AI provides educational guidance and decision support. It does not replace a qualified doctor or emergency medical care.",
    copyright: "© 2026 NutriSastho AI. Built for accessible, ethical care.",
  },
  bn: {
    description:
      "বাংলাদেশি পরিবারের জন্য বাজেট-ভিত্তিক পুষ্টি, স্বাস্থ্য ট্র্যাকিং ও প্রাথমিক যত্নের সহায়তা।",
    columns: [
      {
        title: "প্রোডাক্ট",
        links: ["ডায়েট প্ল্যানার", "রিস্ক ইঞ্জিন", "ক্লিনিক ফাইন্ডার", "রিপোর্ট"],
      },
      {
        title: "স্বাস্থ্য ফোকাস",
        links: ["রক্তচাপ", "জ্বরের যত্ন", "মাতৃ পুষ্টি", "ফ্যামিলি মোড"],
      },
      {
        title: "বিশ্বাস",
        links: ["ব্যাখ্যাযোগ্য AI", "প্রাইভেসি আগে", "সেফটি রুল", "ডায়াগনোসিস নয়"],
      },
    ],
    disclaimer:
      "NutriSastho AI শিক্ষামূলক নির্দেশনা ও সিদ্ধান্ত সহায়তা দেয়। এটি যোগ্য ডাক্তার বা জরুরি চিকিৎসার বিকল্প নয়।",
    copyright: "© ২০২৬ NutriSastho AI. সহজলভ্য ও নৈতিক যত্নের জন্য তৈরি।",
  },
};

export function LandingFooter({ language }: LandingFooterProps) {
  const copy = footerCopy[language];

  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="NutriSastho AI"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-lg font-bold text-[color:var(--foreground)]">
                NutriSastho AI
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-[color:var(--muted)]">
              {copy.description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {copy.columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold text-[color:var(--foreground)]">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-[color:var(--muted)] transition hover:text-[color:var(--primary)]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] p-5 text-sm leading-6 text-[color:var(--muted)]">
          {copy.disclaimer}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[color:var(--border)] pt-6 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>{copy.copyright}</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-[color:var(--primary)]">
              Privacy
            </a>
            <a href="#" className="transition hover:text-[color:var(--primary)]">
              Terms
            </a>
            <a href="#" className="transition hover:text-[color:var(--primary)]">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
