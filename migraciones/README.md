# Migraciones — Fundación Esperanza (Supabase)

Scripts SQL para reconstruir la base de datos del proyecto sobre **Supabase**.

| Archivo | Qué hace | ¿Obligatorio? |
|---|---|---|
| `001_esquema_inicial.sql` | Crea desde cero todo: 5 tipos ENUM, 8 tablas, 29 índices, 8 claves foráneas, 2 triggers y la configuración de seguridad (RLS + permisos). | Sí |
| `002_datos_demo.sql` | Carga datos de prueba: 7 usuarios (2 admin + 5 beneficiarios), 8 solicitudes con su bitácora completa, notificaciones y mensajes de contacto. | No |
| `003_timestamptz.sql` | Convierte las marcas de tiempo a `timestamptz`. No destructivo. | Sí |

`001` y `002` son **destructivos**: borran lo que haya antes. `003` conserva los datos.

Orden de ejecución: **001 → 002 (opcional) → 003**.

---

## 1. Ejecutar en Supabase

1. Entra a tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor** → **New query**.
2. Pega el contenido completo de `001_esquema_inicial.sql` y pulsa **Run**.
   Al final verás una tabla de verificación: deben aparecer **8 tablas, todas con `rls_activo = true`**.
3. (Opcional) Repite con `002_datos_demo.sql`.
   La verificación final debe dar: `users 7`, `aid_requests 8`, `aid_request_history 28`, `notifications 9`, `contact_messages 2`.

---

## 2. Conectar la aplicación

La aplicación usa **supabase-js**, no Prisma. Las credenciales van en `.env.local`
(ya creado, y está en `.gitignore`):

```env
NEXT_PUBLIC_SUPABASE_URL="https://TU_REF.supabase.co"   # sin /rest/v1
SUPABASE_SERVICE_ROLE_KEY="eyJ..."                      # secreta, solo servidor
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
AUTH_SECRET="..."
```

`.env.example` documenta todas las variables. Ya no existe `DATABASE_URL`: nada
se conecta por el puerto 5432/6543, todo pasa por la API REST de Supabase.

```powershell
npm install
npm run dev
```

**Por qué `service_role` y no `anon`.** La autenticación la maneja NextAuth
(credenciales + JWT), no Supabase Auth, así que no existe un usuario de Supabase
al que aplicar políticas RLS. Todas las consultas salen de Server Components o
Server Actions, donde la autorización se comprueba contra la sesión de NextAuth.
`src/lib/supabase.ts` lanza un error si alguien lo importa desde el navegador.

---

## 3. Migraciones a partir de ahora

Ya no hay `prisma migrate` ni `prisma db push`. Para cambiar el modelo:

1. Añade un `004_*.sql` en esta carpeta y ejecútalo en el SQL Editor.
2. Refleja el cambio en `src/types/database.ts`, que es el contrato de tipos
   entre la base y la aplicación.

## 4. Seguridad: por qué el script activa RLS

En Supabase el esquema `public` queda publicado por la API REST usando la clave `anon`, que es **pública por diseño** (viaja al navegador). Sin protección, cualquiera con esa clave podría descargar la tabla `users` completa: hashes de contraseña, correos, teléfonos y números de cédula de todos los beneficiarios.

El script cierra esa puerta con dos barreras:

1. `ENABLE ROW LEVEL SECURITY` en las 8 tablas **sin crear ninguna política** → denegación total para `anon` y `authenticated`.
2. `REVOKE ALL ... FROM anon, authenticated` sobre tablas, secuencias y funciones, más `ALTER DEFAULT PRIVILEGES` para que las tablas futuras nazcan cerradas.

Esto **no afecta a la aplicación**, que usa la clave `service_role`: ese rol conserva todos los permisos y se salta RLS.

> Comprobado contra la base real: con la clave `anon`, `select` sobre `users` devuelve `permission denied for table users`.

> El día que quieras consultar desde el navegador con la clave `anon`, habrá que escribir políticas RLS explícitas por tabla.

---

## 5. Credenciales de los datos demo

Solo para desarrollo. Los hashes son bcrypt reales de 12 rondas, verificados contra `bcryptjs`.

| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN | `admin@fundaciondemo.com` | `Admin@2026!` |
| ADMIN | `coordinador@fundaciondemo.com` | `Admin@2026!` |
| USER | `maria@demo.com` | `User@2026!` |
| USER | `carlos@demo.com` | `User@2026!` |
| USER | `ana@demo.com` | `User@2026!` |
| USER | `jose@demo.com` | `User@2026!` |
| USER | `laura@demo.com` | `User@2026!` |

Se incluyen **dos administradores** a propósito: la bitácora (`aid_request_history."changedById"`) guarda quién hizo cada cambio, y con un solo admin esa columna no se puede probar.

---

## 6. Estructura de la base de datos

```
users ───────────┬──< aid_requests ──┬──< aid_request_history  (auditoría)
  USER / ADMIN   │    AYU-AAAA-NNNNNN├──< documents            (adjuntos)
                 │                   └──< notifications
                 ├──< notifications
                 ├──< password_reset_tokens
                 ├──< email_verification_tokens
                 └──< aid_request_history  (como "changedById")

contact_messages   (independiente: formulario público, sin usuario)
```

**Multiusuario.** Beneficiarios y administradores comparten la tabla `users` y se distinguen por `role`. Un usuario puede tener N solicitudes; cada solicitud acumula N entradas de historial. Las acciones referenciales son:

- borrar un usuario arrastra sus solicitudes, notificaciones y tokens (`ON DELETE CASCADE`);
- borrar un administrador **no** borra la bitácora que generó: `changedById` pasa a `NULL` (`ON DELETE SET NULL`), así la auditoría nunca pierde registros.

---

## 7. Estado del código

### Ya resuelto en este refactor

- **Prisma eliminado.** Ya no existen `prisma/`, `src/lib/db.ts` ni `DATABASE_URL`.
  Los tipos que generaba Prisma viven ahora en `src/types/database.ts`.
- **`PrismaAdapter` retirado** de `src/lib/auth.ts`. Montaba un adaptador cuyas
  tablas (`Account`, `Session`, `VerificationToken`) nunca existieron; no fallaba
  solo porque la sesión es JWT con proveedor de credenciales.
- **Correo normalizado a minúsculas** al registrar y al iniciar sesión, en
  coherencia con los índices únicos sobre `lower(email)` y `lower("documentId")`.
- **Error de registro duplicado** ahora distingue si se repite el correo o el
  documento, en vez del antiguo *"La base de datos aún no está conectada"*.
- **Correo opcional de verdad.** `new Resend(clave)` se construía al cargar
  `src/lib/email/index.ts`, y sin `RESEND_API_KEY` lanzaba *"Missing API key"*
  durante el import, tumbando la página de registro completa aunque no se
  fuera a enviar nada. Ahora el cliente se crea bajo demanda: sin clave se
  omite el envío con un aviso en consola.
- **Fechas en UTC.** Ver `003_timestamptz.sql`: PostgREST devolvía marcas de
  tiempo sin zona horaria y JavaScript las leía como hora local, desviándolas 4
  horas. `toDate()` en `src/lib/utils.ts` lo corrige también en código, así que
  el resultado es correcto se haya ejecutado 003 o no.

### Pendiente

- **`documents`** — no hay subida de archivos; nada escribe en esta tabla.
  Cuando la implementes, sube el binario a Supabase Storage y guarda la ruta
  en `url`.
- **`contact_messages`** — el formulario público guarda mensajes, pero el panel
  admin no los lista. La columna `isRead` y su índice ya están.
- **`email_verification_tokens`** — la tabla existe y `emailVerified` también,
  pero no hay flujo de verificación de correo.
- **Gestión de usuarios** — `getAllUsers` y `getUserStats`
  (`src/server/queries/user.ts`) están escritas y funcionando, pero ninguna
  página las usa todavía.
- **`internalNotes`** — se guarda por solicitud, pero la plantilla del detalle
  administrativo no lo muestra en ninguna parte.
