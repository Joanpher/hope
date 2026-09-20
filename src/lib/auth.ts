import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Secreto con el que se firman los JWT de sesión.
 *
 * Antes había aquí un valor por defecto en duro. Si `AUTH_SECRET` faltaba en
 * producción, NextAuth firmaba las sesiones con una cadena visible en el
 * repositorio: cualquiera podría haber fabricado un token de ADMIN válido.
 * Ahora la ausencia del secreto rompe el arranque en producción en lugar de
 * degradarse en silencio.
 */
function resolveSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Falta AUTH_SECRET. Defínela en las variables de entorno del despliegue " +
        '(genera una con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))").'
    );
  }

  console.warn(
    "[auth] AUTH_SECRET no definida: usando un secreto de desarrollo. " +
      "Nunca despliegues sin definirla."
  );
  return "dev-only-secret-not-for-production-use-at-all!!";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Sin adaptador de base de datos: la sesión es un JWT firmado y el único
  // proveedor son credenciales verificadas contra la tabla `users`.
  session: { strategy: "jwt" },
  secret: resolveSecret(),
  ...authConfig,
});
