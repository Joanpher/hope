import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";
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
    <div className="min-h-screen bg-mist flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link href="/" aria-label="HopeRise Foundation, inicio" className="inline-flex rounded-md p-1">
          <BrandLogo priority className="h-11 sm:h-12" />
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
