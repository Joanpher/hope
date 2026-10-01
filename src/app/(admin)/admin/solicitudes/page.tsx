import { getAllAidRequests } from "@/server/queries/aid-request";
import Link from "next/link";
import { Search, ArrowRight, FileText, Phone, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_COLORS, AID_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { formatShortDate, phoneLinks } from "@/lib/utils";
import type { AidRequestStatus, AidType } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gestión de Solicitudes" };

const PAGE_SIZE = 15;

export default async function AdminSolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string; page?: string }>;
}) {
  const { q, status, type, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1") || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const { requests, total, pages: totalPages } = await getAllAidRequests({
    search: q,
    status: status ? (status as AidRequestStatus) : undefined,
    aidType: type ? (type as AidType) : undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const statusOptions = Object.entries(STATUS_LABELS);
  const typeOptions = Object.entries(AID_TYPE_LABELS);

  function buildUrl(params: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (type) p.set("type", type);
    if (page) p.set("page", page);
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    });
    return `/admin/solicitudes?${p.toString()}`;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Gestión de solicitudes</h1>
        <p className="text-ink-muted mt-1">{total} solicitud{total !== 1 ? "es" : ""} registrada{total !== 1 ? "s" : ""}.</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form method="get" action="/admin/solicitudes" className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar por código, nombre, correo..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-leaf/20 focus:border-leaf"
              />
            </div>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="px-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-leaf/20 focus:border-leaf bg-white min-w-[160px]"
            >
              <option value="">Todos los estados</option>
              {statusOptions.map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              name="type"
              defaultValue={type ?? ""}
              className="px-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-leaf/20 focus:border-leaf bg-white min-w-[160px]"
            >
              <option value="">Todos los tipos</option>
              {typeOptions.map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-5 py-2 brand-gradient text-white rounded-lg text-sm font-semibold hover:bg-leaf-dark transition-colors"
            >
              Filtrar
            </button>
            {(q || status || type) && (
              <Link href="/admin/solicitudes">
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
          {requests.length === 0 ? (
            <div className="empty-state py-16">
              <FileText className="w-10 h-10 text-line mb-3" />
              <p className="text-ink-muted">No se encontraron solicitudes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-mist">
                    {["Código", "Solicitante", "Teléfono", "Tipo de ayuda", "Fecha", "Estado", "Prioridad", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {requests.map((req) => {
                    // El teléfono indicado en la solicitud manda sobre el de la
                    // cuenta: es el que la persona dio para este caso concreto.
                    const phone = req.contactPhone ?? req.user.phone;
                    const links = phoneLinks(phone);
                    return (
                      <tr key={req.id} className="hover:bg-mist transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-bold text-navy">{req.code}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-ink">{req.user.firstName} {req.user.lastName}</p>
                            <p className="text-xs text-ink-muted">{req.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {links ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={links.tel}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf-dark hover:underline whitespace-nowrap"
                              >
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                {phone}
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
                          <span className="text-sm text-ink-muted">{AID_TYPE_LABELS[req.aidType]}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-ink-muted">{formatShortDate(req.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`status-badge ${STATUS_COLORS[req.status]}`}>{STATUS_LABELS[req.status]}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[req.priority]}`}>
                            {PRIORITY_LABELS[req.priority]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-ink-muted">
            Mostrando {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} de {total}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={buildUrl({ page: String(currentPage - 1) })}>
                <Button variant="outline" size="sm">Anterior</Button>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={buildUrl({ page: String(currentPage + 1) })}>
                <Button variant="outline" size="sm">Siguiente</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
