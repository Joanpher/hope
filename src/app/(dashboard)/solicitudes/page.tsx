import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserAidRequests } from "@/server/queries/aid-request";
import Link from "next/link";
import { FileText, PlusCircle, ArrowRight, Calendar, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS, AID_TYPE_LABELS, STATUS_FLOW, TERMINAL_STATUSES } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { AidRequestStatus } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis Solicitudes" };

const STATUS_BADGE_VARIANTS: Record<string, string> = {
  RECEIVED: "info",
  IN_REVIEW: "warning",
  PENDING_DOCS: "warning",
  EVALUATION: "info",
  APPROVED: "success",
  PREPARING: "success",
  DELIVERED: "success",
  REJECTED: "destructive",
  CANCELLED: "secondary",
};

function StatusProgress({ status }: { status: AidRequestStatus }) {
  if (TERMINAL_STATUSES.includes(status)) {
    return (
      <div className={`flex items-center gap-2 text-xs font-medium ${
        status === "REJECTED" ? "text-red-600" : "text-ink-muted"
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          status === "REJECTED" ? "bg-red-500" : "bg-slate-400"
        }`} />
        {STATUS_LABELS[status]}
      </div>
    );
  }
  const step = STATUS_FLOW.indexOf(status);
  const total = STATUS_FLOW.length - 1;
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-ink-muted mb-1">
        <span>{STATUS_LABELS[status]}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-line/60 rounded-full overflow-hidden">
        <div
          className="h-full brand-gradient rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { filter } = await searchParams;

  const allRequests = await getUserAidRequests(session.user.id);

  const filtered = allRequests.filter((r) => {
    if (!filter || filter === "all") return true;
    if (filter === "active") return ["RECEIVED","IN_REVIEW","PENDING_DOCS","EVALUATION","APPROVED","PREPARING"].includes(r.status);
    if (filter === "completed") return r.status === "DELIVERED";
    if (filter === "rejected") return ["REJECTED","CANCELLED"].includes(r.status);
    return true;
  });

  const tabs = [
    { key: "all", label: "Todas", count: allRequests.length },
    { key: "active", label: "En progreso", count: allRequests.filter(r => ["RECEIVED","IN_REVIEW","PENDING_DOCS","EVALUATION","APPROVED","PREPARING"].includes(r.status)).length },
    { key: "completed", label: "Completadas", count: allRequests.filter(r => r.status === "DELIVERED").length },
    { key: "rejected", label: "Rechazadas", count: allRequests.filter(r => ["REJECTED","CANCELLED"].includes(r.status)).length },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Mis Solicitudes</h1>
          <p className="text-ink-muted mt-1">Gestiona y consulta el estado de tus solicitudes de ayuda.</p>
        </div>
        <Link href="/solicitudes/nueva">
          <Button id="btn-nueva-solicitud">
            <PlusCircle className="w-4 h-4" />
            Nueva solicitud
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/solicitudes?filter=${tab.key}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              (filter === tab.key || (!filter && tab.key === "all"))
                ? "brand-gradient text-white shadow-md shadow-leaf/20"
                : "bg-white border border-line text-ink-muted hover:bg-mist"
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
              (filter === tab.key || (!filter && tab.key === "all"))
                ? "bg-white/20 text-white"
                : "bg-mist text-ink-muted"
            }`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state bg-white rounded-2xl border border-line shadow-sm">
          <div className="w-16 h-16 bg-leaf-soft rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-leaf" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-2">
            No tienes solicitudes en esta categoría
          </h3>
          <p className="text-ink-muted text-sm mb-6">
            {!filter || filter === "all"
              ? "Aún no has creado ninguna solicitud de ayuda."
              : "No hay solicitudes que coincidan con este filtro."}
          </p>
          {(!filter || filter === "all") && (
            <Link href="/solicitudes/nueva">
              <Button>
                <PlusCircle className="w-4 h-4" />
                Crear mi primera solicitud
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-ink font-mono">{req.code}</span>
                        <span
                          className={`status-badge ${STATUS_COLORS[req.status]}`}
                        >
                          {STATUS_LABELS[req.status]}
                        </span>
                      </div>
                      <p className="text-sm text-ink-muted mt-0.5">{AID_TYPE_LABELS[req.aidType]}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-ink-muted/70">
                        <Calendar className="w-3 h-3" />
                        {formatShortDate(req.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 sm:min-w-48">
                    <StatusProgress status={req.status} />
                    <Link href={`/solicitudes/${req.id}`}>
                      <Button variant="outline" size="sm">
                        Ver detalles <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
