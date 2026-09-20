import { getAllAidRequests, getStatusCounts } from "@/server/queries/aid-request";
import { countUsersByRole } from "@/server/queries/user";
import Link from "next/link";
import {
  FileText, Users, CheckCircle2, XCircle, Clock, Package, Truck, ArrowRight,
  TrendingUp, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_COLORS, AID_TYPE_LABELS } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Administrativo" };

export default async function AdminDashboardPage() {
  const [statMap, recent, totalUsers] = await Promise.all([
    getStatusCounts(),
    getAllAidRequests({ limit: 8 }),
    countUsersByRole("USER"),
  ]);

  const recentRequests = recent.requests;
  const total = statMap.total;

  const statCards = [
    { label: "Total solicitudes", value: total, icon: FileText, color: "from-blue-500 to-blue-600" },
    { label: "Pendientes", value: (statMap["RECEIVED"] ?? 0) + (statMap["IN_REVIEW"] ?? 0) + (statMap["PENDING_DOCS"] ?? 0), icon: Clock, color: "from-amber-400 to-orange-500" },
    { label: "En evaluación", value: statMap["EVALUATION"] ?? 0, icon: AlertCircle, color: "from-purple-400 to-violet-600" },
    { label: "Aprobadas", value: statMap["APPROVED"] ?? 0, icon: CheckCircle2, color: "from-emerald-400 to-green-600" },
    { label: "Entregadas", value: statMap["DELIVERED"] ?? 0, icon: Truck, color: "from-teal-400 to-cyan-500" },
    { label: "Rechazadas", value: statMap["REJECTED"] ?? 0, icon: XCircle, color: "from-red-400 to-rose-600" },
    { label: "Preparando", value: statMap["PREPARING"] ?? 0, icon: Package, color: "from-indigo-400 to-blue-500" },
    { label: "Usuarios registrados", value: totalUsers, icon: Users, color: "from-slate-500 to-slate-700" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Administrativo</h1>
        <p className="text-slate-500 mt-1">Resumen del sistema de solicitudes de ayuda.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-0 shadow-sm overflow-hidden">
              <CardContent className={`p-5 bg-gradient-to-br ${card.color} text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-5 h-5 opacity-80" />
                  <TrendingUp className="w-4 h-4 opacity-50" />
                </div>
                <div className="text-3xl font-bold">{card.value}</div>
                <div className="text-sm opacity-80 mt-1">{card.label}</div>
              </CardContent>
            </Card>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Código", "Solicitante", "Tipo", "Fecha", "Estado", "Acción"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-3">
                      <span className="font-mono text-sm font-semibold text-slate-900">{req.code}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-slate-700">{req.user.firstName} {req.user.lastName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-slate-600">{AID_TYPE_LABELS[req.aidType]}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-slate-500">{formatShortDate(req.createdAt)}</span>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
