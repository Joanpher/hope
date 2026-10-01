import { getAllAidRequests, getStatusCounts } from "@/server/queries/aid-request";
import { countUsersByRole } from "@/server/queries/user";
import Link from "next/link";
import {
  FileText, Users, CheckCircle2, XCircle, Clock, Package, Truck, ArrowRight,
  AlertCircle, Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_COLORS, AID_TYPE_LABELS } from "@/lib/constants";
import { formatShortDate, phoneLinks } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Administrativo" };

export default async function AdminDashboardPage() {
  const [statMap, recent, totalUsers] = await Promise.all([
    getStatusCounts(),
    getAllAidRequests({ limit: 8 }),
    countUsersByRole("USER"),
  ]);

  const recentRequests = recent.requests;
  const pendientes =
    (statMap["RECEIVED"] ?? 0) +
    (statMap["IN_REVIEW"] ?? 0) +
    (statMap["PENDING_DOCS"] ?? 0);

  // Un solo acento de color por tarjeta, en el icono. El número se lee por
  // tamaño y contraste, no por el fondo.
  const statCards = [
    { label: "Total solicitudes", value: statMap.total, icon: FileText, tint: "bg-navy/10 text-navy", href: "/admin/solicitudes" },
    { label: "Pendientes", value: pendientes, icon: Clock, tint: "bg-amber-50 text-amber-600", href: "/admin/solicitudes?status=RECEIVED" },
    { label: "En evaluación", value: statMap["EVALUATION"] ?? 0, icon: AlertCircle, tint: "bg-navy/10 text-navy", href: "/admin/solicitudes?status=EVALUATION" },
    { label: "Aprobadas", value: statMap["APPROVED"] ?? 0, icon: CheckCircle2, tint: "bg-leaf-soft text-leaf-dark", href: "/admin/solicitudes?status=APPROVED" },
    { label: "Preparando", value: statMap["PREPARING"] ?? 0, icon: Package, tint: "bg-leaf-soft text-leaf-dark", href: "/admin/solicitudes?status=PREPARING" },
    { label: "Entregadas", value: statMap["DELIVERED"] ?? 0, icon: Truck, tint: "bg-leaf-soft text-leaf-dark", href: "/admin/solicitudes?status=DELIVERED" },
    { label: "Rechazadas", value: statMap["REJECTED"] ?? 0, icon: XCircle, tint: "bg-slate-100 text-slate-500", href: "/admin/solicitudes?status=REJECTED" },
    { label: "Beneficiarios", value: totalUsers, icon: Users, tint: "bg-navy/10 text-navy", href: "/admin/usuarios" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Dashboard administrativo</h1>
        <p className="text-ink-muted mt-1">Resumen del sistema de solicitudes de ayuda.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.tint}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-3xl font-bold text-navy">{card.value}</div>
                  <div className="text-sm text-ink-muted mt-1">{card.label}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent requests table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Solicitudes recientes</CardTitle>
          <Link href="/admin/solicitudes">
            <Button variant="outline" size="sm">
              Ver todas <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="empty-state py-12">
              <FileText className="w-10 h-10 text-line mb-3" />
              <p className="text-ink-muted text-sm">Todavía no hay solicitudes registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    {["Código", "Solicitante", "Teléfono", "Tipo", "Fecha", "Estado", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider py-3 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {recentRequests.map((req) => {
                    const phone = req.contactPhone ?? req.user.phone;
                    const links = phoneLinks(phone);
                    return (
                      <tr key={req.id} className="hover:bg-mist transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono text-sm font-semibold text-navy">{req.code}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sm text-ink">{req.user.firstName} {req.user.lastName}</span>
                        </td>
                        <td className="py-3 px-3">
                          {links ? (
                            <a href={links.tel} className="inline-flex items-center gap-1.5 text-sm text-leaf-dark font-medium hover:underline">
                              <Phone className="w-3.5 h-3.5" />
                              {phone}
                            </a>
                          ) : (
                            <span className="text-sm text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sm text-ink-muted">{AID_TYPE_LABELS[req.aidType]}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sm text-ink-muted">{formatShortDate(req.createdAt)}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`status-badge ${STATUS_COLORS[req.status]}`}>{STATUS_LABELS[req.status]}</span>
                        </td>
                        <td className="py-3 px-3">
                          <Link href={`/admin/solicitudes/${req.id}`}>
                            <Button variant="ghost" size="sm">Ver <ArrowRight className="w-3 h-3 ml-1" /></Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
