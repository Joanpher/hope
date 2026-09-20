import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HopeRise Foundation — Rising Hope, Changing Lives",
    template: "%s | HopeRise Foundation",
  },
  description:
    "HopeRise Foundation: Apoyamos a familias en situación de vulnerabilidad a través de programas de alimentación, salud, educación, vivienda y más. Rising Hope, Changing Lives.",
  keywords: ["hoperise foundation", "fundación", "ayuda social", "donaciones", "beneficiarios", "esperanza"],
  openGraph: {
    title: "HopeRise Foundation",
    description: "Rising Hope, Changing Lives",
    type: "website",
    locale: "es_ES",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
