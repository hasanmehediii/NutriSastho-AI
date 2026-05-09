import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";

export const metadata: Metadata = {
  title: "NutriShastho AI",
  icons: {
    icon: "icon.png",
  },
  description:
    "A Bangladesh-focused AI health and nutrition companion for budget-aware care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {/* Blocking script: runs BEFORE any Next.js code or hydration.
            Reads the stored theme from localStorage and applies it to
            the <html> element immediately, preventing any light-mode flash. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("sb-theme");if(!t)t=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";if(t==="dark")document.documentElement.classList.add("dark");document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
