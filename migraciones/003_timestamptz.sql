-- =============================================================================
--  Fundación Esperanza — Convertir las marcas de tiempo a `timestamptz`
--  Archivo : migraciones/003_timestamptz.sql
--  Uso     : Supabase → SQL Editor → pegar y ejecutar, DESPUÉS de 001 (y 002).
--
--  NO destructivo: conserva todos los datos.
--
--  POR QUÉ
--  -------
--  El esquema 001 usaba `timestamp(3)` (sin zona horaria) porque era el tipo
--  que Prisma esperaba. Al pasar la aplicación a supabase-js, PostgREST
--  devuelve esos valores como cadenas SIN indicador de zona:
--
--      "2026-08-27T04:20:57"
--
--  JavaScript interpreta una fecha ISO sin zona como hora LOCAL del navegador
--  o del servidor, mientras que la base las guarda en UTC. El resultado eran
--  fechas desplazadas por el huso horario (4 horas en República Dominicana),
--  lo que cambia el día mostrado en cualquier registro cercano a medianoche y
--  adelanta o atrasa la caducidad de los tokens de recuperación.
--
--  Con `timestamptz` PostgREST devuelve "2026-08-27T04:20:57+00:00" y
--  `new Date(...)` lo interpreta correctamente.
--
--  La cláusula `USING ... AT TIME ZONE 'UTC'` declara que los valores ya
--  almacenados estaban en UTC, que es como los escribió `current_timestamp`.
--
--  Es idempotente: volver a ejecutarlo sobre columnas ya convertidas no falla
--  ni altera los valores.
-- =============================================================================

begin;

-- users
alter table public.users
  alter column "emailVerified"   type timestamptz using "emailVerified"   at time zone 'UTC',
  alter column "birthDate"       type timestamptz using "birthDate"       at time zone 'UTC',
  alter column "acceptedTermsAt" type timestamptz using "acceptedTermsAt" at time zone 'UTC',
  alter column "createdAt"       type timestamptz using "createdAt"       at time zone 'UTC',
  alter column "updatedAt"       type timestamptz using "updatedAt"       at time zone 'UTC';

-- aid_requests
alter table public.aid_requests
  alter column "createdAt" type timestamptz using "createdAt" at time zone 'UTC',
  alter column "updatedAt" type timestamptz using "updatedAt" at time zone 'UTC';

-- aid_request_history
alter table public.aid_request_history
  alter column "createdAt" type timestamptz using "createdAt" at time zone 'UTC';

-- documents
alter table public.documents
  alter column "createdAt" type timestamptz using "createdAt" at time zone 'UTC';

-- notifications
alter table public.notifications
  alter column "createdAt" type timestamptz using "createdAt" at time zone 'UTC';

-- password_reset_tokens
alter table public.password_reset_tokens
  alter column "expiresAt" type timestamptz using "expiresAt" at time zone 'UTC',
  alter column "usedAt"    type timestamptz using "usedAt"    at time zone 'UTC',
  alter column "createdAt" type timestamptz using "createdAt" at time zone 'UTC';

-- email_verification_tokens
alter table public.email_verification_tokens
  alter column "expiresAt" type timestamptz using "expiresAt" at time zone 'UTC',
  alter column "usedAt"    type timestamptz using "usedAt"    at time zone 'UTC',
  alter column "createdAt" type timestamptz using "createdAt" at time zone 'UTC';

-- contact_messages
alter table public.contact_messages
  alter column "createdAt" type timestamptz using "createdAt" at time zone 'UTC';

commit;


-- ─── Verificación ────────────────────────────────────────────────────────────
-- Todas las filas deben mostrar tipo = 'timestamp with time zone'.

select
  table_name  as tabla,
  column_name as columna,
  data_type   as tipo
from information_schema.columns
where table_schema = 'public'
  and data_type like 'timestamp%'
order by table_name, column_name;
