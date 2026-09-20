import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserNotifications } from "@/server/queries/notification";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { Bell, CheckCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notificaciones" };

export default async function NotificacionesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await getUserNotifications(session.user.id, { limit: 50 });

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notificaciones
            {unread > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-sm font-bold">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">
            {unread > 0
              ? `Tienes ${unread} notificación${unread !== 1 ? "es" : ""} sin leer.`
              : "Todas las notificaciones leídas."}
          </p>
        </div>
      </div>

      <NotificationsList initialNotifications={notifications} />
    </div>
  );
}
