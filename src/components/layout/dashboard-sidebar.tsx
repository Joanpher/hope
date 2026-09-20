"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  User,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
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
        "hidden md:flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 sticky top-0 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 p-5 border-b border-slate-100",
          collapsed && "justify-center p-3"
        )}
      >
        <img
          src="/logo.png"
          alt="HopeRise Foundation"
          className="h-8 w-auto object-contain flex-shrink-0"
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900 truncate">
              HopeRise
            </p>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Foundation
            </p>
          </div>
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
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
                    isActive ? "bg-white text-blue-600" : "bg-red-500 text-white"
                  )}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200",
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
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-100 transition-colors",
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
