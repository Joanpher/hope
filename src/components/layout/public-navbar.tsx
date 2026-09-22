"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/site/brand-logo";

const navLinks = [
  { href: "/#programas", label: "Programas" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#nosotros", label: "Quiénes somos" },
  { href: "/contacto", label: "Contacto" },
];

/**
 * Barra superior del sitio público.
 *
 * Es sticky y siempre blanca. Antes era `fixed` y transparente sobre el hero
 * con degradado, lo que tenía dos problemas: tapaba el principio de las
 * páginas sin hero (privacidad, términos) y en ellas dejaba el texto blanco
 * sobre fondo claro, invisible.
 */
export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra el menú al navegar.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Con el menú abierto: sin scroll de fondo y Escape para cerrar.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white transition-shadow duration-300",
        isScrolled || isOpen ? "border-line shadow-[0_1px_12px_rgba(14,47,82,0.08)]" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" aria-label="HopeRise Foundation, inicio" className="-ml-1 rounded-md p-1">
          <BrandLogo priority className="h-11 lg:h-14" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3.5 py-2 text-[15px] text-ink transition-colors hover:bg-mist hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/login"
            className="rounded-md px-4 py-2.5 text-[15px] font-bold text-navy transition-colors hover:bg-mist"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-leaf px-5 py-2.5 text-[15px] font-bold text-white transition-colors hover:bg-leaf-dark"
          >
            Solicitar ayuda
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="menu-movil"
          className="-mr-2 flex h-12 min-w-12 items-center justify-center gap-2 rounded-md px-3 text-navy transition-colors hover:bg-mist lg:hidden"
        >
          <span className="text-[15px] font-bold">{isOpen ? "Cerrar" : "Menú"}</span>
          {isOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
      </div>

      {/* Menú móvil: ocupa el resto de la pantalla, con filas grandes para el pulgar */}
      <div
        id="menu-movil"
        hidden={!isOpen}
        className="fixed inset-x-0 bottom-0 top-[68px] overflow-y-auto bg-white lg:hidden"
      >
        <nav aria-label="Menú móvil" className="flex min-h-full flex-col px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-2 sm:px-6">
          <ul className="divide-y divide-line border-b border-line">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex h-14 items-center font-serif text-xl font-semibold text-navy"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Link
              href="/register"
              className="flex h-14 items-center justify-center rounded-md bg-leaf text-lg font-bold text-white"
            >
              Solicitar ayuda
            </Link>
            <Link
              href="/login"
              className="flex h-14 items-center justify-center rounded-md border-2 border-navy text-lg font-bold text-navy"
            >
              Entrar a mi cuenta
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
