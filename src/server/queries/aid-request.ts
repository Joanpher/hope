import { supabase, sanitizeFilterValue } from "@/lib/supabase";
import { toDate } from "@/lib/utils";
import {
  AID_REQUEST_STATUSES,
  type AidRequestStatus,
  type AidRequestWithHistory,
  type AidRequestWithRelations,
  type AidRequestWithUser,
  type AidType,
  type HistoryWithAuthor,
  type Priority,
} from "@/types/database";

// ─── Fragmentos de `select` reutilizables ─────────────────────────────────────
//
// PostgREST resuelve las relaciones por el nombre de la clave foránea. Se
// nombran explícitamente (`users!aid_requests_userId_fkey`) porque `users`
// a secas sería ambiguo en las tablas con más de un enlace hacia usuarios.

const USER_SUMMARY =
  "id,firstName,lastName,email,phone,documentId,address,city,province";

const HISTORY_WITH_AUTHOR = `history:aid_request_history!aid_request_history_aidRequestId_fkey(
  *,
  changedBy:users!aid_request_history_changedById_fkey(firstName,lastName,email)
)`;

/**
 * PostgREST no garantiza el orden de las relaciones embebidas, así que la
 * bitácora se ordena en memoria. Son pocas filas por solicitud y evita
 * depender del parámetro `referencedTable`, que cambió de nombre entre
 * versiones de supabase-js.
 */
function sortHistory<T extends { history?: HistoryWithAuthor[] }>(row: T): T {
  if (Array.isArray(row.history)) {
    row.history.sort(
      (a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime()
    );
  }
  return row;
}

// ─── Consultas ────────────────────────────────────────────────────────────────

export async function getAidRequestByCode(
  code: string
): Promise<AidRequestWithRelations | null> {
  const { data, error } = await supabase
    .from("aid_requests")
    .select(
      `*,
       user:users!aid_requests_userId_fkey(${USER_SUMMARY}),
       ${HISTORY_WITH_AUTHOR},
       documents:documents!documents_aidRequestId_fkey(*)`
    )
    .eq("code", code)
    .maybeSingle();

  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!data) return null;
  return sortHistory(data as unknown as AidRequestWithRelations);
}

export async function getAidRequestById(
  id: string
): Promise<AidRequestWithRelations | null> {
  const { data, error } = await supabase
    .from("aid_requests")
    .select(
      `*,
       user:users!aid_requests_userId_fkey(${USER_SUMMARY}),
       ${HISTORY_WITH_AUTHOR},
       documents:documents!documents_aidRequestId_fkey(*)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!data) return null;
  return sortHistory(data as unknown as AidRequestWithRelations);
}

/** Detalle con el usuario completo, para el panel administrativo. */
export async function getAidRequestForAdmin(id: string) {
  const { data, error } = await supabase
    .from("aid_requests")
    .select(
      `*,
       user:users!aid_requests_userId_fkey(*),
       ${HISTORY_WITH_AUTHOR},
       documents:documents!documents_aidRequestId_fkey(*)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!data) return null;
  return sortHistory(data as unknown as AidRequestWithRelations);
}

/** Solicitud con su bitácora, sin datos del usuario (vista del beneficiario). */
export async function getAidRequestWithHistory(
  id: string
): Promise<AidRequestWithHistory | null> {
  const { data, error } = await supabase
    .from("aid_requests")
    .select(`*, ${HISTORY_WITH_AUTHOR}`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!data) return null;
  return sortHistory(data as unknown as AidRequestWithHistory);
}

export async function getUserAidRequests(
  userId: string
): Promise<AidRequestWithHistory[]> {
  const { data, error } = await supabase
    .from("aid_requests")
    .select(`*, ${HISTORY_WITH_AUTHOR}`)
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) throw new Error(`Supabase: ${error.message}`);

  return ((data ?? []) as unknown as AidRequestWithHistory[]).map(sortHistory);
}

/**
 * Busca los ids de usuario que coinciden con el término de búsqueda.
 * PostgREST no permite filtrar la tabla raíz por columnas de una relación
 * embebida dentro de un `or`, así que se resuelve en dos pasos.
 */
async function findMatchingUserIds(search: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .or(
      [
        `firstName.ilike.%${search}%`,
        `lastName.ilike.%${search}%`,
        `email.ilike.%${search}%`,
        `documentId.ilike.%${search}%`,
      ].join(",")
    );

  if (error) throw new Error(`Supabase: ${error.message}`);
  return ((data ?? []) as { id: string }[]).map((u) => u.id);
}

export async function getAllAidRequests(params?: {
  search?: string;
  status?: AidRequestStatus;
  aidType?: AidType;
  priority?: Priority;
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<{ requests: AidRequestWithUser[]; total: number; pages: number }> {
  const {
    search,
    status,
    aidType,
    priority,
    page = 1,
    limit = 20,
    dateFrom,
    dateTo,
  } = params ?? {};
  const from = (page - 1) * limit;

  let query = supabase
    .from("aid_requests")
    .select(
      `*, user:users!aid_requests_userId_fkey(firstName,lastName,email,documentId)`,
      { count: "exact" }
    );

  if (status) query = query.eq("status", status);
  if (aidType) query = query.eq("aidType", aidType);
  if (priority) query = query.eq("priority", priority);
  if (dateFrom) query = query.gte("createdAt", dateFrom.toISOString());
  if (dateTo) query = query.lte("createdAt", dateTo.toISOString());

  if (search) {
    const s = sanitizeFilterValue(search);
    if (s) {
      const conditions = [`code.ilike.%${s}%`];
      const userIds = await findMatchingUserIds(s);
      if (userIds.length > 0) {
        conditions.push(`userId.in.(${userIds.join(",")})`);
      }
      query = query.or(conditions.join(","));
    }
  }

  const { data, error, count } = await query
    .order("createdAt", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(`Supabase: ${error.message}`);

  const total = count ?? 0;
  return {
    requests: (data ?? []) as unknown as AidRequestWithUser[],
    total,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Recuento de solicitudes por estado. Sustituye al `groupBy` de Prisma: se
 * traen solo las columnas `status` y se tabulan en memoria, lo que cuesta una
 * única llamada en vez de nueve.
 */
export async function getStatusCounts(): Promise<
  Record<AidRequestStatus, number> & { total: number }
> {
  const { data, error } = await supabase.from("aid_requests").select("status");
  if (error) throw new Error(`Supabase: ${error.message}`);

  const rows = (data ?? []) as { status: AidRequestStatus }[];
  const counts = Object.fromEntries(
    AID_REQUEST_STATUSES.map((s) => [s, 0])
  ) as Record<AidRequestStatus, number>;

  for (const row of rows) counts[row.status] += 1;

  return { ...counts, total: rows.length };
}

/** Alias con el nombre que usaba la versión anterior. */
export const getAidRequestStats = getStatusCounts;

export async function getNextRequestSequence(): Promise<number> {
  const { count, error } = await supabase
    .from("aid_requests")
    .select("id", { count: "exact", head: true });

  if (error) throw new Error(`Supabase: ${error.message}`);
  return (count ?? 0) + 1;
}
