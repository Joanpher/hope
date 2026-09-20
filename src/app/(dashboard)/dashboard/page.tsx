import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserAidRequests } from "@/server/queries/aid-request";
import { getUserNotifications } from "@/server/queries/notification";
import Link from "next/link";
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Bell,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_COLORS, AID_TYPE_LABELS } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";
import type { AidRequestStatus } from "@/types/database";

const ACTIVE_STATUSES: AidRequestStatus[] = [
  "RECEIVED", "IN_REVIEW", "PENDING_DOCS", "EVALUATION", "APPROVED", "PREPARING"
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [requests, notifications] = await Promise.all([
    getUserAidRequests(session.user.id),
    getUserNotifications(session.user.id, { onlyUnread: true, limit: 5 }),
  ]);

  const active = requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length;
  const completed = requests.filter((r) => r.status === "DELIVERED").length;
  const rejected = requests.filter((r) =>
    ["REJECTED", "CANCELLED"].includes(r.status)
  ).length;
  const total = requests.length;

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          ¡Hola, {session.user.firstName}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Aquí está el resumen de tus solicitudes de ayuda.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-5 h-5 text-blue-100" />
              <TrendingUp className="w-4 h-4 text-blue-200" />
            </div>
            <div className="text-3xl font-bold">{total}</div>
            <div className="text-sm text-blue-100 mt-1">Total solicitudes</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-5 h-5 text-amber-100" />
            </div>
            <div className="text-3xl font-bold">{active}</div>
            <div className="text-sm text-amber-100 mt-1">En progreso</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-400 to-green-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="text-3xl font-bold">{completed}</div>
            <div className="text-sm text-emerald-100 mt-1">Completadas</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-400 to-slate-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <XCircle className="w-5 h-5 text-slate-100" />
            </div>
            <div className="text-3xl font-bold">{rejected}</div>
            <div className="text-sm text-slate-200 mt-1">Rechazadas</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent requests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>Solicitudes recientes</CardTitle>
              <Link href="/solicitudes">
                <Button variant="ghost" size="sm">
                  Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentRequests.length === 0 ? (
                <div className="empty-state py-12">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No tienes solicitudes
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Aún no has creado ninguna solicitud de ayuda.
                  </p>
                  <Link href="/solicitudes/nueva">
                    <Button id="btn-new-request">
                      <PlusCircle className="w-4 h-4" />
                      Crear mi primera solicitud
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((req) => (
                    <Link
                      key={req.id}
                      href={`/solicitudes/${req.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">
                            {req.code}
                          </p>
                          <p className="text-xs text-slate-500">
                            {AID_TYPE_LABELS[req.aidType]} · {formatShortDate(req.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span
                          className={`status-badge ${STATUS_COLORS[req.status]}`}
                        >
                          {STATUS_LABELS[req.status]}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificaciones
                {notifications.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </CardTitle>
              <Link href="/notificaciones">
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Sin notificaciones nuevas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-blue-50 border border-blue-100"
                    >
                      <p className="text-sm font-semibold text-slate-900 mb-0.5">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick action */}
          <Card className="mt-4 brand-gradient border-0">
            <CardContent className="p-5 text-center">
              <PlusCircle className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="font-bold text-white mb-1">¿Necesitas ayuda?</h3>
              <p className="text-blue-100 text-xs mb-4">
                Crea una nueva solicitud y nuestro equipo la revisará.
              </p>
              <Link href="/solicitudes/nueva">
                <button className="w-full py-2 px-4 bg-white text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
                  Nueva solicitud
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
