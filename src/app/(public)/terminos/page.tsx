import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y Condiciones de HopeRise Foundation",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Términos y Condiciones
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Última actualización: Septiembre 2026 — HopeRise Foundation
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                1. Aceptación de los términos
              </h2>
              <p>
                Al acceder y utilizar la plataforma de <strong>HopeRise Foundation</strong>,
                aceptas cumplir con los presentes términos y condiciones de servicio.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                2. Veracidad de la información
              </h2>
              <p>
                Los usuarios que soliciten ayuda se comprometen a proveer datos verídicos,
                comprobables y precisos sobre su situación socioeconómica y personal. Proporcionar
                información falsa puede ser causa de rechazo o cancelación de las solicitudes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                3. Evaluación y aprobación de ayuda
              </h2>
              <p>
                La presentación de una solicitud no garantiza la aprobación automática de los beneficios.
                Cada caso es evaluado de manera justa e independiente por nuestro equipo de asistencia
                según la disponibilidad de recursos y la urgencia del caso.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                4. Uso de la cuenta
              </h2>
              <p>
                El usuario es responsable de mantener la confidencialidad de su contraseña de acceso
                y de las actividades realizadas dentro de su cuenta.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
