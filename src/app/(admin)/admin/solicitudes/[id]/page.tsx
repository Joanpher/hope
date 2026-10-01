import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAidRequestForAdmin } from "@/server/queries/aid-request";
import Link from "next/link";
import {
  ArrowLeft, User, FileText, CheckCircle2, Calendar, Phone, MessageCircle,
  Mail, Lock, Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChangeForm } from "@/components/admin/status-change-form";
import { STATUS_LABELS, STATUS_COLORS, AID_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { formatDate, formatDateTime, formatCurrency, phoneLinks } from "@/lib/utils";
import { getCountryName } from "@/lib/countries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalle de Solicitud" };

/** Teléfono con enlaces de llamada y, si trae prefijo internacional, WhatsApp. */
function PhoneLine({ label, phone }: { label: string; phone: string | null }) {
  const links = phoneLinks(phone);
  return (
    <div>
      <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{label}</p>
      {links ? (
        <div className="flex items-center gap-3">
          <a
            href={links.tel}
            className="inline-flex items-center gap-1.5 text-base font-bold text-navy hover:text-leaf-dark"
          >
            <Phone className="w-4 h-4 flex-shrink-0" />
            {phone}
          </a>
          {links.whatsapp && (
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-leaf-dark hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          )}
        </div>
      ) : (
        <p className="text-base text-ink-muted">Sin teléfono registrado</p>
      )}
    </div>
  );
}

export default async function AdminSolicitudDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const { id } = await params;

  const request = await getAidRequestForAdmin(id);

  if (!request) notFound();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/solicitudes">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-line hover:bg-mist transition-colors">
            <ArrowLeft className="w-5 h-5 text-ink-muted" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-navy font-mono">{request.code}</h1>
            <span className={`status-badge ${STATUS_COLORS[request.status]}`}>
              {STATUS_LABELS[request.status]}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[request.priority]}`}>
              {PRIORITY_LABELS[request.priority]}
            </span>
          </div>
          <p className="text-ink-muted text-sm mt-0.5">{AID_TYPE_LABELS[request.aidType]}</p>
        </div>
        <a
          href={`/api/solicitudes/${request.id}/documento`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-leaf/40 hover:bg-leaf-soft/40 sm:flex"
        >
          <Download className="h-4 w-4" />
          Documento PDF
        </a>
      </div>

      {/* En móvil el botón del encabezado no cabe junto al código y el estado. */}
      <a
        href={`/api/solicitudes/${request.id}/documento`}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-navy sm:hidden"
      >
        <Download className="h-4 w-4" />
        Documento PDF del expediente
      </a>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contacto: lo primero que necesita quien va a gestionar el caso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4" /> Contacto del solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Nombre completo</p>
                <p className="text-base font-bold text-navy">
                  {request.user.firstName} {request.user.lastName}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <PhoneLine label="Teléfono para este caso" phone={request.contactPhone} />
                <PhoneLine label="Teléfono de la cuenta" phone={request.user.phone} />
              </div>

              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">Correo electrónico</p>
                <a
                  href={`mailto:${request.user.email}`}
                  className="inline-flex items-center gap-1.5 text-base text-navy hover:text-leaf-dark"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  {request.user.email}
                </a>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {[
                  { label: "Documento", value: request.user.documentId },
                  { label: "País", value: getCountryName(request.user.country) },
                  { label: "Ciudad", value: request.user.city ?? "—" },
                  { label: "Dirección de la cuenta", value: request.user.address ?? "—" },
                  { label: "Dirección para este caso", value: request.contactAddress ?? "—" },
                ].map((field) => (
                  <div key={field.label} className="bg-mist rounded-xl p-3">
                    <p className="text-xs text-ink-muted uppercase tracking-wider mb-0.5">{field.label}</p>
                    <p className="text-sm font-medium text-ink">{field.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Request info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" /> Detalles de la solicitud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "Código", value: request.code },
                  { label: "Fecha", value: formatDate(request.createdAt) },
                  { label: "Tipo de ayuda", value: AID_TYPE_LABELS[request.aidType] },
                  { label: "Monto solicitado", value: formatCurrency(request.requestedAmount) },
                  { label: "Personas en hogar", value: request.householdSize?.toString() ?? "—" },
                  { label: "Ingresos aprox.", value: formatCurrency(request.monthlyIncome) },
                ].map((f) => (
                  <div key={f.label} className="bg-mist rounded-xl p-3">
                    <p className="text-xs text-ink-muted uppercase tracking-wider mb-0.5">{f.label}</p>
                    <p className="text-sm font-medium text-ink">{f.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Descripción</p>
                <p className="text-sm text-ink bg-mist rounded-xl p-4 leading-relaxed whitespace-pre-wrap">{request.description}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Motivo</p>
                <p className="text-sm text-ink bg-mist rounded-xl p-4 leading-relaxed whitespace-pre-wrap">{request.reason}</p>
              </div>
              {request.observations && (
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">Observaciones</p>
                  <p className="text-sm text-ink bg-mist rounded-xl p-4 leading-relaxed whitespace-pre-wrap">{request.observations}</p>
                </div>
              )}
              {request.internalNotes && (
                <div>
                  <p className="text-xs text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Notas internas (no visibles para el solicitante)
                  </p>
                  <p className="text-sm text-ink bg-amber-50/70 border border-amber-100 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                    {request.internalNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" /> Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-line" />
                <div className="space-y-5">
                  {request.history.map((entry) => (
                    <div key={entry.id} className="flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-leaf-soft flex items-center justify-center flex-shrink-0 z-10">
                        <CheckCircle2 className="w-4 h-4 text-leaf" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-ink text-sm">{STATUS_LABELS[entry.newStatus]}</p>
                          <span className="text-xs text-ink-muted">{formatDateTime(entry.createdAt)}</span>
                        </div>
                        {entry.changedBy && (
                          <p className="text-xs text-ink-muted">Por: {entry.changedBy.firstName} {entry.changedBy.lastName}</p>
                        )}
                        {entry.userComment && (
                          <div className="mt-1.5 bg-mist border border-line rounded-xl p-2.5">
                            <p className="text-xs text-ink-muted mb-0.5">Comentario al usuario</p>
                            <p className="text-sm text-ink">{entry.userComment}</p>
                          </div>
                        )}
                        {entry.internalComment && (
                          <div className="mt-1.5 bg-amber-50/70 border border-amber-100 rounded-xl p-2.5">
                            <p className="text-xs text-amber-700 mb-0.5 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Nota interna
                            </p>
                            <p className="text-sm text-ink">{entry.internalComment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Status change */}
        <div>
          <StatusChangeForm
            requestId={id}
            currentStatus={request.status}
            userEmail={request.user.email}
          />
        </div>
      </div>
    </div>
  );
}
