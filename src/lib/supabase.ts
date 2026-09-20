import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para uso EXCLUSIVO en el servidor.
 *
 * Usa la clave `service_role`, que se salta Row Level Security. Es la clave
 * correcta para esta aplicación porque la autenticación la maneja NextAuth
 * (credenciales + JWT), no Supabase Auth: no existe un usuario de Supabase al
 * que aplicar políticas RLS. Toda consulta pasa por Server Components o Server
 * Actions, donde la autorización se comprueba a mano contra la sesión.
 *
 * NUNCA importes este módulo desde un componente con "use client": filtraría
 * la clave al navegador. El guard de abajo lo convierte en un error ruidoso en
 * lugar de una fuga silenciosa.
 */
if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/supabase.ts se importó desde el navegador. Este módulo usa la " +
      "clave service_role y solo puede usarse en el servidor."
  );
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL.");
}
if (!serviceRoleKey) {
  throw new Error("Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY.");
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Limpia un término de búsqueda antes de interpolarlo en los filtros de
 * PostgREST (`or`, `ilike`). Las comas y los paréntesis separan condiciones y
 * romperían la consulta; `%` y `_` son comodines de LIKE que permitirían
 * ensanchar la búsqueda más allá de lo que el usuario escribió.
 */
export function sanitizeFilterValue(value: string): string {
  return value.replace(/[,()%_*\\"']/g, " ").trim();
}

/**
 * Desenvuelve una respuesta de Supabase y convierte el error en excepción,
 * para que un fallo de base de datos no pase desapercibido como `null`.
 */
export function unwrap<T>(result: {
  data: T;
  error: { message: string; code?: string } | null;
}): T {
  if (result.error) {
    throw new Error(`Supabase: ${result.error.message}`);
  }
  return result.data;
}

/** Código de PostgreSQL para violación de restricción única. */
export const UNIQUE_VIOLATION = "23505";
