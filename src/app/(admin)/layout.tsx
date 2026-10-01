import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin | HopeRise Foundation", template: "%s | Admin" },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/acceso-denegado");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-mist md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
