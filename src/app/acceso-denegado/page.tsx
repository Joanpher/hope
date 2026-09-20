import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function AccesoDenegadoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-scale-in">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Acceso denegado</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          No tienes permisos para acceder a esta sección. Si crees que es un error,
          contacta al administrador.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 brand-gradient text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Mi dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
