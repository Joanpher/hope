import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/lib/validations/auth";
import { getUserByEmail } from "@/server/queries/user";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/types/database";

/**
 * Secreto con el que se firman los JWT de sesión.
 *
 * Antes había un valor por defecto escrito en el código. Si `AUTH_SECRET`
 * faltaba en producción, NextAuth firmaba las sesiones con una cadena visible
 * en el repositorio y cualquiera habría podido fabricar un token de ADMIN
 * válido. Ahora su ausencia rompe el arranque en producción en vez de
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

export const authConfig: NextAuthConfig = {
  // Sin adaptador de base de datos: la sesión es un JWT firmado y el único
  // proveedor son credenciales verificadas contra la tabla `users`.
  session: { strategy: "jwt" },
  secret: resolveSecret(),

  // En producción, NextAuth v5 rechaza las peticiones con `UntrustedHost` si
  // no se le indica que puede fiarse de la cabecera Host. Suele deducirlo de
  // la variable VERCEL, pero declararlo explícitamente evita depender de esa
  // detección y permite probar el build de producción en local o desplegar en
  // otro proveedor sin sorpresas.
  //
  // Es seguro aquí: la app va detrás del proxy de Vercel, que normaliza el
  // Host, y el único proveedor es de credenciales, sin redirecciones OAuth que
  // pudieran filtrar un token hacia un dominio manipulado.
  trustHost: true,

  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;
        const user = await getUserByEmail(email);

        if (!user || !user.password) return null;
        if (!user.isActive) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & {
          role?: UserRole;
          firstName?: string;
          lastName?: string;
          isActive?: boolean;
        };
        token.role = u.role;
        token.firstName = u.firstName;
        token.lastName = u.lastName;
        token.isActive = u.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      if (session.user) {
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
};
