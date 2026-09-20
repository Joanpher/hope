import Link from "next/link";
import { FileQuestion, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-scale-in">
        <div className="w-24 h-24 brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-5xl font-black text-white">404</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Página no encontrada</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          La página que buscas no existe o fue movida. Verifica la URL o regresa al inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 brand-gradient text-white rounded-xl font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Mi dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
