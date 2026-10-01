"use client";
import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";
import { PanelMobileNav } from "@/components/layout/panel-mobile-nav";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Shield,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: FileText, exact: false },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users, exact: false },
];

/** Enlaces compartidos por la barra fija de escritorio y el menú de móvil. */
function NavLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 md:py-2.5",
              isActive
                ? "bg-leaf text-white shadow-md shadow-leaf/20"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  const footerLinks = (
    <>
      <Link
        href="/dashboard"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
      >
        <LayoutGrid className="h-4 w-4 flex-shrink-0" />
        Ir a mi panel
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        Cerrar sesión
      </button>
    </>
  );

  return (
    <>
      {/* ─── Móvil ─── */}
      <PanelMobileNav
        label="Menú administrativo"
        trailing={
          <span className="flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs font-bold text-navy">
            <Shield className="h-3.5 w-3.5 text-leaf" aria-hidden />
            Admin
          </span>
        }
      >
        <div className="space-y-1">
          <NavLinks pathname={pathname} />
        </div>
        <div className="mt-auto space-y-1 border-t border-white/10 pt-3">{footerLinks}</div>
      </PanelMobileNav>

      {/* ─── Escritorio ─── */}
      <aside className="sticky top-0 z-40 hidden h-screen w-64 flex-col bg-navy-deep md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <div className="min-w-0">
            <BrandLogo tone="white" className="h-10" />
            <div className="mt-2 flex items-center gap-1.5">
              <Shield className="h-3 w-3 flex-shrink-0 text-leaf" />
              <span className="text-xs font-medium text-white/60">
                Panel administrativo
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">{footerLinks}</div>
      </aside>
    </>
  );
}
