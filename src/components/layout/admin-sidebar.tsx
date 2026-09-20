"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Heart,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: FileText, exact: false },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-slate-900 sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-slate-800">
        <img
          src="/logo.png"
          alt="HopeRise Foundation"
          className="h-9 w-auto object-contain bg-white rounded-lg p-0.5 flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">
            HopeRise Foundation
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-emerald-400 font-medium">
              Panel Admin
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
