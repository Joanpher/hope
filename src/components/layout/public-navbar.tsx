"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#programas", label: "Programas" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/contacto", label: "Contacto" },
];

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="HopeRise Foundation"
              className="h-10 sm:h-11 w-auto object-contain bg-white rounded-lg p-1 shadow-sm transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <span
                className={cn(
                  "font-extrabold text-base tracking-tight leading-none block",
                  isScrolled ? "text-slate-900" : "text-white"
                )}
              >
                HopeRise
              </span>
              <span className="font-semibold text-xs tracking-wider leading-none text-emerald-500 uppercase">
                Foundation
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isScrolled
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border",
                isScrolled
                  ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                  : "border-white/30 text-white hover:bg-white/10"
              )}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-lg text-sm font-semibold brand-gradient text-white shadow-md hover:opacity-90 transition-opacity"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              isScrolled
                ? "text-slate-700 hover:bg-slate-100"
                : "text-white hover:bg-white/10"
            )}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 shadow-lg animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-center border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-center brand-gradient text-white"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
