import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Autenticación",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="HopeRise Foundation"
            className="h-10 w-auto object-contain bg-white rounded-lg p-1 shadow-sm transition-transform group-hover:scale-105"
          />
          <div>
            <span className="font-extrabold text-slate-900 text-base leading-none block">
              HopeRise
            </span>
            <span className="font-semibold text-xs text-emerald-600 uppercase tracking-wider">
              Foundation
            </span>
          </div>
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} HopeRise Foundation.{" "}
          <Link href="/privacidad" className="hover:text-slate-600 transition-colors">
            Privacidad
          </Link>{" "}
          ·{" "}
          <Link href="/terminos" className="hover:text-slate-600 transition-colors">
            Términos
          </Link>
        </p>
      </div>
    </div>
  );
}
