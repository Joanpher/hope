"use client";
import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";
import { PanelMobileNav } from "@/components/layout/panel-mobile-nav";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { UserRole } from "@/types/database";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/solicitudes", label: "Mis Solicitudes", icon: FileText },
  { href: "/solicitudes/nueva", label: "Nueva Solicitud", icon: PlusCircle },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/perfil", label: "Mi Perfil", icon: User },
];

interface DashboardSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role?: UserRole;
  };
  unreadCount?: number;
}

function isItemActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

/**
 * Enlaces de navegación. Se comparten entre la barra fija de escritorio y el
 * menú desplegable de móvil; `collapsed` solo lo usa la primera.
 */
function NavLinks({
  pathname,
  unreadCount,
  collapsed = false,
}: {
  pathname: string;
  unreadCount: number;
  collapsed?: boolean;
}) {
  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200",
              // En móvil las filas son más altas: se pulsan con el dedo.
              collapsed ? "justify-center px-2 py-2.5" : "py-3 md:py-2.5",
              isActive
                ? "bg-leaf text-white shadow-md shadow-leaf/20"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="flex-shrink-0" style={{ width: "18px", height: "18px" }} />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {item.href === "/notificaciones" && unreadCount > 0 && (
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                  collapsed ? "absolute -right-1 -top-1" : "ml-auto",
                  isActive ? "bg-white text-leaf-dark" : "bg-red-500 text-white"
                )}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

export function DashboardSidebar({
  user,
  unreadCount = 0,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const adminLink = user.role === "ADMIN" && (
    <Link
      href="/admin"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-medium text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? "Panel administrativo" : undefined}
    >
      <Shield className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="truncate">Panel administrativo</span>}
    </Link>
  );

  const signOutButton = (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? "Cerrar sesión" : undefined}
    >
      <LogOut className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span>Cerrar sesión</span>}
    </button>
  );

  const userCard = (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-leaf">
        <span className="text-xs font-bold text-white">
          {getInitials(user.firstName, user.lastName)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {user.firstName} {user.lastName}
        </p>
        <p className="truncate text-xs text-white/50">{user.email}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Móvil ─── */}
      <PanelMobileNav
        label="Menú del panel"
        trailing={
          <Link
            href="/notificaciones"
            className="relative flex h-12 w-12 items-center justify-center rounded-md text-navy transition-colors hover:bg-mist"
          >
            <Bell className="h-6 w-6" aria-hidden />
            <span className="sr-only">
              Notificaciones{unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}
            </span>
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        }
      >
        <div className="space-y-1">
          <NavLinks pathname={pathname} unreadCount={unreadCount} />
        </div>
        <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
          {userCard}
          {adminLink}
          {signOutButton}
        </div>
      </PanelMobileNav>

      {/* ─── Escritorio ─── */}
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-screen flex-col border-r border-navy-deep bg-navy transition-all duration-300 md:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 border-b border-white/10 p-5",
            collapsed && "justify-center p-3"
          )}
        >
          {collapsed ? (
            <BrandLogo variant="mark" tone="white" className="h-9" />
          ) : (
            <BrandLogo tone="white" className="h-10" />
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <NavLinks pathname={pathname} unreadCount={unreadCount} collapsed={collapsed} />
        </nav>

        {adminLink && <div className="px-3 pb-3">{adminLink}</div>}

        <div className="space-y-1 border-t border-white/10 p-3">
          {!collapsed && userCard}
          {signOutButton}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-white/40 transition-colors hover:bg-white/10 hover:text-white/70",
              collapsed && "justify-center"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Colapsar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
