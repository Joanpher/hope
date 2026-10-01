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
    <div className="flex h-screen overflow-hidden bg-mist">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
