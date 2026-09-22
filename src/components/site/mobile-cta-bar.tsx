"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Botón "Solicitar ayuda" fijo en la parte inferior, solo en móvil.
 *
 * Pedir ayuda es la razón principal para visitar el sitio, y en un teléfono
 * el botón del hero desaparece tras el primer gesto de scroll. Esta barra lo
 * mantiene a mano del pulgar, pero únicamente mientras no haya otro botón
 * equivalente en pantalla: aparece cuando el del hero (#hero-cta) ya salió
 * por arriba y se retira desde que se llega al llamado final (#cta-final) en adelante.
 */
export function MobileCtaBar() {
  const [heroGone, setHeroGone] = useState(false);
  const [finalReached, setFinalReached] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    const final = document.getElementById("cta-final");
    const observers: IntersectionObserver[] = [];

    if (hero) {
      const o = new IntersectionObserver(([e]) =>
        // Solo cuenta como "ido" si salió por arriba, no si aún no se llegó.
        setHeroGone(!e.isIntersecting && e.boundingClientRect.top < 0)
      );
      o.observe(hero);
      observers.push(o);
    }
    if (final) {
      const o = new IntersectionObserver(([e]) =>
        // Visible o ya superado: en ambos casos sobra la barra (también sobre el footer).
        setFinalReached(e.isIntersecting || e.boundingClientRect.top < 0)
      );
      o.observe(final);
      observers.push(o);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const show = heroGone && !finalReached;

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 motion-reduce:transition-none lg:hidden",
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      )}
    >
      <Link
        href="/register"
        tabIndex={show ? 0 : -1}
        className="flex h-[52px] items-center justify-center rounded-md bg-leaf text-[17px] font-bold text-white"
      >
        Solicitar ayuda
      </Link>
    </div>
  );
}
