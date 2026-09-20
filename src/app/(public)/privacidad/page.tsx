import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de Privacidad de HopeRise Foundation",
};

export default function PrivacidadPage() {
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Política de Privacidad
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Última actualización: Septiembre 2026 — HopeRise Foundation
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                1. Información que recopilamos
              </h2>
              <p>
                En <strong>HopeRise Foundation</strong>, recopilamos la información personal
                necesaria para evaluar y procesar las solicitudes de ayuda social. Esto incluye
                nombres, datos de contacto, dirección, composición familiar e información socioeconómica.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                2. Uso de la información
              </h2>
              <p>
                La información recolectada se utiliza exclusivamente para:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Verificar la elegibilidad de los solicitantes de ayuda.</li>
                <li>Gestionar la entrega de beneficios y suministros de asistencia.</li>
                <li>Mantener contacto y notificar avances sobre el estado de la solicitud.</li>
                <li>Generar reportes estadísticos anónimos para transparencia de la fundación.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                3. Protecciones de seguridad y confidencialidad
              </h2>
              <p>
                Garantizamos que tus datos personales son tratados con absoluta confidencialidad y
                no serán vendidos, alquilados ni compartidos con terceros con fines comerciales.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                4. Contacto
              </h2>
              <p>
                Si tienes preguntas sobre esta política o el tratamiento de tus datos, puedes
                contactarnos en{" "}
                <a
                  href="mailto:info@hoperisefoundation.org"
                  className="text-blue-600 underline font-medium"
                >
                  info@hoperisefoundation.org
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
