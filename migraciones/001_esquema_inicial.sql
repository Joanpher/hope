-- =============================================================================
--  Fundación Esperanza — Esquema completo para Supabase (PostgreSQL)
--  Archivo : migraciones/001_esquema_inicial.sql
--  Uso     : Supabase -> SQL Editor -> pegar y ejecutar (Run)
--
--  DESTRUCTIVO: elimina las tablas y tipos previos del proyecto antes de
--  recrearlos. Solo se pierden los datos de prueba.
--
--  Este esquema replica exactamente lo que espera Prisma (prisma/schema.prisma):
--  nombres de tabla en snake_case, columnas en camelCase entrecomilladas,
--  tipos ENUM en PascalCase y nombres de indices/constraints con la convencion
--  de Prisma (<tabla>_<col>_key / _idx / _fkey). La aplicacion funciona sin
--  cambios apuntando DATABASE_URL a Supabase.
-- =============================================================================


-- ─── 1. Limpieza ─────────────────────────────────────────────────────────────
-- El orden no importa: CASCADE arrastra las dependencias.

drop table if exists public.aid_request_history       cascade;
drop table if exists public.documents                 cascade;
drop table if exists public.notifications             cascade;
drop table if exists public.password_reset_tokens     cascade;
drop table if exists public.email_verification_tokens cascade;
drop table if exists public.contact_messages          cascade;
drop table if exists public.aid_requests              cascade;
drop table if exists public.users                     cascade;

drop type if exists public."AidRequestStatus" cascade;
drop type if exists public."AidType"          cascade;
drop type if exists public."EmploymentStatus" cascade;
drop type if exists public."Priority"         cascade;
drop type if exists public."UserRole"         cascade;

drop function if exists public.set_updated_at() cascade;


-- ─── 2. Tipos enumerados ─────────────────────────────────────────────────────
-- Los nombres deben coincidir caracter a caracter con los enum de Prisma.

create type public."UserRole" as enum (
  'USER',
  'ADMIN'
);

create type public."AidRequestStatus" as enum (
  'RECEIVED',      -- Solicitud recibida
  'IN_REVIEW',     -- En revision
  'PENDING_DOCS',  -- Documentacion pendiente
  'EVALUATION',    -- En evaluacion
  'APPROVED',      -- Aprobada
  'PREPARING',     -- Preparando ayuda
  'DELIVERED',     -- Ayuda entregada
  'REJECTED',      -- Rechazada
  'CANCELLED'      -- Cancelada
);

create type public."AidType" as enum (
  'FOOD',
  'MEDICINE',
  'HEALTH',
  'EDUCATION',
  'HOUSING',
  'EMERGENCY',
  'ECONOMIC',
  'OTHER'
);

create type public."EmploymentStatus" as enum (
  'EMPLOYED',
  'UNEMPLOYED',
  'SELF_EMPLOYED',
  'RETIRED',
  'STUDENT',
  'OTHER'
);

create type public."Priority" as enum (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);


-- ─── 3. Funcion de apoyo: mantener "updatedAt" ───────────────────────────────
-- Prisma ya envia updatedAt en cada update (@updatedAt), pero el trigger
-- garantiza el valor si se editan filas desde el editor de Supabase o por SQL.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new."updatedAt" = current_timestamp;
  return new;
end;
$function$;


-- ─── 4. Tablas ───────────────────────────────────────────────────────────────

-- 4.1 users ── beneficiarios y administradores conviven en esta tabla,
--              diferenciados por la columna "role". Soporta N usuarios.
create table public.users (
  id                text              not null default gen_random_uuid()::text,
  email             text              not null,
  "emailVerified"   timestamp(3),
  password          text              not null,  -- hash bcrypt, nunca texto plano
  role              public."UserRole" not null default 'USER',
  "isActive"        boolean           not null default true,

  "firstName"       text              not null,
  "lastName"        text              not null,
  phone             text,
  "documentId"      text              not null,  -- cedula / documento de identidad
  "birthDate"       timestamp(3),
  address           text,
  city              text,
  province          text,

  "acceptedTerms"   boolean           not null default false,
  "acceptedTermsAt" timestamp(3),

  "createdAt"       timestamp(3)      not null default current_timestamp,
  "updatedAt"       timestamp(3)      not null default current_timestamp,

  constraint users_pkey primary key (id)
);

comment on table  public.users            is 'Usuarios del sistema: beneficiarios (USER) y administradores (ADMIN).';
comment on column public.users.password   is 'Hash bcrypt de 12 rondas generado por la aplicacion.';
comment on column public.users."isActive" is 'false bloquea el inicio de sesion sin borrar el historial del usuario.';


-- 4.2 aid_requests ── solicitud de ayuda; cada usuario puede tener varias.
create table public.aid_requests (
  id                 text not null default gen_random_uuid()::text,
  code               text not null,                 -- AYU-AAAA-NNNNNN
  status             public."AidRequestStatus" not null default 'RECEIVED',
  priority           public."Priority"         not null default 'MEDIUM',
  "aidType"          public."AidType"          not null,
  description        text not null,
  reason             text not null,
  "requestedAmount"  decimal(10,2),
  "householdSize"    integer,
  "employmentStatus" public."EmploymentStatus",
  "monthlyIncome"    decimal(10,2),
  "contactPhone"     text,
  "contactAddress"   text,
  observations       text,
  "internalNotes"    text,                          -- solo visible para ADMIN

  "userId"           text not null,

  "createdAt"        timestamp(3) not null default current_timestamp,
  "updatedAt"        timestamp(3) not null default current_timestamp,

  constraint aid_requests_pkey primary key (id),

  -- Rangos alineados con las validaciones Zod de src/lib/validations/index.ts
  constraint aid_requests_household_size_check
    check ("householdSize" is null or ("householdSize" >= 1 and "householdSize" <= 20)),
  constraint aid_requests_requested_amount_check
    check ("requestedAmount" is null or "requestedAmount" >= 0),
  constraint aid_requests_monthly_income_check
    check ("monthlyIncome" is null or "monthlyIncome" >= 0)
);

comment on table  public.aid_requests                 is 'Solicitudes de ayuda humanitaria.';
comment on column public.aid_requests.code            is 'Codigo publico unico con formato AYU-AAAA-NNNNNN.';
comment on column public.aid_requests."internalNotes" is 'Notas internas de la fundacion; no se muestran al beneficiario.';


-- 4.3 aid_request_history ── trazabilidad de cada cambio de estado (auditoria).
create table public.aid_request_history (
  id                text not null default gen_random_uuid()::text,
  "previousStatus"  public."AidRequestStatus",           -- null en el alta
  "newStatus"       public."AidRequestStatus" not null,
  description       text not null,
  "userComment"     text,                                -- visible al beneficiario
  "internalComment" text,                                -- solo ADMIN
  "changedById"     text,                                -- admin que hizo el cambio
  "aidRequestId"    text not null,
  "createdAt"       timestamp(3) not null default current_timestamp,

  constraint aid_request_history_pkey primary key (id)
);

comment on table  public.aid_request_history               is 'Bitacora de auditoria: un registro por cambio de estado.';
comment on column public.aid_request_history."changedById" is 'null cuando el cambio lo genera el sistema (alta de la solicitud).';


-- 4.4 documents ── archivos adjuntos a una solicitud.
create table public.documents (
  id             text not null default gen_random_uuid()::text,
  name           text not null,        -- nombre saneado para almacenamiento
  "originalName" text not null,        -- nombre tal como lo subio el usuario
  "mimeType"     text not null,
  size           integer not null,     -- bytes
  url            text not null,        -- ruta publica o firmada (Supabase Storage)
  "aidRequestId" text not null,
  "createdAt"    timestamp(3) not null default current_timestamp,

  constraint documents_pkey primary key (id),
  constraint documents_size_check check (size >= 0)
);

comment on table public.documents is 'Adjuntos de una solicitud. Los binarios van a Supabase Storage y la ruta en "url".';


-- 4.5 notifications ── avisos internos del sistema hacia el beneficiario.
create table public.notifications (
  id             text not null default gen_random_uuid()::text,
  title          text not null,
  message        text not null,
  "isRead"       boolean not null default false,
  "userId"       text not null,
  "aidRequestId" text,                 -- opcional: aviso no ligado a una solicitud
  "createdAt"    timestamp(3) not null default current_timestamp,

  constraint notifications_pkey primary key (id)
);

comment on table public.notifications is 'Notificaciones internas mostradas en /notificaciones y en el dashboard.';


-- 4.6 password_reset_tokens ── recuperacion de contrasena.
create table public.password_reset_tokens (
  id          text not null default gen_random_uuid()::text,
  token       text not null,           -- 64 hex (crypto.randomBytes(32))
  email       text not null,
  "userId"    text not null,
  "expiresAt" timestamp(3) not null,
  "usedAt"    timestamp(3),            -- no null = token consumido o invalidado
  "createdAt" timestamp(3) not null default current_timestamp,

  constraint password_reset_tokens_pkey primary key (id)
);

comment on table public.password_reset_tokens is 'Tokens de restablecimiento: caducan a 1 hora y son de un solo uso.';


-- 4.7 email_verification_tokens ── verificacion de correo.
create table public.email_verification_tokens (
  id          text not null default gen_random_uuid()::text,
  token       text not null,
  email       text not null,
  "userId"    text not null,
  "expiresAt" timestamp(3) not null,
  "usedAt"    timestamp(3),
  "createdAt" timestamp(3) not null default current_timestamp,

  constraint email_verification_tokens_pkey primary key (id)
);


-- 4.8 contact_messages ── formulario publico de contacto.
create table public.contact_messages (
  id          text not null default gen_random_uuid()::text,
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null,
  message     text not null,
  "isRead"    boolean not null default false,
  "createdAt" timestamp(3) not null default current_timestamp,

  constraint contact_messages_pkey primary key (id)
);

comment on table public.contact_messages is 'Mensajes del formulario publico /contacto. No requiere usuario registrado.';


-- ─── 5. Indices y restricciones de unicidad ──────────────────────────────────

-- users
create unique index users_email_key      on public.users (email);
create unique index "users_documentId_key" on public.users ("documentId");
-- Refuerzo anti-duplicados: impide registrar "Maria@x.com" si existe "maria@x.com".
create unique index users_email_lower_key        on public.users (lower(email));
create unique index "users_documentId_lower_key" on public.users (lower("documentId"));
-- Listados del panel administrativo (filtro por rol, orden por fecha).
create index users_role_idx        on public.users (role);
create index "users_createdAt_idx" on public.users ("createdAt" desc);

-- aid_requests
create unique index aid_requests_code_key on public.aid_requests (code);
create index "aid_requests_userId_idx" on public.aid_requests ("userId");
create index aid_requests_status_idx    on public.aid_requests (status);
create index aid_requests_code_idx      on public.aid_requests (code);
-- Soporte para el orden y los filtros del panel administrativo.
create index "aid_requests_createdAt_idx" on public.aid_requests ("createdAt" desc);
create index "aid_requests_aidType_idx"   on public.aid_requests ("aidType");
create index aid_requests_priority_idx    on public.aid_requests (priority);

-- aid_request_history
create index "aid_request_history_aidRequestId_idx" on public.aid_request_history ("aidRequestId");
create index "aid_request_history_changedById_idx"  on public.aid_request_history ("changedById");

-- documents
create index "documents_aidRequestId_idx" on public.documents ("aidRequestId");

-- notifications
create index "notifications_userId_idx"       on public.notifications ("userId");
create index "notifications_isRead_idx"       on public.notifications ("isRead");
create index "notifications_aidRequestId_idx" on public.notifications ("aidRequestId");
-- Contador de "no leidas" por usuario.
create index "notifications_userId_isRead_idx" on public.notifications ("userId", "isRead");

-- password_reset_tokens
create unique index password_reset_tokens_token_key on public.password_reset_tokens (token);
create index password_reset_tokens_token_idx    on public.password_reset_tokens (token);
create index password_reset_tokens_email_idx    on public.password_reset_tokens (email);
create index "password_reset_tokens_userId_idx" on public.password_reset_tokens ("userId");

-- email_verification_tokens
create unique index email_verification_tokens_token_key on public.email_verification_tokens (token);
create index email_verification_tokens_token_idx    on public.email_verification_tokens (token);
create index "email_verification_tokens_userId_idx" on public.email_verification_tokens ("userId");

-- contact_messages
create index "contact_messages_isRead_idx"    on public.contact_messages ("isRead");
create index "contact_messages_createdAt_idx" on public.contact_messages ("createdAt" desc);


-- ─── 6. Claves foraneas ──────────────────────────────────────────────────────
-- Las acciones referenciales replican las de Prisma:
--   relacion obligatoria con onDelete: Cascade  -> on delete cascade
--   relacion opcional sin onDelete explicito    -> on delete set null
--   en todos los casos                          -> on update cascade

alter table public.aid_requests
  add constraint "aid_requests_userId_fkey"
  foreign key ("userId") references public.users(id)
  on delete cascade on update cascade;

alter table public.aid_request_history
  add constraint "aid_request_history_aidRequestId_fkey"
  foreign key ("aidRequestId") references public.aid_requests(id)
  on delete cascade on update cascade;

-- El historial sobrevive al borrado del administrador que lo genero.
alter table public.aid_request_history
  add constraint "aid_request_history_changedById_fkey"
  foreign key ("changedById") references public.users(id)
  on delete set null on update cascade;

alter table public.documents
  add constraint "documents_aidRequestId_fkey"
  foreign key ("aidRequestId") references public.aid_requests(id)
  on delete cascade on update cascade;

alter table public.notifications
  add constraint "notifications_userId_fkey"
  foreign key ("userId") references public.users(id)
  on delete cascade on update cascade;

alter table public.notifications
  add constraint "notifications_aidRequestId_fkey"
  foreign key ("aidRequestId") references public.aid_requests(id)
  on delete set null on update cascade;

alter table public.password_reset_tokens
  add constraint "password_reset_tokens_userId_fkey"
  foreign key ("userId") references public.users(id)
  on delete cascade on update cascade;

alter table public.email_verification_tokens
  add constraint "email_verification_tokens_userId_fkey"
  foreign key ("userId") references public.users(id)
  on delete cascade on update cascade;


-- ─── 7. Triggers ─────────────────────────────────────────────────────────────

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger aid_requests_set_updated_at
  before update on public.aid_requests
  for each row execute function public.set_updated_at();


-- ─── 8. Seguridad: RLS y permisos ────────────────────────────────────────────
--
--  IMPORTANTE. En Supabase el esquema "public" queda expuesto por la API REST
--  con la clave anonima (anon), que es publica por diseno. Sin esta seccion,
--  cualquiera con esa clave podria leer la tabla users completa, incluidos los
--  hashes de contrasena y los documentos de identidad.
--
--  La aplicacion NO usa la API REST de Supabase: se conecta por Prisma con el
--  rol "postgres", que es dueno de las tablas y no esta sujeto a RLS. Cerrar el
--  acceso a anon/authenticated no la afecta en nada.
--
--  Se activa RLS y NO se crea ninguna politica: sin politicas, la negacion es
--  total para cualquier rol sujeto a RLS.

alter table public.users                     enable row level security;
alter table public.aid_requests              enable row level security;
alter table public.aid_request_history       enable row level security;
alter table public.documents                 enable row level security;
alter table public.notifications             enable row level security;
alter table public.password_reset_tokens     enable row level security;
alter table public.email_verification_tokens enable row level security;
alter table public.contact_messages          enable row level security;

-- Segunda barrera: retirar los permisos de tabla a los roles publicos.
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

-- Que las tablas creadas en el futuro nazcan igual de cerradas.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

-- service_role conserva acceso total (bypassea RLS) por si mas adelante se
-- anaden Edge Functions o tareas administrativas fuera de Prisma.
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;


-- ─── 9. Verificacion ─────────────────────────────────────────────────────────
-- Debe devolver 8 tablas, todas con rls_activo = true.

select
  c.relname        as tabla,
  c.relrowsecurity as rls_activo,
  (select count(*) from pg_indexes i
     where i.schemaname = 'public' and i.tablename = c.relname) as indices
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;
