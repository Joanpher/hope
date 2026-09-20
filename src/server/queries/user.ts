import { supabase, sanitizeFilterValue } from "@/lib/supabase";
import type { User, UserRole } from "@/types/database";

/** Normaliza un correo para que la búsqueda no dependa de mayúsculas. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw new Error(`Supabase: ${error.message}`);
  return data as User | null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Supabase: ${error.message}`);
  return data as User | null;
}

export type UserListRow = Pick<
  User,
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "documentId"
  | "role"
  | "isActive"
  | "createdAt"
> & { requestCount: number };

export async function getAllUsers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: UserListRow[]; total: number; pages: number }> {
  const { search, page = 1, limit = 20 } = params ?? {};
  const from = (page - 1) * limit;

  let query = supabase
    .from("users")
    .select(
      'id,firstName,lastName,email,phone,documentId,role,isActive,"createdAt"',
      { count: "exact" }
    );

  if (search) {
    const s = sanitizeFilterValue(search);
    if (s) {
      query = query.or(
        [
          `firstName.ilike.%${s}%`,
          `lastName.ilike.%${s}%`,
          `email.ilike.%${s}%`,
          `documentId.ilike.%${s}%`,
        ].join(",")
      );
    }
  }

  const { data, error, count } = await query
    .order("createdAt", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(`Supabase: ${error.message}`);

  const rows = (data ?? []) as Omit<UserListRow, "requestCount">[];

  // PostgREST no devuelve agregados por fila como el `_count` de Prisma, así
  // que se cuentan las solicitudes de los usuarios de esta página en una
  // segunda consulta y se tabulan en memoria.
  const counts = new Map<string, number>();
  if (rows.length > 0) {
    const { data: reqs, error: reqError } = await supabase
      .from("aid_requests")
      .select("userId")
      .in(
        "userId",
        rows.map((u) => u.id)
      );
    if (reqError) throw new Error(`Supabase: ${reqError.message}`);
    for (const r of (reqs ?? []) as { userId: string }[]) {
      counts.set(r.userId, (counts.get(r.userId) ?? 0) + 1);
    }
  }

  const total = count ?? 0;
  return {
    users: rows.map((u) => ({ ...u, requestCount: counts.get(u.id) ?? 0 })),
    total,
    pages: Math.ceil(total / limit),
  };
}

/** Cuenta filas de `users` aplicando filtros opcionales. */
async function countUsers(
  filters: Partial<Pick<User, "role" | "isActive">> = {}
): Promise<number> {
  let query = supabase.from("users").select("id", { count: "exact", head: true });
  if (filters.role !== undefined) query = query.eq("role", filters.role);
  if (filters.isActive !== undefined) query = query.eq("isActive", filters.isActive);

  const { count, error } = await query;
  if (error) throw new Error(`Supabase: ${error.message}`);
  return count ?? 0;
}

export async function getUserStats() {
  const [total, active, admins] = await Promise.all([
    countUsers(),
    countUsers({ isActive: true }),
    countUsers({ role: "ADMIN" }),
  ]);
  return { total, active, admins };
}

/** Número de usuarios con un rol concreto (tarjeta del panel admin). */
export function countUsersByRole(role: UserRole): Promise<number> {
  return countUsers({ role });
}
