"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/site/brand-logo";

/**
 * Cabecera móvil con menú lateral desplegable, compartida por el panel de
 * beneficiario y el administrativo.
 *
 * De `md` en adelante no pinta nada: ahí la navegación la lleva la barra
 * lateral fija. En móvil esa barra está oculta, así que sin esto no había
 * forma de llegar a ninguna sección.
 *
 * El contenido del menú lo pone cada panel (`children`), porque las secciones
 * y el pie difieren; lo compartido es el comportamiento: cerrar al navegar,
 * cerrar con Escape y bloquear el scroll del fondo mientras está abierto.
 */
export function PanelMobileNav({
  label,
  trailing,
  children,
}: {
  /** Nombre accesible del menú, p. ej. "Menú del panel". */
  label: string;
  /** Acciones al extremo derecho de la cabecera (notificaciones, etc.). */
  trailing?: ReactNode;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-line bg-white px-3 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="menu-panel-movil"
          className="flex h-12 w-12 items-center justify-center rounded-md text-navy transition-colors hover:bg-mist"
        >
          <Menu className="h-6 w-6" aria-hidden />
          <span className="sr-only">Abrir menú</span>
        </button>
        <BrandLogo className="h-9" />
        <div className="ml-auto flex items-center gap-1">{trailing}</div>
      </header>

      <div id="menu-panel-movil" hidden={!isOpen} className="fixed inset-0 z-50 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar menú"
          className="absolute inset-0 bg-navy-deep/70"
        />
        <div className="drawer-panel absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col bg-navy">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <BrandLogo tone="white" className="h-9" />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-6 w-6" aria-hidden />
              <span className="sr-only">Cerrar menú</span>
            </button>
          </div>

          <nav
            aria-label={label}
            className="flex flex-1 flex-col overflow-y-auto p-3 pb-[calc(16px+env(safe-area-inset-bottom))]"
            // Un enlace a la ruta actual no cambia `pathname`, así que el
            // efecto de arriba no se dispara: se cierra también aquí.
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setIsOpen(false);
            }}
          >
            {children}
          </nav>
        </div>
      </div>
    </>
  );
}
