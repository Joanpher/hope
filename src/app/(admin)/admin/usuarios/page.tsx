import { getAllUsers, getUserStats } from "@/server/queries/user";
import Link from "next/link";
import { Search, Users, Phone, MessageCircle, ShieldCheck, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";
import { formatShortDate, phoneLinks, getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usuarios" };

const PAGE_SIZE = 20;

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1") || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const [{ users, total, pages: totalPages }, stats] = await Promise.all([
    getAllUsers({ search: q, page: currentPage, limit: PAGE_SIZE }),
    getUserStats(),
  ]);

  function buildUrl(nextPage: number) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    p.set("page", String(nextPage));
    return `/admin/usuarios?${p.toString()}`;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Usuarios</h1>
        <p className="text-ink-muted mt-1">
          {total} cuenta{total !== 1 ? "s" : ""} registrada{total !== 1 ? "s" : ""}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: Users, tint: "bg-navy/10 text-navy" },
          { label: "Activos", value: stats.active, icon: ShieldCheck, tint: "bg-leaf-soft text-leaf-dark" },
          { label: "Administradores", value: stats.admins, icon: ShieldCheck, tint: "bg-amber-50 text-amber-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.tint}`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
              <div className="text-3xl font-bold text-navy">{stat.value}</div>
              <div className="text-sm text-ink-muted mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form method="get" action="/admin/usuarios" className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar por nombre, correo o documento..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-leaf/20 focus:border-leaf"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 brand-gradient text-white rounded-lg text-sm font-semibold hover:bg-leaf-dark transition-colors"
            >
              Buscar
            </button>
            {q && (
              <Link href="/admin/usuarios">
                <button type="button" className="px-4 py-2 border border-line text-ink-muted rounded-lg text-sm hover:bg-mist">
                  Limpiar
                </button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="empty-state py-16">
              <Users className="w-10 h-10 text-line mb-3" />
              <p className="text-ink-muted">No se encontraron usuarios.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-mist">
                    {["Persona", "Teléfono", "Documento", "Rol", "Solicitudes", "Alta", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {users.map((u) => {
                    const links = phoneLinks(u.phone);
                    return (
                      <tr key={u.id} className="hover:bg-mist transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-navy">
                                {getInitials(u.firstName, u.lastName)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-ink truncate">
                                {u.firstName} {u.lastName}
                                {!u.isActive && (
                                  <span className="ml-2 text-xs font-bold text-red-600">Inactivo</span>
                                )}
                              </p>
                              <p className="text-xs text-ink-muted truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {links ? (
                            <div className="flex items-center gap-2">
                              <a href={links.tel} className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf-dark hover:underline whitespace-nowrap">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                {u.phone}
                              </a>
                              {links.whatsapp && (
                                <a
                                  href={links.whatsapp}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Abrir en WhatsApp"
                                  className="text-ink-muted hover:text-leaf"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-ink-muted">{u.documentId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.role === "ADMIN"
                                ? "bg-navy/10 text-navy"
                                : "bg-mist text-ink-muted"
                            }`}
                          >
                            {ROLE_LABELS[u.role]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-ink">{u.requestCount}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-ink-muted">{formatShortDate(u.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          {u.requestCount > 0 && (
                            <Link href={`/admin/solicitudes?q=${encodeURIComponent(u.email)}`}>
                              <Button variant="ghost" size="sm">
                                <FileText className="w-3 h-3 mr-1" /> Solicitudes
                              </Button>
                            </Link>
                          )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-ink-muted">
            Mostrando {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} de {total}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={buildUrl(currentPage - 1)}>
                <Button variant="outline" size="sm">Anterior</Button>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={buildUrl(currentPage + 1)}>
                <Button variant="outline" size="sm">Siguiente</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
