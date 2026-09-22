import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";

// Placeholders heredados de la plantilla original: el teléfono es un 555 y el
// dominio del correo no existe. Sustitúyelos por los datos reales.
const CONTACT = {
  phone: "+1 (809) 555-0123",
  phoneHref: "tel:+18095550123",
  email: "info@hoperisefoundation.org",
  address: "Av. Principal 123, Santo Domingo, República Dominicana",
};

const columns = [
  {
    title: "La fundación",
    links: [
      { href: "/#programas", label: "Programas" },
      { href: "/#como-funciona", label: "Cómo funciona" },
      { href: "/#nosotros", label: "Quiénes somos" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
  {
    title: "Tu cuenta",
    links: [
      { href: "/register", label: "Solicitar ayuda" },
      { href: "/login", label: "Entrar" },
      { href: "/forgot-password", label: "Recuperar contraseña" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="bg-navy-deep text-white/75">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <BrandLogo tone="white" className="h-12 sm:h-14" />
            <p className="mt-5 max-w-[40ch] text-base leading-relaxed">
              Apoyamos a familias en situación de vulnerabilidad con alimentación,
              salud, educación, vivienda y respuesta a emergencias.
            </p>
          </div>

          {/* En móvil, las dos columnas de enlaces van lado a lado para no alargar el pie. */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="font-bold text-white">{col.title}</h2>
                <ul className="mt-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-base transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h2 className="font-bold text-white">Contacto</h2>
            <ul className="mt-3 space-y-1 text-base">
              <li>
                <a href={CONTACT.phoneHref} className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-11 items-center break-all transition-colors hover:text-white">
                  {CONTACT.email}
                </a>
              </li>
              <li className="pt-2 leading-relaxed">{CONTACT.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} HopeRise Foundation</p>
          <div className="flex gap-6">
            <Link href="/privacidad" className="inline-flex min-h-11 items-center transition-colors hover:text-white">
              Privacidad
            </Link>
            <Link href="/terminos" className="inline-flex min-h-11 items-center transition-colors hover:text-white">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
