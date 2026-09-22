"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Hace aparecer su contenido cuando entra en pantalla al hacer scroll.
 * La animación en sí vive en globals.css ([data-reveal]); aquí solo se marca
 * el momento. Se dispara una vez: al volver a subir, el contenido no vuelve a
 * esconderse, que resultaría molesto al releer.
 *
 * No envuelvas con esto nada que se vea al cargar la página (el hero): esos
 * elementos tienen su propia entrada con CSS y no deben esperar al JS.
 */
export function Reveal({
  children,
  as: Tag = "div",
  kind = "text",
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  /** "image" destapa la foto de abajo arriba; "text" sube y aparece. */
  kind?: "text" | "image";
  /** Retraso en ms, para escalonar elementos de una misma fila. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      el.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = "true";
          observer.disconnect();
        }
      },
      // Se dispara un poco antes de que el elemento asome del todo, para que
      // en móvil (scroll rápido con el pulgar) no se vea el hueco vacío.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={kind}
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
