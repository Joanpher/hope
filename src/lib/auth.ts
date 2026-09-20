import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// `authConfig` ya trae `secret`, `trustHost` y la estrategia de sesión, de
// modo que esta instancia y la que crea el middleware comparten exactamente la
// misma configuración: si divergieran, el middleware no podría verificar los
// JWT emitidos aquí y todas las rutas protegidas parecerían no autenticadas.
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
