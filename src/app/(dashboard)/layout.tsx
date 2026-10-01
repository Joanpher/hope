import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { countUnreadNotifications } from "@/server/queries/notification";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const unreadCount = await countUnreadNotifications(session.user.id);

  return (
    // En móvil se apila: cabecera con el menú arriba y contenido debajo. De
    // `md` en adelante, barra lateral a la izquierda y contenido al lado.
    <div className="flex h-screen flex-col overflow-hidden bg-mist md:flex-row">
      <DashboardSidebar
        user={{
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          email: session.user.email ?? "",
          role: session.user.role,
        }}
        unreadCount={unreadCount}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
