import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { ProcessTimeline, type TimelineStep } from "@/components/site/process-timeline";
import { MobileCtaBar } from "@/components/site/mobile-cta-bar";
import { CountriesStrip } from "@/components/site/countries-strip";

// ─── Contenido ────────────────────────────────────────────────────────────────

const programs = [
  {
    title: "Alimentación",
    body: "Canastas básicas para hogares que no están cubriendo sus comidas del mes.",
    image: "/images/foundation/programa-alimentacion.webp",
    alt: "Voluntarios entregan una caja con frutas y verduras a una mujer en la puerta de su casa",
  },
  {
    title: "Salud",
    body: "Medicamentos, consultas y estudios que el seguro no alcanza a cubrir.",
    image: "/images/foundation/programa-salud.webp",
    alt: "Una enfermera toma la presión arterial a un hombre mayor en un consultorio",
  },
  {
    title: "Educación",
    body: "Útiles, uniformes y materiales para que ningún niño empiece el curso sin lo necesario.",
    image: "/images/foundation/programa-educacion.webp",
    alt: "Una voluntaria ayuda a cuatro niños con sus cuadernos en una mesa al aire libre",
  },
  {
    title: "Vivienda",
    body: "Reparaciones urgentes: techos, paredes y daños que dejan las lluvias.",
    image: "/images/foundation/programa-vivienda.webp",
    alt: "Dos hombres reparan la pared de madera de una casa mientras una mujer los ayuda",
  },
  {
    title: "Emergencias",
    body: "Agua, abrigo y artículos básicos cuando un accidente o un desastre cambia todo de un día para otro.",
    image: "/images/foundation/programa-emergencias.webp",
    alt: "Voluntarios preparan cajas con agua, mantas, linternas y artículos de higiene",
  },
];

// Los nombres de estado coinciden con los que el beneficiario verá en su
// panel (STATUS_LABELS en src/lib/constants.ts).
const steps: TimelineStep[] = [
  {
    title: "Crea tu cuenta",
    body: "Con tu número de cédula, un correo y una contraseña. Toma unos cinco minutos.",
  },
  {
    title: "Cuéntanos qué necesitas",
    body: "Eliges el tipo de ayuda y describes tu situación con tus propias palabras. Al enviarla recibes un código para identificar tu solicitud.",
    statuses: ["Solicitud recibida"],
  },
  {
    title: "Revisamos tu caso",
    body: "Una persona del equipo lee tu solicitud. Si hace falta algún documento, te lo pedimos por la misma vía.",
    statuses: ["En revisión", "Documentación pendiente", "En evaluación"],
  },
  {
    title: "Te damos una respuesta",
    body: "Te avisamos por correo y lo ves en tu cuenta, junto con cualquier comentario del equipo.",
    statuses: ["Aprobada"],
  },
  {
    title: "Recibes la ayuda",
    body: "Coordinamos contigo el día y la forma de entrega.",
    statuses: ["Preparando ayuda", "Ayuda entregada"],
  },
];

const commitments = [
  {
    term: "Confidencial",
    detail: "Tu información solo la ve el equipo que evalúa tu solicitud.",
  },
  {
    term: "Siempre sabes en qué va",
    detail: "Cada cambio en tu solicitud queda registrado en tu cuenta, con su fecha, y te llega por correo.",
  },
];

// ─── Página ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────────
          En móvil: foto arriba y texto debajo, sin superponer texto a la foto
          (se lee sin depender de un velo oscuro). En escritorio: dos columnas,
          con la foto sangrando hasta el borde derecho. */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:py-16 xl:py-20">
          {/* La foto es una panorámica 2.67:1. Se muestra en cajas de 2:1 para
              no recortarla en exceso: con cajas más altas, object-cover la
              amplía y se ve borrosa (en la versión anterior se ampliaba ×2). */}
          <div className="hero-media relative aspect-[2/1] w-full lg:order-2 lg:col-span-7 lg:overflow-hidden lg:rounded-lg">
            <Image
              src="/images/foundation/hero-voluntariado-comunitario.webp"
              alt="Voluntarios de HopeRise preparan cajas de alimentos junto a vecinos de la comunidad"
              fill
              priority
              quality={90}
              sizes="(min-width: 1280px) 940px, (min-width: 1024px) 75vw, 134vw"
              className="object-cover object-[70%_center] lg:object-[60%_center]"
            />
          </div>

          <div className="hero-copy px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:order-1 lg:col-span-5 lg:px-0 lg:py-0">
            <h1 className="font-serif text-[34px] font-semibold leading-[1.1] tracking-[-0.015em] text-navy sm:text-5xl lg:text-[50px] xl:text-[56px]">
              Ayuda para tu familia, con una respuesta que puedes seguir.
            </h1>
            <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-ink-muted sm:mt-5 sm:text-lg">
              Alimentación, salud, educación, vivienda y emergencias. Solicitas en
              línea y en tu cuenta ves cada paso que damos con tu caso.
            </p>
            <div id="hero-cta" className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="flex h-14 items-center justify-center rounded-md bg-leaf px-8 text-lg font-bold text-white transition-colors hover:bg-leaf-dark"
              >
                Solicitar ayuda
              </Link>
              <Link
                href="#como-funciona"
                className="flex h-14 items-center justify-center rounded-md border-2 border-navy/20 px-7 text-lg font-bold text-navy transition-colors hover:border-navy/40 hover:bg-mist"
              >
                Ver cómo funciona
              </Link>
            </div>
            <p className="mt-5 text-[15px] text-ink-muted">
              ¿Ya enviaste una solicitud?{" "}
              <Link href="/login" className="font-bold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">
                Entra para ver en qué va
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Programas ────────────────────────────────────────────────────── */}
      <section id="programas" className="scroll-mt-20 border-t border-line bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <h2 className="font-serif text-[32px] font-semibold leading-tight text-navy sm:text-4xl lg:text-[44px]">
              En qué podemos ayudarte
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-muted sm:text-lg">
              Cada solicitud se atiende dentro de uno de estos programas.
            </p>
          </Reveal>

          {/* Móvil: carrusel deslizable con la siguiente tarjeta asomando.
              Tablet y escritorio: cuadrícula de 2 y 3 columnas. Todas las fotos
              van en su proporción natural (3:2) para que no se amplíen. */}
          <ul className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:scroll-px-0 sm:px-0 lg:grid-cols-3">
            {programs.map((p, i) => (
              <li key={p.title} className="w-[82%] shrink-0 snap-start sm:w-auto">
                <Reveal delay={(i % 3) * 90}>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      quality={90}
                      sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 82vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-2xl font-semibold text-navy">{p.title}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-muted">{p.body}</p>
                </Reveal>
              </li>
            ))}
            {/* Ayuda económica y "otro" existen como tipos de ayuda (AID_TYPES)
                pero no tienen foto: se presentan como una tarjeta de texto. */}
            <li className="w-[82%] shrink-0 snap-start sm:w-auto">
              <Reveal delay={180} className="flex h-full flex-col justify-between rounded-lg bg-mist p-6">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-navy">Otras necesidades</h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-muted">
                    Apoyo económico para gastos urgentes, o una situación que no
                    encaja en ningún programa. Cuéntanos tu caso igual.
                  </p>
                </div>
                <Link
                  href="/register"
                  className="mt-6 inline-flex h-12 items-center justify-center self-start rounded-md border-2 border-navy/20 px-5 font-bold text-navy transition-colors hover:border-navy/40 hover:bg-white"
                >
                  Contar mi caso
                </Link>
              </Reveal>
            </li>
          </ul>
        </div>
      </section>

      {/* ─── Cómo funciona ────────────────────────────────────────────────── */}
      <section id="como-funciona" className="scroll-mt-20 bg-mist py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <Reveal className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <h2 className="font-serif text-[32px] font-semibold leading-tight text-navy sm:text-4xl lg:text-[44px]">
                Cómo funciona
              </h2>
              <p className="mt-4 max-w-[44ch] text-[17px] leading-relaxed text-ink-muted sm:text-lg">
                Desde que envías tu solicitud hasta que recibes la ayuda, siempre
                sabrás en qué etapa está. Estos son los mismos estados que verás en
                tu cuenta.
              </p>
              <Link
                href="/register"
                className="mt-8 hidden h-14 items-center justify-center rounded-md bg-navy px-8 text-lg font-bold text-white transition-colors hover:bg-navy-deep lg:inline-flex"
              >
                Crear mi cuenta
              </Link>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <ProcessTimeline steps={steps} />
          </div>
        </div>
      </section>

      {/* ─── Quiénes somos ────────────────────────────────────────────────── */}
      <section id="nosotros" className="scroll-mt-20 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal kind="image" className="relative aspect-[3/2] overflow-hidden rounded-lg lg:order-2">
              <Image
                src="/images/foundation/comunidad-plaza.webp"
                alt="Banderas ondean sobre una plaza llena de gente"
                fill
                quality={90}
                sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </Reveal>

            <Reveal>
              <h2 className="font-serif text-[32px] font-semibold leading-tight text-navy sm:text-4xl lg:text-[44px]">
                Quiénes somos
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-muted sm:text-lg">
                HopeRise Foundation acompaña a familias de América que atraviesan
                una necesidad concreta: un medicamento que no pueden pagar, un
                techo que se dañó con la lluvia, los útiles del inicio de clases.
              </p>

              <dl className="mt-8 divide-y divide-line border-y border-line">
                {commitments.map((c) => (
                  <div key={c.term} className="py-5 sm:grid sm:grid-cols-[13rem_1fr] sm:gap-6">
                    <dt className="font-bold text-navy">{c.term}</dt>
                    <dd className="mt-1 text-base leading-relaxed text-ink-muted sm:mt-0">{c.detail}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <CountriesStrip />
        </div>
      </section>

      {/* ─── Llamado final ────────────────────────────────────────────────── */}
      <section id="cta-final" className="bg-navy py-16 sm:py-20">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:flex lg:items-end lg:justify-between lg:gap-12 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-[32px] font-semibold leading-tight text-white sm:text-4xl">
              Empieza tu solicitud hoy
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-white/80 sm:text-lg">
              Crear la cuenta toma unos minutos. Si tienes dudas antes de empezar,
              escríbenos y te orientamos.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
            <Link
              href="/register"
              className="flex h-14 items-center justify-center rounded-md bg-leaf px-8 text-lg font-bold text-white transition-colors hover:bg-leaf-dark"
            >
              Solicitar ayuda
            </Link>
            <Link
              href="/contacto"
              className="flex h-14 items-center justify-center rounded-md border-2 border-white/40 px-7 text-lg font-bold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Escribirnos
            </Link>
          </div>
        </Reveal>
      </section>

      <MobileCtaBar />
    </>
  );
}
