"use client";
import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";
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

export function DashboardSidebar({
  user,
  unreadCount = 0,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-navy border-r border-navy-deep transition-all duration-300 sticky top-0 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 p-5 border-b border-white/10",
          collapsed && "justify-center p-3"
        )}
      >
        {collapsed ? (
          <BrandLogo variant="mark" tone="white" className="h-9" />
        ) : (
          <BrandLogo tone="white" className="h-10" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-leaf text-white shadow-md shadow-leaf/20"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className="flex-shrink-0"
                style={{ width: "18px", height: "18px" }}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.href === "/notificaciones" && unreadCount > 0 && (
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                    collapsed ? "absolute -top-1 -right-1" : "ml-auto",
                    isActive ? "bg-white text-leaf-dark" : "bg-red-500 text-white"
                  )}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Acceso al panel administrativo: solo para quien tiene el rol. El
          middleware ya bloquea /admin, esto únicamente evita tener que
          escribir la URL a mano. */}
      {user.role === "ADMIN" && (
        <div className="px-3 pb-3">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border border-white/15 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Panel administrativo" : undefined}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">Panel administrativo</span>}
          </Link>
        </div>
      )}

      {/* User section */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-leaf rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
