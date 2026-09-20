import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAidRequestForAdmin } from "@/server/queries/aid-request";
import Link from "next/link";
import { ArrowLeft, User, FileText, MessageSquare, CheckCircle2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusChangeForm } from "@/components/admin/status-change-form";
import { STATUS_LABELS, STATUS_COLORS, AID_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalle de Solicitud" };

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
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/solicitudes">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 font-mono">{request.code}</h1>
            <span className={`status-badge ${STATUS_COLORS[request.status]}`}>
              {STATUS_LABELS[request.status]}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[request.priority]}`}>
              {PRIORITY_LABELS[request.priority]}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{AID_TYPE_LABELS[request.aidType]}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* User info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4" /> Información del solicitante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "Nombre completo", value: `${request.user.firstName} ${request.user.lastName}` },
                  { label: "Correo electrónico", value: request.user.email },
                  { label: "Teléfono", value: request.user.phone ?? "—" },
                  { label: "Documento", value: request.user.documentId },
                  { label: "Ciudad", value: request.user.city ?? "—" },
                  { label: "Dirección", value: request.user.address ?? "—" },
                ].map((field) => (
                  <div key={field.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{field.label}</p>
                    <p className="text-sm font-medium text-slate-900">{field.value}</p>
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
                  { label: "Monto solicitado", value: request.requestedAmount ? `RD$${request.requestedAmount}` : "—" },
                  { label: "Personas en hogar", value: request.householdSize?.toString() ?? "—" },
                  { label: "Ingresos aprox.", value: request.monthlyIncome ? `RD$${request.monthlyIncome}` : "—" },
                ].map((f) => (
                  <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                    <p className="text-sm font-medium text-slate-900">{f.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Descripción</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">{request.description}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Motivo</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">{request.reason}</p>
              </div>
              {request.observations && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Observaciones</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">{request.observations}</p>
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
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                <div className="space-y-5">
                  {request.history.map((entry) => (
                    <div key={entry.id} className="flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center flex-shrink-0 z-10">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900 text-sm">{STATUS_LABELS[entry.newStatus]}</p>
                          <span className="text-xs text-slate-400">{formatDateTime(entry.createdAt)}</span>
                        </div>
                        {entry.changedBy && (
                          <p className="text-xs text-slate-400">Por: {entry.changedBy.firstName} {entry.changedBy.lastName}</p>
                        )}
                        {entry.userComment && (
                          <div className="mt-1.5 bg-blue-50 border border-blue-100 rounded-xl p-2.5">
                            <p className="text-xs text-slate-400 mb-0.5">Comentario al usuario</p>
                            <p className="text-sm text-blue-800">{entry.userComment}</p>
                          </div>
                        )}
                        {entry.internalComment && (
                          <div className="mt-1.5 bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                            <p className="text-xs text-slate-400 mb-0.5">Nota interna</p>
                            <p className="text-sm text-amber-800">{entry.internalComment}</p>
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
