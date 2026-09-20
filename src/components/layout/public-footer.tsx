import Link from "next/link";
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="HopeRise Foundation"
                className="h-12 w-auto object-contain bg-white rounded-xl p-1 shadow-md"
              />
              <div>
                <p className="font-extrabold text-white text-lg leading-none">
                  HopeRise
                </p>
                <p className="font-semibold text-xs tracking-wider text-emerald-400 uppercase">
                  Foundation
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Rising Hope, Changing Lives. Transformando vidas a través de programas de ayuda humanitaria transparentes y accesibles.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Navegación rápida
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/#nosotros", label: "Nosotros" },
                { href: "/#programas", label: "Programas" },
                { href: "/#como-funciona", label: "Cómo funciona" },
                { href: "/contacto", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">Mi cuenta</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/login", label: "Iniciar sesión" },
                { href: "/register", label: "Registrarse" },
                { href: "/forgot-password", label: "Recuperar contraseña" },
                { href: "/solicitudes", label: "Mis solicitudes" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">
                  +1 (809) 555-0123
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">
                  info@hoperisefoundation.org
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">
                  Av. Principal 123, Santo Domingo, República Dominicana
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} HopeRise Foundation. Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacidad"
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Política de privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Términos y condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
