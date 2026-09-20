"use client";
import { useState, useTransition } from "react";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markNotificationRead, markAllNotificationsRead } from "@/server/actions/index";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/database";

interface NotificationsListProps {
  initialNotifications: Notification[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  if (notifications.length === 0) {
    return (
      <div className="empty-state bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Bell className="w-12 h-12 text-slate-200 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">Sin notificaciones</h3>
        <p className="text-slate-400 text-sm">
          Cuando haya actualizaciones en tus solicitudes, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div>
      {unread > 0 && (
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como leídas
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={cn(
              "transition-all",
              !n.isRead && "border-blue-200 bg-blue-50/50"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      n.isRead ? "bg-slate-100" : "bg-blue-100"
                    )}
                  >
                    <Bell
                      className={cn(
                        "w-4 h-4",
                        n.isRead ? "text-slate-400" : "text-blue-600"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          n.isRead ? "text-slate-600" : "text-slate-900"
                        )}
                      >
                        {n.title}
                        {!n.isRead && (
                          <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block" />
                        )}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(n.createdAt)}
                    </div>
                  </div>
                </div>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkRead(n.id)}
                    disabled={isPending}
                    className="flex-shrink-0"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
