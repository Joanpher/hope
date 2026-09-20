# 🤝 Fundación Esperanza — Sistema de Gestión de Solicitudes de Ayuda

Aplicación web para gestionar solicitudes de ayuda humanitaria: los beneficiarios
crean y siguen sus solicitudes, y la fundación las tramita desde un panel
administrativo con bitácora de auditoría.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase
(PostgreSQL) · NextAuth v5 · Zod · Resend

---

## Arranque rápido

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev
```

La base de datos se crea ejecutando los scripts de [`migraciones/`](./migraciones)
en el SQL Editor de Supabase, en orden: `001` → `002` (opcional) → `003`.
Ahí está documentado el esquema completo.

Con los datos demo cargados puedes entrar con `admin@fundaciondemo.com` /
`Admin@2026!`. Las credenciales completas están en
[`migraciones/README.md`](./migraciones/README.md).

---

## Variables de entorno

| Variable | Obligatoria | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL base del proyecto, **sin** `/rest/v1` |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave secreta de servidor. Se salta RLS |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Solo si algún día se consulta desde el navegador |
| `AUTH_SECRET` | Sí | Firma los JWT de sesión. Sin ella, el arranque falla en producción |
| `NEXTAUTH_URL` | Sí | URL pública de la app |
| `APP_URL` | Sí | Se usa para construir los enlaces de los correos |
| `RESEND_API_KEY` | No | Sin ella se omiten los envíos y se avisa por consola |
| `EMAIL_FROM` | No | Remitente de los correos |
| `APP_NAME`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL` | No | Textos de marca |

Genera `AUTH_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Despliegue en Vercel

1. **Importa el repositorio.** Vercel detecta Next.js solo; no hay que tocar
   Build Command ni Root Directory.
2. **Define las variables** de la tabla anterior en *Settings → Environment
   Variables*. `SUPABASE_SERVICE_ROLE_KEY` y `AUTH_SECRET` son secretas: no
   las marques como `NEXT_PUBLIC_`.
3. **Apunta las URL al dominio desplegado**, no a `localhost`:

   ```
   NEXTAUTH_URL = https://tu-proyecto.vercel.app
   APP_URL      = https://tu-proyecto.vercel.app
   NEXT_PUBLIC_APP_URL = https://tu-proyecto.vercel.app
   ```

   Si más adelante conectas un dominio propio, actualiza las tres.
4. **Vuelve a desplegar** tras cambiar variables: Vercel no las aplica en
   caliente.

> No hace falta configurar nada de red en Supabase: la app habla con la API REST
> por HTTPS, no con el puerto 5432.

---

## Arquitectura

```
src/
├── app/
│   ├── (public)/      Landing, contacto, términos, privacidad
│   ├── (auth)/        Login, registro, recuperación de contraseña
│   ├── (dashboard)/   Panel del beneficiario
│   └── (admin)/       Panel administrativo
├── components/        UI (Radix + Tailwind)
├── lib/
│   ├── supabase.ts    Cliente de servidor (service_role)
│   ├── auth.ts        NextAuth: credenciales + JWT
│   ├── email/         Plantillas y envío vía Resend
│   └── validations/   Esquemas Zod
├── server/
│   ├── queries/       Lecturas
│   └── actions/       Escrituras (Server Actions)
└── types/database.ts  Contrato de tipos con la base de datos
```

**Acceso a datos.** Todo pasa por `supabase-js` con la clave `service_role`,
únicamente desde Server Components y Server Actions. `src/lib/supabase.ts` lanza
un error si se importa desde el navegador.

**Seguridad.** Las 8 tablas tienen RLS activado sin políticas y los permisos
revocados para `anon` y `authenticated`, así que la clave pública de Supabase no
puede leer nada. La autorización real se comprueba contra la sesión de NextAuth
en cada consulta, y el middleware protege las rutas por rol.

**Roles.** Beneficiarios y administradores comparten la tabla `users` y se
distinguen por la columna `role`. Cada cambio de estado queda registrado en
`aid_request_history` junto con el administrador que lo hizo.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |

Las migraciones no tienen comando: son SQL que se ejecuta en Supabase.
