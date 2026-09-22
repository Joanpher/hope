import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Source_Serif_4 } from "next/font/google";
import "./globals.css";

/**
 * Texto: Atkinson Hyperlegible, diseñada por el Braille Institute para
 * distinguir letras parecidas (I/l/1, O/0) incluso con poca visión. Buena
 * parte de quien pide ayuda lo hará desde un móvil y puede ser una persona
 * mayor: la legibilidad aquí no es un detalle estético.
 */
const sans = Atkinson_Hyperlegible({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-atkinson",
});

/** Titulares: Source Serif 4, sobria e institucional. */
const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: {
    default: "HopeRise Foundation — Rising Hope, Changing Lives",
    template: "%s | HopeRise Foundation",
  },
  description:
    "HopeRise Foundation apoya a familias en situación de vulnerabilidad con alimentación, salud, educación, vivienda y respuesta a emergencias. Solicita ayuda en línea y sigue tu caso paso a paso.",
  keywords: ["hoperise foundation", "fundación", "ayuda social", "solicitar ayuda", "latinoamérica"],
  openGraph: {
    title: "HopeRise Foundation",
    description: "Solicita ayuda en línea y sigue tu caso paso a paso.",
    type: "website",
    locale: "es_ES",
    images: ["/images/foundation/hero-voluntariado-comunitario.webp"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Marca que hay JavaScript antes del primer pintado, para que las
          animaciones de scroll (globals.css, [data-reveal]) oculten el
          contenido desde el inicio en vez de mostrarlo y esconderlo al hidratar.
        */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
