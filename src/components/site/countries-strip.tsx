import Image from "next/image";
import { COUNTRIES } from "@/lib/countries";
import { Reveal } from "@/components/site/reveal";

/**
 * Bloque de presencia para la sección «Quiénes somos»: los países donde la
 * fundación recibe solicitudes, con su bandera.
 *
 * Se alimenta de `COUNTRIES` (src/lib/countries.ts), la misma lista que valida
 * el registro, para que la portada no pueda prometer un país que el formulario
 * rechaza.
 *
 * Las banderas son SVG locales en `public/flags/`. Van con `unoptimized`: son
 * vectores de pocos kB, el optimizador de Next no toca SVG sin
 * `dangerouslyAllowSVG` y no hay nada que recomprimir.
 *
 * Rejilla: 3 columnas en móvil y tablet (3×3 exacto, nunca una fila huérfana
 * con una sola tarjeta) y una sola fila de nueve en escritorio, que se lee como
 * una franja de presencia.
 */
export function CountriesStrip() {
  return (
    // La sección «Quiénes somos» es blanca y las tarjetas también: sobre un
    // panel en `mist` se despegan del fondo sin necesidad de bordes fuertes.
    <div className="mt-14 rounded-xl bg-mist px-5 py-10 sm:mt-20 sm:px-10 sm:py-12 lg:px-12">
      <Reveal className="max-w-2xl">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-leaf">
          Dónde acompañamos
        </p>
        <h3 className="mt-3 font-serif text-[26px] font-semibold leading-tight text-navy sm:text-[32px]">
          Nueve países, una misma puerta de entrada
        </h3>
        <p className="mt-3 text-[17px] leading-relaxed text-ink-muted">
          Vivas en el país que vivas de esta lista, el proceso es el mismo: creas
          tu cuenta, nos cuentas tu caso y sigues cada paso desde tu panel. Todas
          las ayudas se manejan en dólares estadounidenses&nbsp;(USD).
        </p>
      </Reveal>

      {/* En tablet la rejilla se limita en ancho: con 3 columnas a todo lo
          ancho las banderas se agrandan de más y la sección queda enorme. */}
      <ul className="mt-9 grid grid-cols-3 gap-3 sm:mx-auto sm:max-w-xl sm:gap-5 lg:mx-0 lg:max-w-none lg:grid-cols-9 lg:gap-4">
        {COUNTRIES.map((c, i) => (
          <li key={c.code}>
            {/* El retraso se escalona por columna, no por índice: en móvil cada
                fila de tres entra junta en vez de en una cascada larga. */}
            <Reveal
              delay={(i % 3) * 80}
              className="group flex h-full flex-col items-center gap-3 rounded-lg bg-white p-3 text-center shadow-[0_1px_2px_rgba(14,47,82,0.05)] ring-1 ring-line/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(14,47,82,0.22)] hover:ring-leaf/35 sm:gap-4 sm:p-4 lg:gap-3 lg:p-2.5"
            >
              {/* `ring` interior: sin él, las banderas con franjas blancas
                  (Puerto Rico, Honduras) se funden con la tarjeta. */}
              <span className="relative block w-full overflow-hidden rounded-[5px] ring-1 ring-navy/10">
                <Image
                  src={c.flag}
                  alt=""
                  width={640}
                  height={480}
                  unoptimized
                  className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.06]"
                />
              </span>
              <span className="text-[13px] font-bold leading-snug text-navy sm:text-[15px] lg:text-[12.5px]">
                {c.name}
              </span>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
