"use client";

import { useEffect, useRef } from "react";

export type TimelineStep = {
  title: string;
  body: string;
  /** Nombres de estado tal como aparecen en el panel del beneficiario. */
  statuses?: string[];
};

/**
 * Línea de proceso que se rellena a medida que se hace scroll.
 *
 * La línea representa el recorrido real de una solicitud, y cada paso se
 * "enciende" cuando el relleno lo alcanza: la animación cuenta lo mismo que el
 * contenido (tu caso avanza por etapas y siempre sabes en cuál está).
 *
 * Es un efecto ligado al scroll, así que lo controla quien lee, no corre solo.
 * Se actualiza manipulando el DOM dentro de requestAnimationFrame, sin estado
 * de React, para no re-renderizar en cada frame de scroll.
 */
export function ProcessTimeline({ steps }: { steps: TimelineStep[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const list = listRef.current;
    const fill = fillRef.current;
    const track = trackRef.current;
    if (!list || !fill || !track) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const markers = markerRefs.current.filter(Boolean) as HTMLSpanElement[];
      if (markers.length === 0) return;

      const listTop = list.getBoundingClientRect().top;
      // Centro de cada marcador, relativo a la lista.
      const centers = markers.map((m) => {
        const r = m.getBoundingClientRect();
        return r.top + r.height / 2 - listTop;
      });
      const start = centers[0];
      const end = centers[centers.length - 1];

      // La pista va del primer al último marcador.
      track.style.top = `${start}px`;
      track.style.height = `${end - start}px`;

      // El "cabezal" es una línea al 60 % de la altura de la pantalla: lo que
      // queda por encima de ella cuenta como recorrido.
      const head = window.innerHeight * 0.6 - listTop;
      const filled = Math.min(Math.max(head - start, 0), end - start);
      fill.style.height = `${filled}px`;

      centers.forEach((c, i) => {
        const item = itemRefs.current[i];
        if (item) item.dataset.reached = String(head >= c);
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ol ref={listRef} className="relative">
      {/* Pista gris y relleno verde, alineados con el centro de los marcadores */}
      <div
        ref={trackRef}
        aria-hidden="true"
        className="absolute left-[19px] w-[2px] bg-line"
      >
        <div ref={fillRef} className="absolute inset-x-0 top-0 bg-leaf" style={{ height: 0 }} />
      </div>

      {steps.map((step, i) => (
        <li
          key={step.title}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          data-reached="false"
          className="group relative flex gap-5 pb-10 last:pb-0"
        >
          <span
            ref={(el) => {
              markerRefs.current[i] = el;
            }}
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-line bg-white font-bold text-ink-muted transition-colors duration-300 motion-reduce:transition-none group-data-[reached=true]:border-leaf group-data-[reached=true]:bg-leaf group-data-[reached=true]:text-white"
          >
            {i + 1}
          </span>
          <div className="pt-1.5">
            <h3 className="font-serif text-xl font-semibold text-navy sm:text-2xl">{step.title}</h3>
            <p className="mt-2 max-w-[46ch] text-base leading-relaxed text-ink-muted sm:text-[17px]">
              {step.body}
            </p>
            {step.statuses && (
              <p className="mt-3 flex flex-wrap gap-2">
                {step.statuses.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-mist px-2.5 py-1 text-sm text-ink transition-colors duration-300 motion-reduce:transition-none group-data-[reached=true]:bg-leaf-soft group-data-[reached=true]:text-leaf-dark"
                  >
                    {s}
                  </span>
                ))}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
