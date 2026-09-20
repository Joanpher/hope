import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAidRequestWithHistory } from "@/server/queries/aid-request";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Clock, XCircle, Circle, Calendar,
  User, FileText, MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STATUS_LABELS, STATUS_COLORS, AID_TYPE_LABELS, STATUS_FLOW, TERMINAL_STATUSES
} from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { AidRequestStatus } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalle de Solicitud" };

function RequestStepper({ status }: { status: AidRequestStatus }) {
  const isTerminal = TERMINAL_STATUSES.includes(status);
  const currentStep = STATUS_FLOW.indexOf(status);

  if (isTerminal) {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        status === "REJECTED"
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-slate-50 border-slate-200 text-slate-600"
      }`}>
        <XCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">{STATUS_LABELS[status]}</p>
          <p className="text-sm opacity-75">
            {status === "REJECTED"
              ? "Esta solicitud no pudo ser aprobada."
              : "Esta solicitud fue cancelada."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200" />
        <div
          className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 transition-all"
          style={{ width: currentStep > 0 ? `${(currentStep / (STATUS_FLOW.length - 1)) * (100 - 40 / 6)}%` : "0%" }}
        />
        {STATUS_FLOW.map((s, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={s} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? "bg-green-500 border-green-500"
                    : isActive
                    ? "bg-blue-600 border-blue-600 ring-4 ring-blue-100"
                    : "bg-white border-slate-300"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isActive ? (
                  <Clock className="w-5 h-5 text-white" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <span
                className={`text-xs font-medium text-center max-w-[70px] leading-tight ${
                  isActive ? "text-blue-700" : isDone ? "text-green-700" : "text-slate-400"
                }`}
              >
                {STATUS_LABELS[s]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile stepper */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Progreso</span>
          <span className="text-sm font-semibold brand-gradient-text">
            Paso {currentStep + 1} de {STATUS_FLOW.length}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full brand-gradient rounded-full transition-all"
            style={{ width: `${((currentStep) / (STATUS_FLOW.length - 1)) * 100}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-blue-700 mt-2">{STATUS_LABELS[status]}</p>
      </div>
    </div>
  );
}

export default async function SolicitudDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const request = await getAidRequestWithHistory(id);

  if (!request) notFound();
  // IDOR protection: ensure user owns this request
  if (request.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/solicitudes");
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/solicitudes">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-mono">{request.code}</h1>
          <p className="text-slate-500 text-sm">{AID_TYPE_LABELS[request.aidType]}</p>
        </div>
        <div className="ml-auto">
          <span className={`status-badge ${STATUS_COLORS[request.status]}`}>
            {STATUS_LABELS[request.status]}
          </span>
        </div>
      </div>

      {/* Stepper */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Progreso de la solicitud</CardTitle>
          <p className="text-sm text-slate-500">
            Última actualización:{" "}
            {formatDateTime(request.updatedAt)}
          </p>
        </CardHeader>
        <CardContent>
          <RequestStepper status={request.status} />
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Detalles de la solicitud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Código</p>
              <p className="font-mono font-bold text-slate-900">{request.code}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fecha de registro</p>
              <p className="font-medium text-slate-900">{formatDate(request.createdAt)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tipo de ayuda</p>
              <p className="font-medium text-slate-900">{AID_TYPE_LABELS[request.aidType]}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estado actual</p>
              <span className={`status-badge ${STATUS_COLORS[request.status]}`}>
                {STATUS_LABELS[request.status]}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Descripción de la situación</p>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl text-sm">{request.description}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Motivo de la solicitud</p>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl text-sm">{request.reason}</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de actualizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="space-y-6">
              {request.history.map((entry, i) => (
                <div key={entry.id} className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center flex-shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {STATUS_LABELS[entry.newStatus as AidRequestStatus]}
                        </p>
                        {entry.changedBy && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3" />
                            {entry.changedBy.firstName} {entry.changedBy.lastName}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{entry.description}</p>
                    {entry.userComment && (
                      <div className="mt-2 flex gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">{entry.userComment}</p>
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
  );
}
