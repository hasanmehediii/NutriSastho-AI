import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriSastho AI",
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
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
