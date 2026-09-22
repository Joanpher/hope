import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { BrandLogo } from "@/components/site/brand-logo";

/**
 * Marco común de las pantallas de cuenta (registro y entrada).
 *
 * - Escritorio: panel azul a la izquierda con un mensaje y una foto en su
 *   proporción natural (3:2, para que no se amplíe), y el contenido a la derecha.
 * - Móvil: solo el contenido, con el logo arriba. El panel se omite: en una
 *   pantalla pequeña cada centímetro va para lo que la persona vino a hacer.
 */
export function AccountShell({
  asideTitle,
  asideItems,
  numbered = false,
  image,
  switchPrompt,
  switchHref,
  switchLabel,
  children,
}: {
  asideTitle: string;
  asideItems: { title: string; body: string }[];
  /** Si los elementos son una secuencia real, se numeran. */
  numbered?: boolean;
  image: { src: string; alt: string };
  switchPrompt: string;
  switchHref: string;
  switchLabel: string;
  children: ReactNode;
}) {
  // Una secuencia real va en <ol>; una lista de ventajas, en <ul>.
  const List = numbered ? "ol" : "ul";

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-12">
      <aside className="hidden bg-navy text-white lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <Link href="/" aria-label="HopeRise Foundation, inicio" className="self-start rounded-md">
          <BrandLogo tone="white" className="h-12" priority />
        </Link>

        <div className="my-12">
          <h2 className="font-serif text-4xl font-semibold leading-tight">{asideTitle}</h2>
          <List className="mt-8 space-y-6">
            {asideItems.map((item, i) => (
              <li key={item.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/40 text-sm font-bold">
                  {numbered ? i + 1 : <Check className="h-4 w-4" aria-hidden />}
                </span>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="mt-0.5 text-white/75">{item.body}</p>
                </div>
              </li>
            ))}
          </List>
        </div>

        <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            quality={90}
            sizes="(min-width: 1280px) 460px, 36vw"
            className="object-cover"
          />
        </div>
      </aside>

      <main className="flex min-h-svh flex-col lg:col-span-7 lg:min-h-0">
        <header className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-8 lg:px-16 lg:pt-10">
          <Link href="/" aria-label="HopeRise Foundation, inicio" className="rounded-md lg:hidden">
            <BrandLogo className="h-10" />
          </Link>
          <p className="ml-auto text-[15px] text-ink-muted">
            {/* En móvil solo el enlace: la pregunta no cabe junto al logo sin partirse. */}
            <span className="hidden sm:inline">{switchPrompt} </span>
            <Link
              href={switchHref}
              className="font-bold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy"
            >
              {switchLabel}
            </Link>
          </p>
        </header>
        {children}
      </main>
    </div>
  );
}
